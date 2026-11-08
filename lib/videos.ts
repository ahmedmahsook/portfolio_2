// Cloud Name for public media delivery (safe to be public for client-side rendering)
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "driapshxj"

export interface CloudinaryVideoConfig {
  base: string
  titleOverride?: string
}

// Exactly 15 projects in their required sequence:
// First three new videos:
// 1. project-01
// 2. project-02
// 3. project-03
// Followed by all 12 original video projects in their original sequence.
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
]
