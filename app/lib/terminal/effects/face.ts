import { AudioAnalyzer } from "../audio/analyzer";
import {
  createBasicFaceMesh,
  morphTargets,
  FaceMesh,
  Vertex,
} from "./faceMesh";

// Define missing types
interface WebGLUniforms {
  uNoiseTexture: WebGLUniformLocation;
  uFaceTexture: WebGLUniformLocation;
  uVisibility: WebGLUniformLocation;
  uDistortion: WebGLUniformLocation;
  uModelViewMatrix: WebGLUniformLocation;
  uProjectionMatrix: WebGLUniformLocation;
}

interface ShaderProgram {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    textureCoord: number;
  };
  uniformLocations: WebGLUniforms;
}

export class FaceRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private audioAnalyzer: AudioAnalyzer;
  private shader!: ShaderProgram;
  private noiseTexture!: WebGLTexture;
  private faceTexture!: WebGLTexture;
  private morphTargets = morphTargets;
  private currentVisibility: number = 0;
  private mesh: FaceMesh;
  private vertexBuffer!: WebGLBuffer;
  private indexBuffer!: WebGLBuffer;
  private currentVertices: Float32Array;
  private indexCount: number;
  private uniforms: WebGLUniforms;

  // Shader sources
  private static readonly VERTEX_SHADER_SOURCE = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec2 vUv;
    
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vUv = aTextureCoord;
    }
  `;

  private static readonly FRAGMENT_SHADER_SOURCE = `
    precision mediump float;
    
    uniform sampler2D uNoiseTexture;
    uniform sampler2D uFaceTexture;
    uniform float uVisibility;
    uniform float uDistortion;
    
    varying vec2 vUv;
    
    void main() {
      vec2 distortedUV = vUv + texture2D(uNoiseTexture, vUv).rg * uDistortion;
      vec4 noise = texture2D(uNoiseTexture, distortedUV);
      
      // Make the face a more visible color with proper alpha
      vec4 face = vec4(0.2, 0.9, 0.9, uVisibility);
      
      // Add some shading
      float depth = 1.0 - (vUv.y * 0.5);
      face.rgb *= depth;
      
      // Blend between noise and face
      gl_FragColor = mix(noise, face, uVisibility);
    }
  `;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    })!;

    if (!this.gl) {
      throw new Error("WebGL not supported");
    }

    this.audioAnalyzer = new AudioAnalyzer();
    this.mesh = createBasicFaceMesh();
    this.currentVertices = new Float32Array(
      this.mesh.vertices.flatMap((v) => [v.x, v.y, v.z])
    );
    this.indexCount = this.mesh.indices.length;

    this.initShaders();
    this.uniforms = this.shader.uniformLocations;
    this.initTextures();
    this.initBuffers();
    this.setupGL();
  }

  private initShaders(): void {
    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      FaceRenderer.VERTEX_SHADER_SOURCE
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      FaceRenderer.FRAGMENT_SHADER_SOURCE
    );

    const shaderProgram = this.gl.createProgram()!;
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      throw new Error(
        "Shader program failed to link: " +
          this.gl.getProgramInfoLog(shaderProgram)
      );
    }

    this.shader = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(
          shaderProgram,
          "aVertexPosition"
        ),
        textureCoord: this.gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      },
      uniformLocations: {
        uNoiseTexture: this.gl.getUniformLocation(
          shaderProgram,
          "uNoiseTexture"
        )!,
        uFaceTexture: this.gl.getUniformLocation(
          shaderProgram,
          "uFaceTexture"
        )!,
        uVisibility: this.gl.getUniformLocation(shaderProgram, "uVisibility")!,
        uDistortion: this.gl.getUniformLocation(shaderProgram, "uDistortion")!,
        uModelViewMatrix: this.gl.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix"
        )!,
        uProjectionMatrix: this.gl.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix"
        )!,
      },
    };
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error("Shader compilation error: " + info);
    }

    return shader;
  }

  private initTextures(): void {
    // Create noise texture
    this.noiseTexture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      256,
      256,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.generateNoiseData()
    );
    this.setupTextureParameters();

    // Create face texture (could be loaded from an image)
    this.faceTexture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.faceTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    this.setupTextureParameters();
  }

  private setupTextureParameters(): void {
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
  }

  private generateNoiseData(): Uint8Array {
    const size = 256 * 256 * 4;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i += 4) {
      const value = Math.random() * 255;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255; // A
    }
    return data;
  }

  private setupGL(): void {
    const parent = this.canvas.parentElement!;
    const rect = parent.getBoundingClientRect();

    // Set canvas size
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Set viewport
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Enable depth testing and blending
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Create projection matrix (for 2D rendering)
    const projectionMatrix = new Float32Array([
      2 / this.canvas.width,
      0,
      0,
      0,
      0,
      -2 / this.canvas.height,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1,
    ]);

    // Create model view matrix (center and scale the face)
    const scale = 600; // Increased scale significantly
    const modelViewMatrix = new Float32Array([
      scale,
      0,
      0,
      0,
      0,
      scale,
      0,
      0,
      0,
      0,
      scale,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2 - 100,
      0,
      1, // Adjusted Y position up slightly
    ]);

    // Use shader program and set matrices
    this.gl.useProgram(this.shader.program);
    this.gl.uniformMatrix4fv(
      this.uniforms.uProjectionMatrix,
      false,
      projectionMatrix
    );
    this.gl.uniformMatrix4fv(
      this.uniforms.uModelViewMatrix,
      false,
      modelViewMatrix
    );
  }

  private async textToPhonemes(text: string): Promise<string[]> {
    // Simple phoneme mapping for now - could be more sophisticated
    return text.split("").map((char) => {
      const c = char.toLowerCase();
      if ("aeiou".includes(c)) return c.toUpperCase();
      if ("pbtdkg".includes(c)) return "M";
      if ("fvszh".includes(c)) return "F";
      return "neutral";
    });
  }

  private blendMorphTargets(target: Vertex[], influence: number): void {
    const targetArray = target.flatMap((v) => [v.x, v.y, v.z]);
    for (let i = 0; i < this.currentVertices.length; i++) {
      this.currentVertices[i] =
        this.currentVertices[i] * (1 - influence) + targetArray[i] * influence;
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.currentVertices,
      this.gl.DYNAMIC_DRAW
    );
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  public cleanup(): void {
    this.audioAnalyzer.cleanup();
    if (this.gl) {
      this.gl.deleteProgram(this.shader.program);
      this.gl.deleteBuffer(this.vertexBuffer);
      this.gl.deleteBuffer(this.indexBuffer);
      this.gl.deleteTexture(this.noiseTexture);
      this.gl.deleteTexture(this.faceTexture);
    }
  }

  public async speak(
    text: string,
    options: {
      intensity: number;
      speed: number;
      emotionHint?: "neutral" | "concerned" | "intrigued";
    }
  ) {
    const phonemes = await this.textToPhonemes(text);
    const duration = text.length * (1000 / options.speed); // Rough duration based on text length
    const startTime = performance.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          // Simulate mouth movement without audio
          const phoneticIndex = Math.floor(
            (progress * phonemes.length) % phonemes.length
          );
          const currentPhoneme = phonemes[phoneticIndex];
          const mouthOpenAmount = Math.sin(elapsed * 0.01) * 0.5 + 0.5; // Oscillate between 0 and 1

          this.updateMouthShape(
            currentPhoneme,
            mouthOpenAmount * options.intensity
          );
          this.addMicroExpressions(options.emotionHint);
          this.render();

          requestAnimationFrame(animate);
        } else {
          // Return to neutral expression
          this.updateMouthShape("neutral", 0);
          this.render();
          resolve();
        }
      };

      animate();
    });
  }

  public emergeFromStatic(duration: number = 3000): Promise<void> {
    console.log("Starting face emergence...");
    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in visibility
        this.currentVisibility = this.easeInOut(progress);
        console.log("Face visibility:", this.currentVisibility);

        // Add distortion that reduces as face emerges
        const distortion = (1 - progress) * 0.3;

        this.render(distortion);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log("Face emergence complete");
          resolve();
        }
      };

      animate();
    });
  }

  private updateMouthShape(phoneme: string, amplitude: number) {
    // Use morphTargets directly instead of phoneticShapes
    switch (phoneme) {
      case "A":
        this.blendMorphTargets(this.morphTargets.A, amplitude);
        break;
      case "O":
        this.blendMorphTargets(this.morphTargets.O, amplitude);
        break;
      case "E":
        this.blendMorphTargets(this.morphTargets.E, amplitude);
        break;
      default:
        // Default to neutral position
        this.blendMorphTargets(this.morphTargets.neutral, amplitude * 0.2);
    }
  }

  private addMicroExpressions(emotion: string = "neutral") {
    // Add subtle random movements to eyes, brows, etc
    const time = performance.now() * 0.001;
    const blinkFrequency = Math.sin(time * 0.5) * 0.5 + 0.5;

    // Update face mesh vertices with micro movements
    // This creates more natural, less robotic movement
  }

  private render(distortion: number = 0) {
    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Use shader program
    this.gl.useProgram(this.shader.program);

    // Update uniforms
    this.gl.uniform1f(this.uniforms.uVisibility, this.currentVisibility);
    this.gl.uniform1f(this.uniforms.uDistortion, distortion);

    // Draw face mesh
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(
      this.shader.attribLocations.vertexPosition,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.shader.attribLocations.vertexPosition);

    // Draw the face
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.indexCount,
      this.gl.UNSIGNED_SHORT,
      0
    );

    // Debug output
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.error("WebGL error:", error);
    }
  }

  private initBuffers() {
    // Create and bind vertex buffer
    this.vertexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.currentVertices,
      this.gl.DYNAMIC_DRAW
    );

    // Create and bind index buffer
    this.indexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.mesh.indices),
      this.gl.STATIC_DRAW
    );
  }

  private updateMorphTarget(target: number[], influence: number) {
    // Blend between current vertices and target
    for (let i = 0; i < this.currentVertices.length; i++) {
      this.currentVertices[i] =
        this.currentVertices[i] * (1 - influence) + target[i] * influence;
    }

    // Update vertex buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.currentVertices,
      this.gl.DYNAMIC_DRAW
    );
  }
}
