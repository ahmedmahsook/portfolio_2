"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud,
  Film,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  LogOut,
  Sparkles,
  Layers,
  Tag as TagIcon,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  ImageIcon,
  ArrowLeft,
  Clock,
  Sparkle,
} from "lucide-react"
import {
  uploadVideoDirectToCloudinary,
  uploadCustomThumbnailToCloudinary,
  UploadProgress,
  CloudinaryUploadResult,
} from "@/lib/cloudinary-uploader"
import { generateThumbnailCandidates, ThumbnailCandidate } from "@/lib/thumbnails"
import { VideoCategory } from "@/lib/supabase"

const CATEGORIES: VideoCategory[] = ["Editing", "Marketing", "Motion"]

export default function UploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthPending, startAuthTransition] = useTransition()

  // Video selection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form metadata
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [category, setCategory] = useState<VideoCategory>("Editing")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(["Cinematic", "Color Grading"])

  // Multi-step lifecycle: "form" -> "thumbnail_selection" -> "published"
  const [currentStep, setCurrentStep] = useState<"form" | "thumbnail_selection">("form")
  const [uploadedVideoResult, setUploadedVideoResult] = useState<CloudinaryUploadResult | null>(null)
  const [thumbnailCandidates, setThumbnailCandidates] = useState<ThumbnailCandidate[]>([])
  const [selectedPosterUrl, setSelectedPosterUrl] = useState<string>("")
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null)
  const [isUploadingCustomThumb, setIsUploadingCustomThumb] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const customThumbInputRef = useRef<HTMLInputElement>(null)

  // Upload progress & feedback
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadStatusText, setUploadStatusText] = useState("")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [publishedProject, setPublishedProject] = useState<any | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. Check initial authentication
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => {
        setIsAuthenticated(res.ok)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    startAuthTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setAuthError(data.error || "Authentication failed.")
          return
        }

        setIsAuthenticated(true)
        setPassword("")
      } catch (err: any) {
        setAuthError("Network error. Please try again.")
      }
    })
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setIsAuthenticated(false)
      resetUploadForm()
    } catch {
      setIsAuthenticated(false)
    }
  }

  // Handle File Selection
  const handleFileChange = (file: File) => {
    setUploadError(null)
    setPublishedProject(null)

    // Validate video MIME type or extension
    const validExts = [".mp4", ".mov", ".m4v", ".webm"]
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!file.type.startsWith("video/") && !hasValidExt) {
      setUploadError("Unsupported format. Please select an MP4, MOV, or WEBM video file.")
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(url)

    // Auto-populate title if empty from clean filename
    if (!title) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      setTitle(cleanName)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // Tag management
  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Reset form
  const resetUploadForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setTitle("")
    setSubtitle("")
    setDescription("")
    setTags(["Cinematic", "Color Grading"])
    setUploadProgress(null)
    setUploadStatusText("")
    setUploadError(null)
    setUploadedVideoResult(null)
    setThumbnailCandidates([])
    setSelectedPosterUrl("")
    setCustomThumbnailUrl(null)
    setCurrentStep("form")
  }

  // Cancel Upload
  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsUploading(false)
      setUploadStatusText("Upload cancelled.")
    }
  }

  // Direct Browser-to-Cloudinary Upload Execution
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    if (!title.trim()) {
      setUploadError("Please provide a title for the video.")
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setPublishedProject(null)
    setUploadStatusText("Initiating secure upload authorization...")

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // 1. Direct signed chunked upload to Cloudinary (bypassing Vercel)
      const cloudinaryResult = await uploadVideoDirectToCloudinary({
        file: selectedFile,
        signal: abortController.signal,
        onProgress: (p) => {
          setUploadProgress(p)
          if (p.phase === "signing") {
            setUploadStatusText("Requesting signed upload parameters from server...")
          } else if (p.phase === "uploading") {
            const mbLoaded = (p.loadedBytes / (1024 * 1024)).toFixed(1)
            const mbTotal = (p.totalBytes / (1024 * 1024)).toFixed(1)
            setUploadStatusText(
              `Uploading directly to Cloudinary: ${p.percent}% (${mbLoaded} MB / ${mbTotal} MB) — Chunk ${p.chunkIndex}/${p.totalChunks}`
            )
          } else if (p.phase === "processing") {
            setUploadStatusText("Cloudinary processing video stream and generating posters...")
          }
        },
      })

      // 2. Generate multiple thumbnail candidates at different timestamps
      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME ||
        "driapshxj"
      const candidates = generateThumbnailCandidates(
        cloudinaryResult.public_id,
        cloudinaryResult.duration,
        cloudName
      )

      setUploadedVideoResult(cloudinaryResult)
      setThumbnailCandidates(candidates)

      // Default to candidates[1] (approx 0.5s-1s) to avoid black fade-in frame at 0.0s
      const initialPoster = candidates[1]?.url || candidates[0]?.url || ""
      setSelectedPosterUrl(initialPoster)

      // Move to Step 2: Thumbnail Selection
      setCurrentStep("thumbnail_selection")
      setUploadStatusText("Video uploaded! Please select your preferred portfolio cover thumbnail.")
    } catch (err: any) {
      if (err.message === "Upload cancelled by user.") {
        setUploadStatusText("Upload was cancelled.")
      } else {
        console.error("[UPLOAD_ERROR]", err)
        setUploadError(err.message || "An unexpected error occurred during upload.")
      }
    } finally {
      setIsUploading(false)
      abortControllerRef.current = null
    }
  }

  // Handle Custom Thumbnail Upload
  const handleCustomThumbnailChange = async (file: File) => {
    if (!file) return
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validImageTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPG, PNG, or WebP).")
      return
    }

    setIsUploadingCustomThumb(true)
    setUploadError(null)

    try {
      const res = await uploadCustomThumbnailToCloudinary(file)
      setCustomThumbnailUrl(res.poster_url)
      setSelectedPosterUrl(res.poster_url)
    } catch (err: any) {
      console.error("[CUSTOM_THUMBNAIL_ERROR]", err)
      setUploadError(err.message || "Failed to upload custom thumbnail.")
    } finally {
      setIsUploadingCustomThumb(false)
    }
  }

  // Register Video with Supabase after Thumbnail is Confirmed
  const handleFinalPublish = async () => {
    if (!uploadedVideoResult) return
    setIsRegistering(true)
    setUploadError(null)

    try {
      const registerRes = await fetch("/api/videos/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudinary_public_id: uploadedVideoResult.public_id,
          title: title.trim(),
          subtitle: subtitle.trim(),
          category,
          description: description.trim(),
          tags,
          duration: uploadedVideoResult.duration,
          width: uploadedVideoResult.width,
          height: uploadedVideoResult.height,
          poster_url: selectedPosterUrl,
        }),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        throw new Error(registerData.error || "Failed to register video record in database.")
      }

      setPublishedProject(
        registerData.project || {
          title,
          category,
          poster_url: selectedPosterUrl,
        }
      )
      resetUploadForm()
    } catch (err: any) {
      console.error("[REGISTER_ERROR]", err)
      setUploadError(err.message || "Failed to publish video to portfolio.")
    } finally {
      setIsRegistering(false)
    }
  }

  // ----------------------------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------------------------
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#140b07] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#d97706] animate-spin" />
          <p className="text-white/40 text-xs tracking-widest uppercase">Verifying Studio Access...</p>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // View 1: Unauthenticated Login Form
  // ----------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140b07] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Atmosphere Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d97706]/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl relative z-10 border border-white/10 bg-[#1c120c]/80 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#d97706]/15 border border-[#d97706]/30 flex items-center justify-center mb-4 text-[#fbbf24]">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] tracking-[0.25em] text-[#d97706] uppercase font-semibold mb-1">
              Private Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white/95">Studio Video Upload</h1>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              Enter your owner passcode to manage and upload portfolio videos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode..."
                  required
                  disabled={isAuthPending}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthPending || !password}
              className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-[#fbbf24] to-[#d97706] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d97706]/20 flex items-center justify-center gap-2"
            >
              {isAuthPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Studio Portal</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // View 2: Authenticated Video Studio Upload Portal
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#140b07] text-white p-4 sm:p-6 lg:p-10 relative overflow-x-hidden">
      {/* Ambient background blur */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#d97706]/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-8 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#fbbf24]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Private Video Studio</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase bg-[#d97706]/20 text-[#fbbf24] border border-[#d97706]/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-white/40">Direct-to-Cloudinary upload pipeline with Supabase metadata</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/upload/manage"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d97706]/20 hover:bg-[#d97706]/30 border border-[#d97706]/40 text-xs text-[#fbbf24] transition-all font-medium"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Manage Videos</span>
            </a>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
            >
              <span>View Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Success Banner */}
        <AnimatePresence>
          {publishedProject && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/40"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-200 text-sm sm:text-base">
                    &quot;{publishedProject.title}&quot; Successfully Published!
                  </h3>
                  <p className="text-xs text-emerald-300/60 mt-0.5">
                    Your video is live in the portfolio gallery with your selected high-performance poster thumbnail.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href="/#projects"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>See in Gallery</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/80 transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Error Banner */}
        {uploadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* STEP 1: Video File & Metadata Form */}
        {currentStep === "form" && (
          <form onSubmit={handleUploadSubmit} className="space-y-8">
            {/* Section 1: Dropzone & File Selection */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1c120c]/70 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">1. Select Video Footage</h2>
                  <p className="text-xs text-white/40">Direct chunked upload handles large files (MP4, MOV, WEBM)</p>
                </div>
                {selectedFile && !isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove file</span>
                  </button>
                )}
              </div>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#fbbf24] bg-[#fbbf24]/5 scale-[0.99]"
                      : "border-white/15 hover:border-white/30 bg-black/20 hover:bg-black/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fbbf24] mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-white/90 mb-1">Drag and drop your video file here</h3>
                  <p className="text-xs text-white/40 max-w-sm mb-4">
                    Or click to browse from your computer. Large camera masters and exports are supported via chunked upload.
                  </p>
                  <span className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 transition-colors">
                    Browse Files
                  </span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Video Preview Player */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
                    {previewUrl && (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* File Metadata Overview */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">File Name:</span>
                        <span className="font-mono text-white/80 truncate max-w-[180px]">{selectedFile.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">File Size:</span>
                        <span className="font-mono text-white/80">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Type:</span>
                        <span className="font-mono text-white/80">{selectedFile.type || "video/mp4"}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#fbbf24]/80 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thumbnails will be automatically generated after video upload.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Metadata Details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1c120c]/70 border border-white/10 backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">2. Project Details</h2>
                <p className="text-xs text-white/40">Displayed in the public editorial gallery</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Velvet Horizon"
                    required
                    disabled={isUploading}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-2">Subtitle / Genre</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Commercial Brand Spot"
                    disabled={isUploading}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>Portfolio Category</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        disabled={isUploading}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                          category === cat
                            ? "bg-[#d97706] text-black font-semibold shadow-md shadow-[#d97706]/20"
                            : "bg-black/30 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-2 flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>Tags (Up to 10)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      disabled={isUploading}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#d97706] transition-all"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={isUploading || !tagInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium border border-white/10 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/80"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          disabled={isUploading}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Editorial notes, camera gear, pacing details or client context..."
                  rows={3}
                  disabled={isUploading}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 3: Upload Action & Live Progress Feedback */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1c120c]/70 border border-white/10 backdrop-blur-xl">
              {isUploading && uploadProgress && (
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/80">{uploadStatusText}</span>
                    <span className="font-mono text-[#fbbf24] font-bold text-sm">{uploadProgress.percent}%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-black/50 overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#fbbf24] via-[#d97706] to-[#b45309]"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.percent}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>
                      {(uploadProgress.loadedBytes / (1024 * 1024)).toFixed(1)} MB of{" "}
                      {(uploadProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span>Chunk {uploadProgress.chunkIndex} of {uploadProgress.totalChunks} (20MB Slices)</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {!isUploading ? (
                  <button
                    type="submit"
                    disabled={!selectedFile || !title.trim()}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-sm text-black bg-gradient-to-r from-[#fbbf24] to-[#d97706] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#d97706]/20 flex items-center justify-center gap-2.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upload Video & Choose Thumbnail</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-medium text-xs text-red-300 bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Upload</span>
                  </button>
                )}

                {selectedFile && !isUploading && (
                  <span className="text-xs text-white/40">
                    Step 1 of 2: Video file uploads securely to Cloudinary before thumbnail selection.
                  </span>
                )}
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Thumbnail Selection & Confirmation */}
        {currentStep === "thumbnail_selection" && uploadedVideoResult && (
          <div className="space-y-8">
            {/* Step Breadcrumb Banner */}
            <div className="p-6 rounded-2xl bg-[#1c120c]/80 border border-[#d97706]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#fbbf24] uppercase font-bold">
                  Step 2 of 2: Thumbnail Selection
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Choose Cover Thumbnail for &quot;{title}&quot;
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Select an automatically extracted high-resolution video frame, or upload custom branded artwork.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep("form")}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Video Form</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Frame Candidates & Custom Upload (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Candidate Frames */}
                <div className="p-6 rounded-3xl bg-[#1c120c]/70 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-[#fbbf24]" />
                        <span>Automated Video Frame Candidates</span>
                      </h3>
                      <p className="text-xs text-white/40">Click any frame to select it as the public portfolio cover</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 px-2 py-0.5 rounded-full">
                      {thumbnailCandidates.length} Frames
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {thumbnailCandidates.map((candidate) => {
                      const isSelected = selectedPosterUrl === candidate.url
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedPosterUrl(candidate.url)}
                          className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer transition-all border ${
                            isSelected
                              ? "border-[#fbbf24] ring-2 ring-[#fbbf24] shadow-lg shadow-[#d97706]/30 scale-[1.02]"
                              : "border-white/10 hover:border-white/30 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={candidate.url}
                            alt={`Frame at ${candidate.label}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                          {/* Timestamp Pill */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 border border-white/10 text-[10px] font-mono text-white/90">
                            <Clock className="w-2.5 h-2.5 text-[#fbbf24]" />
                            <span>{candidate.label}</span>
                          </div>

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#fbbf24] text-black flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Custom Artwork Upload */}
                <div className="p-6 rounded-3xl bg-[#1c120c]/70 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#fbbf24]" />
                        <span>Upload Custom Cover Image</span>
                      </h3>
                      <p className="text-xs text-white/40">Upload a custom JPG, PNG, or WebP cover artwork</p>
                    </div>
                  </div>

                  <input
                    ref={customThumbInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCustomThumbnailChange(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />

                  {customThumbnailUrl ? (
                    <div
                      onClick={() => setSelectedPosterUrl(customThumbnailUrl)}
                      className={`relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer transition-all border max-w-sm ${
                        selectedPosterUrl === customThumbnailUrl
                          ? "border-[#fbbf24] ring-2 ring-[#fbbf24] shadow-lg shadow-[#d97706]/30"
                          : "border-white/15 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={customThumbnailUrl}
                        alt="Custom Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#d97706] text-black font-semibold text-[10px] tracking-wide uppercase">
                          Custom Artwork
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            customThumbInputRef.current?.click()
                          }}
                          className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px] text-white transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                      {selectedPosterUrl === customThumbnailUrl && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#fbbf24] text-black flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploadingCustomThumb}
                      onClick={() => customThumbInputRef.current?.click()}
                      className="w-full p-6 border-2 border-dashed border-white/15 hover:border-[#fbbf24]/50 rounded-2xl bg-black/20 hover:bg-black/30 flex flex-col items-center justify-center gap-2 text-center transition-all disabled:opacity-50"
                    >
                      {isUploadingCustomThumb ? (
                        <div className="flex items-center gap-2 text-xs text-[#fbbf24]">
                          <div className="w-4 h-4 border-2 border-[#fbbf24]/30 border-t-[#fbbf24] rounded-full animate-spin" />
                          <span>Uploading cover to Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-white/40" />
                          <span className="text-xs font-medium text-white/80">
                            Click to upload custom JPG, PNG, or WebP
                          </span>
                          <span className="text-[10px] text-white/30">
                            Recommended: 16:10 or 16:9 ratio, max 10MB
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Live Portfolio Card Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                <div className="p-6 rounded-3xl bg-[#1c120c]/70 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#fbbf24]" />
                      <span>Live Public Gallery Preview</span>
                    </h3>
                    <span className="text-[10px] font-mono text-white/40">16:10 Ratio</span>
                  </div>

                  {/* Portfolio Card Mockup */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2d1b11] border border-white/10 shadow-2xl">
                    {selectedPosterUrl ? (
                      <img
                        src={selectedPosterUrl}
                        alt="Selected Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No poster selected
                      </div>
                    )}

                    {/* Editorial Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0.22 0.04 42 / 0.95) 0%, oklch(0.22 0.04 42 / 0.3) 45%, transparent 100%)",
                      }}
                    />

                    {/* Card Content Overlay */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-medium tracking-wider text-[#fbbf24] uppercase">
                          {category}
                        </span>
                        <span className="text-2xl font-bold text-white/20">01</span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
                        {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-white/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Poster Metadata */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Poster Type:</span>
                      <span className="text-[#fbbf24] font-medium">
                        {selectedPosterUrl === customThumbnailUrl ? "Custom Uploaded Artwork" : "Video Frame Transformation"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Delivery:</span>
                      <span className="text-white/70">f_auto, q_auto:eco, w_800 (~40-90 KB)</span>
                    </div>
                  </div>

                  {/* Final Publish Button */}
                  <button
                    type="button"
                    onClick={handleFinalPublish}
                    disabled={isRegistering || !selectedPosterUrl}
                    className="w-full py-4 px-6 rounded-2xl font-semibold text-sm text-black bg-gradient-to-r from-[#fbbf24] to-[#d97706] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#d97706]/20 flex items-center justify-center gap-2.5"
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Registering & Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm & Publish to Portfolio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
