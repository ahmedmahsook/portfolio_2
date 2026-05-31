import { readdir } from "node:fs/promises"
import { join, basename, extname } from "node:path"

export const runtime = "nodejs"

// Supported extensions: .mp4, .MP4, .mov, .MOV
const SUPPORTED_EXTENSIONS = new Set([".mp4", ".mov"])

function isVideoFile(file: string) {
  const ext = extname(file).toLowerCase()
  return SUPPORTED_EXTENSIONS.has(ext)
}

function isSourceVideo(file: string) {
  // Exclude optimized copies (opt_*) and thumbnails (thumb_*)
  return !file.startsWith("opt_") && !file.startsWith("thumb_")
}

function videoBaseName(file: string) {
  return basename(file, extname(file))
}

async function listVideoPaths(subdir: string, urlPrefix: string) {
  // Use static branching so Vercel Node File Trace (NFT) statically compiles public/video/ and public/videos/ paths.
  let dir: string
  if (subdir === "video") {
    dir = join(process.cwd(), "public", "video")
  } else if (subdir === "videos") {
    dir = join(process.cwd(), "public", "videos")
  } else {
    dir = join(process.cwd(), "public", subdir)
  }

  try {
    const files = await readdir(dir)

    const sourceVideos = files
      .filter((f) => !f.startsWith("."))
      .filter(isSourceVideo)
      .filter(isVideoFile)

    // Deduplicate by base name — if IMG_0019.MOV and IMG_0019.mp4 both exist,
    // keep only one (prefer .mp4 over .mov for smaller file size)
    const byBase = new Map<string, string>()
    for (const f of sourceVideos) {
      const base = videoBaseName(f).toLowerCase()
      const existing = byBase.get(base)
      if (!existing) {
        byBase.set(base, f)
      } else {
        // Prefer .mp4 over .mov
        const existingExt = extname(existing).toLowerCase()
        const currentExt = extname(f).toLowerCase()
        if (currentExt === ".mp4" && existingExt !== ".mp4") {
          byBase.set(base, f)
        }
      }
    }

    const deduplicated = Array.from(byBase.values())
      .map((f) => `${urlPrefix}/${f}`)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))

    console.log(`[videos API] Scanned ${subdir}/ successfully:`)
    console.log(`  - Resolved directory path: ${dir}`)
    console.log(`  - Total files found: ${files.length}`)
    console.log(`  - Source videos (excl opt_/thumb_): ${sourceVideos.length}`)
    console.log(`  - After dedup by base name: ${deduplicated.length}`)
    console.log(`  - Videos:`, deduplicated)

    return deduplicated
  } catch (error: any) {
    console.error(`[videos API] Error reading directory for subdir "${subdir}" at resolved path "${dir}":`, error)
    return []
  }
}

export async function GET() {
  const fromVideoDir = await listVideoPaths("video", "/video")
  const fromVideosDir = await listVideoPaths("videos", "/videos")

  const videos = [...fromVideoDir, ...fromVideosDir]

  console.log(`[videos API] Total videos returned: ${videos.length}`)

  return Response.json({ videos })
}

