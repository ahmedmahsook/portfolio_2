/**
 * Direct Browser-to-Cloudinary Chunked Uploader
 * 
 * Bypasses Vercel servers completely for video binaries.
 * Supports large video files (100MB to 5GB+) via Cloudinary's chunked upload API.
 * Includes real-time progress, retry with exponential backoff, and cancellation.
 */

export interface UploadProgress {
  percent: number
  loadedBytes: number
  totalBytes: number
  chunkIndex: number
  totalChunks: number
  phase: 'signing' | 'uploading' | 'processing' | 'registering' | 'complete'
}

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  duration?: number
  width?: number
  height?: number
  format: string
  bytes: number
  created_at: string
}

export interface UploadOptions {
  file: File
  chunkSize?: number // default 20MB
  maxRetries?: number // default 3
  signal?: AbortSignal
  onProgress?: (progress: UploadProgress) => void
}

const DEFAULT_CHUNK_SIZE = 20 * 1024 * 1024 // 20 MB chunks

export async function uploadVideoDirectToCloudinary(options: UploadOptions): Promise<CloudinaryUploadResult> {
  const {
    file,
    chunkSize = DEFAULT_CHUNK_SIZE,
    maxRetries = 3,
    signal,
    onProgress,
  } = options

  // 1. Request signed upload parameters from our backend
  onProgress?.({
    percent: 0,
    loadedBytes: 0,
    totalBytes: file.size,
    chunkIndex: 0,
    totalChunks: Math.ceil(file.size / chunkSize),
    phase: 'signing',
  })

  const signResponse = await fetch('/api/upload/sign', {
    method: 'POST',
    signal,
  })

  if (!signResponse.ok) {
    const errorData = await signResponse.json().catch(() => ({}))
    throw new Error(errorData.error || `Upload authorization failed (HTTP ${signResponse.status}).`)
  }

  const { signature, timestamp, apiKey, folder, uploadUrl } = await signResponse.json()

  // 2. Prepare chunked upload metadata
  const totalBytes = file.size
  const totalChunks = Math.ceil(totalBytes / chunkSize)
  const uniqueUploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  let currentStart = 0
  let chunkIndex = 0
  let finalResult: CloudinaryUploadResult | null = null

  // 3. Upload chunks sequentially
  while (currentStart < totalBytes) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled by user.')
    }

    const currentEnd = Math.min(currentStart + chunkSize, totalBytes)
    const chunk = file.slice(currentStart, currentEnd)
    const isLastChunk = currentEnd === totalBytes

    let attempt = 0
    let success = false
    let lastError: any = null

    while (attempt < maxRetries && !success) {
      if (signal?.aborted) {
        throw new Error('Upload cancelled by user.')
      }

      attempt += 1

      try {
        const formData = new FormData()
        formData.append('file', chunk)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('folder', folder)

        // For chunked uploads Cloudinary requires Content-Range header
        const headers: Record<string, string> = {
          'X-Unique-Upload-Id': uniqueUploadId,
          'Content-Range': `bytes ${currentStart}-${currentEnd - 1}/${totalBytes}`,
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: formData,
          signal,
        })

        if (!uploadResponse.ok) {
          const errBody = await uploadResponse.text()
          throw new Error(`Cloudinary chunk ${chunkIndex + 1} upload failed (${uploadResponse.status}): ${errBody}`)
        }

        const responseJson = await uploadResponse.json()

        // Cloudinary returns the full asset data on the final chunk
        if (isLastChunk || responseJson.public_id) {
          finalResult = responseJson
        }

        success = true
      } catch (err: any) {
        lastError = err
        if (signal?.aborted) throw err

        if (attempt < maxRetries) {
          // Exponential backoff before retry: 1s, 2s, 4s...
          const backoffMs = Math.pow(2, attempt - 1) * 1000
          console.warn(`[CHUNK_UPLOAD] Chunk ${chunkIndex + 1} failed (attempt ${attempt}). Retrying in ${backoffMs}ms...`, err)
          await new Promise((res) => setTimeout(res, backoffMs))
        }
      }
    }

    if (!success) {
      throw new Error(`Chunk ${chunkIndex + 1} of ${totalChunks} failed after ${maxRetries} attempts: ${lastError?.message || 'Network error'}`)
    }

    currentStart = currentEnd
    chunkIndex += 1

    const percent = Math.min(Math.round((currentStart / totalBytes) * 100), 99)
    onProgress?.({
      percent,
      loadedBytes: currentStart,
      totalBytes,
      chunkIndex,
      totalChunks,
      phase: isLastChunk ? 'processing' : 'uploading',
    })
  }

  if (!finalResult || !finalResult.public_id) {
    throw new Error('Cloudinary finished upload but did not return asset metadata.')
  }

  return finalResult
}
