import { readdir } from "node:fs/promises"
import { basename, extname } from "node:path"

export const runtime = "nodejs"

function isVideoFile(file: string) {
  const ext = extname(file).toLowerCase()
  return ext === "" || ext === ".mp4" || ext === ".mov" || ext === ".webm"
}

function isPremiumNewVideo(file: string) {
  const name = basename(file, extname(file)).toLowerCase()
  return /^new\d+$/.test(name)
}

function premiumSortKey(path: string) {
  const name = basename(path, extname(path)).toLowerCase()
  const match = name.match(/^new(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY
}

async function listVideoPaths(
  subdir: string,
  urlPrefix: string,
  filter?: (file: string) => boolean
) {
  const dir = `${process.cwd()}/public/${subdir}`

  try {
    const files = await readdir(dir)
    return files
      .filter((f) => !f.startsWith(".") && !f.startsWith("opt_"))
      .filter(isVideoFile)
      .filter((f) => (filter ? filter(f) : true))
      .map((f) => `${urlPrefix}/${f}`)
  } catch {
    return []
  }
}

export async function GET() {
  // Premium drops: new1/new2/new3 in public/video (current setup)
  const fromVideoDir = await listVideoPaths("video", "/video", isPremiumNewVideo)
  // Optional folder: any videos dropped in public/videos
  const fromVideosDir = await listVideoPaths("videos", "/videos")

  const videos = [...fromVideoDir, ...fromVideosDir]
    .filter((path, index, all) => all.indexOf(path) === index)
    .sort((a, b) => {
      const aKey = premiumSortKey(a)
      const bKey = premiumSortKey(b)
      if (aKey !== bKey) return aKey - bKey
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    })

  return Response.json({ videos })
}
