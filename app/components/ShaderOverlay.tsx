import { useEffect, useRef } from "react";

interface ShaderOverlayProps {
  active: boolean;
  fragmentShader?: string;
  duration?: number;
  sourceCanvas?: HTMLCanvasElement | null;
  onComplete?: () => void;
}

const DEFAULT_VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    // Flip Y for WebGL texture coords if needed, usually handled in shader
    vUv.y = 1.0 - vUv.y; 
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const DEFAULT_FRAGMENT_SHADER = `
  precision mediump float;
  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D u_texture;
  varying vec2 vUv;
  
  void main() {
    // Default pass-through
    vec4 color = texture2D(u_texture, vUv);
    gl_FragColor = color; 
  }
`;

export function ShaderOverlay({ active, fragmentShader, duration, sourceCanvas, onComplete }: ShaderOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const programRef = useRef<WebGLProgram | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // Try to get context with alpha: true to allow transparency if shader outputs it
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;

    // Resize logic
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    // Compile Shader
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vert = createShader(gl, gl.VERTEX_SHADER, DEFAULT_VERTEX_SHADER);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader || DEFAULT_FRAGMENT_SHADER);

    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Create Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set parameters for non-power-of-2 textures
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    // Fullscreen triangle strip
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = performance.now();

    // Animation Loop
    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      
      if (duration && elapsed > duration) {
        if (onComplete) onComplete();
        return;
      }

      // Update Uniforms
      const timeLocation = gl.getUniformLocation(program, "time");
      const resolutionLocation = gl.getUniformLocation(program, "resolution");
      const textureLocation = gl.getUniformLocation(program, "u_texture");
      
      gl.uniform1f(timeLocation, elapsed / 1000);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      
      // Bind and update texture from source canvas
      if (sourceCanvas && textureRef.current) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        // Update texture content
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
        gl.uniform1i(textureLocation, 0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Cleanup WebGL resources if needed
    };
  }, [active, fragmentShader, duration, onComplete, sourceCanvas]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      // Removed mix-blend-screen so it can fully replace/distort the underlying layer if alpha is opaque
      className="absolute inset-0 pointer-events-none z-30" 
      style={{ width: "100%", height: "100%" }}
    />
  );
}