import { readdir } from "node:fs/promises"
import { basename, extname } from "node:path"

export const runtime = "nodejs"

const SUPPORTED_EXTENSIONS = new Set([".mp4", ".mov", ".webm"])

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
  const dir = `${process.cwd()}/public/${subdir}`

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
        // Prefer .mp4 over .mov/.webm
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

    console.log(`[videos API] Scanned ${subdir}/:`)
    console.log(`  - Total files found: ${files.length}`)
    console.log(`  - Source videos (excl opt_/thumb_): ${sourceVideos.length}`)
    console.log(`  - After dedup by base name: ${deduplicated.length}`)
    console.log(`  - Videos:`, deduplicated)

    return deduplicated
  } catch {
    console.log(`[videos API] Directory ${subdir}/ not found or unreadable`)
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
