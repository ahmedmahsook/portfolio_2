// Static list of all unique source videos in public/video.
// Each base name appears exactly once. Prefer .mp4 over .MOV/.mov for web playback.
// Using a static config avoids serverless filesystem scanning which causes Vercel bundle size issues.
export const videos = [
  "/video/IMG_0019.mp4",
  "/video/IMG_0772.MP4",
  "/video/IMG_2652.mp4",
  "/video/IMG_3024.MP4",
  "/video/IMG_3507.mp4",
  "/video/IMG_3956.mp4",
  "/video/IMG_3966.MP4",
  "/video/new1.mp4",
  "/video/new2.mp4",
  "/video/new3.mov",
  "/video/new4.MOV",
  "/video/new5.mp4",
]

