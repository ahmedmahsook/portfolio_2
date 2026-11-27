// Cloud Name for public media delivery (safe to be public for client-side rendering)
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "driapshxj"

export interface CloudinaryVideoConfig {
  base: string
  titleOverride?: string
}

// Unified list of portfolio videos:
// 1-15: Cloudinary hosted projects (portfolio/...)
// 16-21: Newly added local projects (/video/...)
export const videos: string[] = [
  "portfolio/project-01",
  "portfolio/project-02",
  "portfolio/project-03",
  "portfolio/IMG_0019",
  "portfolio/IMG_0772",
  "portfolio/IMG_2652",
  "portfolio/IMG_3024",
  "portfolio/IMG_3507",
  "portfolio/IMG_3956",
  "portfolio/IMG_3966",
  "portfolio/new1",
  "portfolio/new2",
  "portfolio/new3",
  "portfolio/new4",
  "portfolio/new5",
  "/video/IMG_2340.mov",
  "/video/IMG_3441.mp4",
  "/video/IMG_8112.mov",
  "/video/IMG_8858.mp4",
  "/video/IMG_9540.mov",
  "/video/IMG_9661.mp4",
]
