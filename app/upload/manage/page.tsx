"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Film,
  UploadCloud,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  X,
  Lock,
  Tag as TagIcon,
  Video,
  Database,
  Cloud,
  HardDrive,
} from "lucide-react"
import { PortfolioVideo, VideoCategory, VideoSourceType } from "@/lib/supabase"

interface DashboardStats {
  total: number
  published: number
  unpublished: number
  cloudinary: number
  local: number
}

const CATEGORIES: VideoCategory[] = ["Editing", "Marketing", "Motion"]

export default function ManageVideosPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthPending, startAuthTransition] = useTransition()

  // Video data state
  const [videos, setVideos] = useState<PortfolioVideo[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    published: 0,
    unpublished: 0,
    cloudinary: 0,
    local: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [publishedFilter, setPublishedFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"order" | "newest" | "oldest">("order")

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<PortfolioVideo | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSubtitle, setEditSubtitle] = useState("")
  const [editCategory, setEditCategory] = useState<VideoCategory>("Editing")
  const [editDescription, setEditDescription] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Delete Dialog State
  const [deletingVideo, setDeletingVideo] = useState<PortfolioVideo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Check Authentication on Mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => {
        setIsAuthenticated(res.ok)
        if (res.ok) {
          loadVideos()
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        setIsLoading(false)
      })
  }, [])

  // 2. Fetch Videos and Metrics from API
  const loadVideos = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/videos")
      if (res.status === 401) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to load video records.")
      }
      setVideos(data.videos || [])
      setStats(data.stats || { total: 0, published: 0, unpublished: 0, cloudinary: 0, local: 0 })
    } catch (err: any) {
      setFetchError(err.message || "Failed to load dashboard data.")
    } finally {
      setIsLoading(false)
    }
  }

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
        loadVideos()
      } catch (err) {
        setAuthError("Network error. Please try again.")
      }
    })
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Ignore
    }
    setIsAuthenticated(false)
    setVideos([])
  }

  // 3. Filtered and Sorted Video List
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        const matchesSearch =
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
        const matchesSource = sourceFilter === "all" || video.source_type === sourceFilter
        const matchesPublished =
          publishedFilter === "all" ||
          (publishedFilter === "published" && video.is_published) ||
          (publishedFilter === "unpublished" && !video.is_published)

        return matchesSearch && matchesCategory && matchesSource && matchesPublished
      })
      .sort((a, b) => {
        if (sortBy === "order") {
          return a.display_order - b.display_order
        }
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return 0
      })
  }, [videos, searchQuery, categoryFilter, sourceFilter, publishedFilter, sortBy])

  // 4. Toggle Publish State
  const handleTogglePublish = async (video: PortfolioVideo) => {
    setActionSuccess(null)
    setActionError(null)

    const newPublishedState = !video.is_published
    try {
      const res = await fetch(`/api/videos/${video.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newPublishedState }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update publication status.")

      // Optimistic state update
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, is_published: newPublishedState } : v))
      )
      setStats((prev) => ({
        ...prev,
        published: newPublishedState ? prev.published + 1 : prev.published - 1,
        unpublished: newPublishedState ? prev.unpublished - 1 : prev.unpublished + 1,
      }))
      setActionSuccess(`"${video.title}" is now ${newPublishedState ? "published" : "unpublished"}.`)
    } catch (err: any) {
      setActionError(err.message || "Failed to update publication status.")
    }
  }

  // 5. Open Edit Modal
  const openEditModal = (video: PortfolioVideo) => {
    setEditingVideo(video)
    setEditTitle(video.title)
    setEditSubtitle(video.subtitle || "")
    setEditCategory(video.category)
    setEditDescription(video.description || "")
    setEditTags(video.tags || [])
    setEditTagInput("")
    setActionError(null)
  }

  // Save Edit Metadata
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVideo) return

    setIsSavingEdit(true)
    setActionError(null)

    try {
      const res = await fetch(`/api/videos/${editingVideo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          subtitle: editSubtitle.trim(),
          category: editCategory,
          description: editDescription.trim(),
          tags: editTags,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save edits.")

      setVideos((prev) => prev.map((v) => (v.id === editingVideo.id ? data.video : v)))
      setActionSuccess(`Changes to "${data.video.title}" saved successfully.`)
      setEditingVideo(null)
    } catch (err: any) {
      setActionError(err.message || "Failed to save changes.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Add / Remove Tags in Edit Modal
  const handleAddTag = () => {
    const trimmed = editTagInput.trim()
    if (trimmed && !editTags.includes(trimmed) && editTags.length < 10) {
      if (trimmed.length > 40) {
        setActionError("Tags cannot exceed 40 characters.")
        return
      }
      setEditTags([...editTags, trimmed])
      setEditTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove))
  }

  // 6. Move Video Order Up or Down
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= filteredVideos.length) return

    const currentVideo = filteredVideos[index]
    const targetVideo = filteredVideos[targetIndex]

    // Swap display orders
    const newCurrentOrder = targetVideo.display_order
    const newTargetOrder = currentVideo.display_order

    // Optimistic local update
    const updatedVideos = videos.map((v) => {
      if (v.id === currentVideo.id) return { ...v, display_order: newCurrentOrder }
      if (v.id === targetVideo.id) return { ...v, display_order: newTargetOrder }
      return v
    })
    setVideos(updatedVideos)

    try {
      const res = await fetch("/api/videos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: [
            { id: currentVideo.id, display_order: newCurrentOrder },
            { id: targetVideo.id, display_order: newTargetOrder },
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Reorder failed.")
      }
    } catch (err: any) {
      setActionError("Failed to save reordered positions to database.")
      loadVideos() // revert on error
    }
  }

  // 7. Delete Video
  const handleConfirmDelete = async () => {
    if (!deletingVideo) return
    setIsDeleting(true)
    setActionError(null)

    try {
      const res = await fetch(`/api/videos/${deletingVideo.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Deletion failed.")

      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id))
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        published: deletingVideo.is_published ? prev.published - 1 : prev.published,
        unpublished: !deletingVideo.is_published ? prev.unpublished - 1 : prev.unpublished,
        cloudinary: deletingVideo.source_type === "cloudinary" ? prev.cloudinary - 1 : prev.cloudinary,
        local: deletingVideo.source_type === "local" ? prev.local - 1 : prev.local,
      }))
      setActionSuccess(data.message || `Project "${deletingVideo.title}" was deleted.`)
      setDeletingVideo(null)
    } catch (err: any) {
      setActionError(err.message || "Failed to delete project.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Render Login Gate
  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 selection:bg-amber-500/20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-stone-900/80 border border-stone-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-light tracking-wide text-stone-100 font-serif">Portfolio Studio</h1>
            <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Video Management Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Owner Passphrase</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter studio key..."
                  className="w-full bg-stone-950/60 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthPending}
              className="w-full py-3 bg-amber-600/90 hover:bg-amber-600 text-stone-100 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 shadow-lg shadow-amber-950/40"
            >
              {isAuthPending ? "Authenticating..." : "Access Studio"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-400 tracking-wider uppercase transition-colors">
              ← Return to Public Portfolio
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500/20 font-sans pb-24">
      {/* Top Header & Navigation */}
      <header className="border-b border-stone-800/80 bg-stone-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-medium tracking-tight text-stone-100 font-serif">Studio Console</h1>
              <p className="text-[11px] uppercase tracking-widest text-stone-400">Video Portfolio Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload New Video
            </Link>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-lg text-xs tracking-wide flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 rounded-lg text-xs tracking-wide flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Feedback Alerts */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{actionError}</span>
              </div>
              <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] uppercase tracking-wider">Total Projects</span>
              <Film className="w-4 h-4 text-stone-500" />
            </div>
            <div className="text-2xl font-light text-stone-100 font-serif">{stats.total}</div>
          </div>

          <div className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl">
            <div className="flex items-center justify-between text-emerald-400/80 mb-2">
              <span className="text-[11px] uppercase tracking-wider">Published</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-light text-emerald-300 font-serif">{stats.published}</div>
          </div>

          <div className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl">
            <div className="flex items-center justify-between text-amber-400/80 mb-2">
              <span className="text-[11px] uppercase tracking-wider">Unpublished</span>
              <EyeOff className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-light text-amber-300 font-serif">{stats.unpublished}</div>
          </div>

          <div className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl">
            <div className="flex items-center justify-between text-sky-400/80 mb-2">
              <span className="text-[11px] uppercase tracking-wider">Cloudinary CDN</span>
              <Cloud className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-light text-sky-300 font-serif">{stats.cloudinary}</div>
          </div>

          <div className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl">
            <div className="flex items-center justify-between text-indigo-400/80 mb-2">
              <span className="text-[11px] uppercase tracking-wider">Local Assets</span>
              <HardDrive className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-light text-indigo-300 font-serif">{stats.local}</div>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="p-4 bg-stone-900/50 border border-stone-800/80 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subtitle, or tags..."
              className="w-full bg-stone-950/60 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-stone-950/60 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Categories</option>
              <option value="Editing">Editing</option>
              <option value="Marketing">Marketing</option>
              <option value="Motion">Motion</option>
            </select>

            {/* Source Type Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-stone-950/60 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Sources</option>
              <option value="cloudinary">Cloudinary</option>
              <option value="local">Local Disk</option>
            </select>

            {/* Publication Filter */}
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="bg-stone-950/60 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-950/60 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="order">Display Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              onClick={loadVideos}
              className="p-2 bg-stone-950/60 border border-stone-800 hover:border-stone-700 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Video Listing Content */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-amber-500/60 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 uppercase tracking-widest">Loading Portfolio Vault...</p>
          </div>
        ) : fetchError ? (
          <div className="p-8 bg-stone-900/40 border border-stone-800 rounded-2xl text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-stone-200 mb-1">Database Connection Required</h3>
            <p className="text-xs text-stone-400 mb-4">{fetchError}</p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              If running locally without Supabase, configure <code className="text-amber-400/80">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-amber-400/80">SUPABASE_SERVICE_ROLE_KEY</code> in <code className="text-stone-400">.env.local</code>.
            </p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-16 text-center bg-stone-900/30 border border-stone-800/60 rounded-2xl">
            <Film className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No projects match the selected filters.</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setSourceFilter("all")
                setPublishedFilter("all")
              }}
              className="mt-3 text-xs text-amber-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                layout
                className={`bg-stone-900/70 border ${
                  video.is_published ? "border-stone-800" : "border-amber-900/30 opacity-75"
                } rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-stone-700/80`}
              >
                {/* Poster & Badges */}
                <div className="relative aspect-video bg-stone-950 overflow-hidden group">
                  <img
                    src={
                      !video.poster_url || video.poster_url.includes("_poster.jpg")
                        ? (video.source_type === "local"
                            ? `/video/thumb_opt_${video.cloudinary_public_id.replace(/^portfolio\//, "").replace(/^\/?video\//, "").replace(/^opt_/, "").replace(/\.[^/.]+$/, "")}.jpg`
                            : `https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto:eco,w_800,c_limit,so_1/portfolio/${video.cloudinary_public_id.replace(/^portfolio\//, "")}.jpg`)
                        : video.poster_url
                    }
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const cleanBase = video.cloudinary_public_id.replace(/^portfolio\//, "")
                      const fallback = `https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto:eco,w_800,c_limit,so_1/portfolio/${cleanBase}.jpg`
                      if (target.src !== fallback) {
                        target.src = fallback
                      } else {
                        target.src = "/placeholder.jpg"
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                        video.is_published
                          ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                          : "bg-amber-950/70 border-amber-700/50 text-amber-300"
                      }`}
                    >
                      {video.is_published ? "Published" : "Unpublished"}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-900/80 border border-stone-700/60 text-stone-300 backdrop-blur-md">
                      #{video.display_order}
                    </span>
                  </div>

                  {/* Bottom Video Category & Source Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {video.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900/90 text-stone-400 border border-stone-800">
                      {video.source_type === "cloudinary" ? "Cloudinary" : "Local File"}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-medium text-stone-100 font-serif line-clamp-1">{video.title}</h3>
                    {video.subtitle && (
                      <p className="text-xs text-amber-200/60 line-clamp-1 mt-0.5 font-sans">{video.subtitle}</p>
                    )}
                    {video.description && (
                      <p className="text-xs text-stone-400 line-clamp-2 mt-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {video.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 bg-stone-950 text-stone-400 rounded-md border border-stone-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-stone-500">
                            +{video.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                    {/* Ordering Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-stone-950 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === filteredVideos.length - 1}
                        className="p-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-stone-950 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action Group */}
                    <div className="flex items-center gap-2">
                      {/* Publish / Unpublish Toggle */}
                      <button
                        onClick={() => handleTogglePublish(video)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                          video.is_published
                            ? "bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border-amber-900/40"
                            : "bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
                        }`}
                        title={video.is_published ? "Unpublish Project" : "Publish Project"}
                      >
                        {video.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 rounded-lg text-xs transition-colors"
                        title="Edit Project Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingVideo(video)}
                        className="p-2 bg-stone-950 hover:bg-red-950/40 border border-stone-800 hover:border-red-900/60 text-stone-500 hover:text-red-400 rounded-lg text-xs transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      <AnimatePresence>
        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
                <div>
                  <h3 className="text-base font-serif font-medium text-stone-100">Edit Project Metadata</h3>
                  <p className="text-[11px] text-stone-500">Update display details without touching media files.</p>
                </div>
                <button
                  onClick={() => setEditingVideo(null)}
                  className="text-stone-500 hover:text-stone-300 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                    Project Title ({editTitle.length}/120)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                    Subtitle ({editSubtitle.length}/160)
                  </label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    maxLength={160}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditCategory(cat)}
                        className={`py-2 text-xs rounded-xl border transition-all ${
                          editCategory === cat
                            ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                            : "bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                    Description ({editDescription.length}/2000)
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                    Tags ({editTags.length}/10)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Add a tag..."
                      maxLength={40}
                      className="flex-1 bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {editTags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-stone-950 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-stone-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-100 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-red-900/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-stone-100">
                    {deletingVideo.source_type === "local" ? "Local Asset Protection" : "Confirm Project Deletion"}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {deletingVideo.source_type === "local" ? "Asset cannot be purged via API" : "Irreversible action"}
                  </p>
                </div>
              </div>

              {deletingVideo.source_type === "local" ? (
                <div className="space-y-4">
                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300 leading-relaxed">
                    <p className="font-medium text-amber-300 mb-1">Local Asset Notice</p>
                    <p>
                      <strong>&quot;{deletingVideo.title}&quot;</strong> is a local video asset located in <code className="text-stone-400">/public/video/</code>. To preserve local files, permanent deletion is disabled.
                    </p>
                    <p className="mt-2 text-stone-400">
                      If you do not want this video to appear in your portfolio, click <strong>Unpublish</strong> instead.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDeletingVideo(null)}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium"
                    >
                      Close
                    </button>
                    {deletingVideo.is_published && (
                      <button
                        onClick={() => {
                          const v = deletingVideo
                          setDeletingVideo(null)
                          handleTogglePublish(v)
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-100 rounded-xl text-xs font-medium"
                      >
                        Unpublish Project
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Are you sure you want to permanently delete <strong>&quot;{deletingVideo.title}&quot;</strong>?
                  </p>
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-[11px] text-red-300/80 leading-relaxed">
                    This will permanently remove the video file from your Cloudinary media library and delete all associated metadata from your portfolio database.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDeletingVideo(null)}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-stone-100 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
