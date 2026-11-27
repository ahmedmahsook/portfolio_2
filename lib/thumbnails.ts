/**
 * Utility for generating high-performance, lightweight video poster candidate URLs
 * using Cloudinary on-the-fly transformations.
 */

export interface ThumbnailCandidate {
  id: string
  label: string
  timestampSec: number
  url: string
}

export function generateThumbnailCandidates(
  cloudinaryPublicId: string,
  duration?: number | null,
  cloudName: string = 'driapshxj'
): ThumbnailCandidate[] {
  const cleanBase = cloudinaryPublicId.replace(/^portfolio\//, '')

  let sampleTimes: { label: string; time: number }[] = []

  if (duration && duration > 0) {
    const d = duration
    // Proportionally distribute 7 candidate sample points across the duration
    const fractions = [0.05, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]
    sampleTimes = fractions.map((pct) => {
      const timeVal = +(d * pct).toFixed(1)
      return {
        label: `${timeVal}s`,
        time: timeVal,
      }
    })
  } else {
    // Standard timestamp offsets for short or duration-less clips
    sampleTimes = [
      { label: 'Start (0s)', time: 0 },
      { label: '0.5s', time: 0.5 },
      { label: '1.0s', time: 1.0 },
      { label: '1.5s', time: 1.5 },
      { label: '2.0s', time: 2.0 },
      { label: '3.0s', time: 3.0 },
      { label: '5.0s', time: 5.0 },
    ]
  }

  // Deduplicate times in case duration is very short (e.g. < 1s)
  const seenTimes = new Set<number>()
  const uniqueSamples = sampleTimes.filter((item) => {
    if (seenTimes.has(item.time)) return false
    seenTimes.add(item.time)
    return true
  })

  // Ensure at least one candidate exists
  if (uniqueSamples.length === 0) {
    uniqueSamples.push({ label: '1.0s', time: 1.0 })
  }

  return uniqueSamples.map((item, idx) => ({
    id: `candidate-${idx}-${item.time}`,
    label: item.label,
    timestampSec: item.time,
    url: `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto:eco,w_800,c_limit,so_${item.time}/portfolio/${cleanBase}.jpg`,
  }))
}

/**
 * Validates whether a poster URL is a legitimate, trusted URL.
 * Only accepts URLs belonging to the configured Cloudinary cloud name (image or video upload),
 * or legitimate internal relative paths (/video/thumb_opt_*.jpg).
 * Strictly rejects arbitrary external domains, protocols, or traversal attempts.
 */
export function isValidPosterUrl(url: string | null | undefined, cloudName: string = 'driapshxj'): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (trimmed.length > 500) return false

  // 1. Allow trusted relative path for local assets
  if (trimmed.startsWith('/video/thumb_opt_') && trimmed.endsWith('.jpg')) {
    return true
  }

  // 2. Reject legacy broken template (_poster.jpg on video)
  if (trimmed.includes('_poster.jpg')) {
    return false
  }

  // 3. Must match trusted Cloudinary domain and cloud name
  const trustedPrefix = `https://res.cloudinary.com/${cloudName}/`
  if (!trimmed.startsWith(trustedPrefix)) {
    return false
  }

  // 4. Must be an image or video upload transformation
  const pathPart = trimmed.slice(trustedPrefix.length)
  if (!pathPart.startsWith('image/upload/') && !pathPart.startsWith('video/upload/')) {
    return false
  }

  // 5. Reject dangerous characters or traversal
  if (pathPart.includes('..') || pathPart.includes('<') || pathPart.includes('>') || pathPart.includes('"')) {
    return false
  }

  // 6. Must have a valid image file extension
  const lower = trimmed.toLowerCase()
  if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png') && !lower.endsWith('.webp')) {
    return false
  }

  return true
}

/**
 * Resolves a reliable poster URL for a video.
 * Heals legacy broken URLs (e.g. ..._poster.jpg) and returns an optimized Cloudinary poster.
 */
export function resolvePosterUrl(
  posterUrl: string | null | undefined,
  videoRef: string,
  cloudName: string = 'driapshxj'
): string {
  const isBroken =
    !posterUrl ||
    posterUrl.includes('_poster.jpg') ||
    posterUrl.endsWith('.mp4') ||
    posterUrl.endsWith('.mov')

  if (!isBroken && posterUrl) {
    return posterUrl
  }

  const clean = videoRef
    .replace(/^portfolio\//, '')
    .replace(/^\/?video\//, '')
    .replace(/^opt_/, '')
    .replace(/^thumb_opt_/, '')
    .replace(/\.[^/.]+$/, '')

  if (videoRef.startsWith('portfolio/') || !videoRef.includes('/')) {
    return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto:eco,w_800,c_limit,so_1/portfolio/${clean}.jpg`
  }

  return `/video/thumb_opt_${clean}.jpg`
}
