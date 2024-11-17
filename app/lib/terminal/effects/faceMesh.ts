export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface FaceMesh {
  vertices: Vertex[];
  indices: number[];
  uvs: number[];
}

// Basic low-poly face mesh data
export const createBasicFaceMesh = (): FaceMesh => ({
  vertices: [
    // Face outline - larger and more defined
    { x: -0.6, y: 0.7, z: 0 }, // Left temple
    { x: 0.6, y: 0.7, z: 0 }, // Right temple
    { x: -0.7, y: 0.0, z: 0 }, // Left cheek
    { x: 0.7, y: 0.0, z: 0 }, // Right cheek
    { x: -0.5, y: -0.6, z: 0 }, // Left jaw
    { x: 0.5, y: -0.6, z: 0 }, // Right jaw
    { x: 0.0, y: -0.8, z: 0 }, // Chin

    // Eyes - larger and more defined
    { x: -0.3, y: 0.3, z: 0.1 }, // Left eye outer
    { x: -0.15, y: 0.3, z: 0.1 }, // Left eye inner
    { x: 0.15, y: 0.3, z: 0.1 }, // Right eye inner
    { x: 0.3, y: 0.3, z: 0.1 }, // Right eye outer

    // Mouth - larger with better definition
    { x: -0.3, y: -0.3, z: 0.1 }, // Left corner
    { x: -0.15, y: -0.3, z: 0.1 }, // Left mid
    { x: 0.0, y: -0.3, z: 0.1 }, // Center
    { x: 0.15, y: -0.3, z: 0.1 }, // Right mid
    { x: 0.3, y: -0.3, z: 0.1 }, // Right corner

    // Additional vertices for mouth movement
    { x: -0.15, y: -0.25, z: 0.1 }, // Upper lip left
    { x: 0.0, y: -0.25, z: 0.1 }, // Upper lip center
    { x: 0.15, y: -0.25, z: 0.1 }, // Upper lip right
    { x: -0.15, y: -0.35, z: 0.1 }, // Lower lip left
    { x: 0.0, y: -0.35, z: 0.1 }, // Lower lip center
    { x: 0.15, y: -0.35, z: 0.1 }, // Lower lip right
  ],

  // Define triangles using vertex indices
  indices: [
    // Face outline
    0,
    1,
    2, // Left temple to cheek
    1,
    3,
    2, // Right temple to cheek
    2,
    3,
    4, // Cheeks to jaw
    3,
    5,
    4, // Right cheek to jaw
    4,
    5,
    6, // Jaw to chin

    // Eyes (simple quads made of triangles)
    7,
    8,
    9, // Left eye
    8,
    9,
    10, // Right eye

    // Mouth (more complex triangulation for better deformation)
    11,
    12,
    16, // Left mouth corner
    12,
    13,
    17, // Left mouth middle
    13,
    14,
    18, // Center mouth
    14,
    15,
    19, // Right mouth middle
    15,
    16,
    20, // Right mouth corner
  ],

  // UV coordinates for texture mapping
  uvs: [
    // ... UV coordinates matching vertex count
    // These would map to a texture if we use one
  ],
});

// Morph targets for different expressions
export const morphTargets = {
  neutral: createBasicFaceMesh().vertices,

  // Phoneme shapes
  A: createBasicFaceMesh().vertices.map((v) => ({
    ...v,
    y: v.y + (v.y < -0.15 ? -0.1 : 0), // Open mouth
    z: v.z,
  })),

  O: createBasicFaceMesh().vertices.map((v) => ({
    ...v,
    x: v.x * (v.y < -0.15 ? 0.7 : 1), // Round mouth
    y: v.y + (v.y < -0.15 ? -0.05 : 0),
    z: v.z,
  })),

  E: createBasicFaceMesh().vertices.map((v) => ({
    ...v,
    x: v.x * (v.y < -0.15 ? 1.2 : 1), // Wide mouth
    y: v.y + (v.y < -0.15 ? -0.02 : 0),
    z: v.z,
  })),

  // Expressions
  blink: createBasicFaceMesh().vertices.map((v) => ({
    ...v,
    y: v.y + (v.y > 0.1 && v.y < 0.3 ? -0.1 : 0), // Close eyes
    z: v.z,
  })),

  concerned: createBasicFaceMesh().vertices.map((v) => ({
    ...v,
    y: v.y + (v.y < -0.15 ? -0.05 : 0), // Slight frown
    x: v.x * (v.y < -0.15 ? 0.9 : 1), // Tighter mouth
    z: v.z,
  })),
};
