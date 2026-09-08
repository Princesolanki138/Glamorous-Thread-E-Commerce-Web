'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'

type DemoFormValues = {
  id: string
  title: string
  videoUrl: string
  posterUrl: string | null
  collectionId: string
  sortOrder: number
  isActive: boolean
}

const inputClass =
  'h-11 w-full rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#D4D4D4]/40'
const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-wider text-[#6B7280]'

export default function DemoForm({
  collections,
  demo,
}: {
  collections: { id: string; title: string }[]
  demo?: DemoFormValues
}) {
  const router = useRouter()
  const isEdit = !!demo

  const [title, setTitle] = useState(demo?.title ?? '')
  const [videoUrl, setVideoUrl] = useState(demo?.videoUrl ?? '')
  const [posterUrl, setPosterUrl] = useState<string | null>(demo?.posterUrl ?? null)
  const [collectionId, setCollectionId] = useState(demo?.collectionId ?? collections[0]?.id ?? '')
  const [sortOrder, setSortOrder] = useState(String(demo?.sortOrder ?? 0))
  const [isActive, setIsActive] = useState(demo?.isActive ?? true)

  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (
    file: File | undefined,
    setBusy: (v: boolean) => void,
    onDone: (url: string) => void,
    label: string,
  ) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const result = await uploadToCloudinary(file)
      onDone(result.secure_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : `${label} upload failed.`)
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!videoUrl) {
      setError('Upload a video before saving.')
      return
    }
    if (!collectionId) {
      setError('Choose a collection for this demo.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title,
        videoUrl,
        posterUrl: posterUrl || undefined,
        collectionId,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      }

      const res = await fetch(isEdit ? `/api/admin/demos/${demo!.id}` : '/api/admin/demos', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        // A 422 carries per-field messages; surface those over the generic text.
        const fieldError = data?.fields
          ? Object.values(data.fields as Record<string, string[] | undefined>)
              .flat()
              .find(Boolean)
          : undefined
        setError(fieldError || data?.error || 'Something went wrong.')
        return
      }

      router.push('/admin/demos')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (collections.length === 0) {
    return (
      <div className="max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-300">
        Create a collection first — every demo video is shown under a collection.{' '}
        <Link href="/admin/categories/new" className="underline hover:text-amber-200">
          New collection
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hair Topper Demo"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Collection</label>
          <select
            className={inputClass}
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            required
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[#555555]">
            The demo&apos;s &ldquo;View Product&rdquo; button links to this collection.
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="space-y-4 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">Video</h3>

        {videoUrl ? (
          <div className="space-y-3">
            <video
              src={videoUrl}
              controls
              muted
              playsInline
              className="aspect-3/4 w-48 rounded-xl border border-[#1F1F1F] bg-black object-cover"
            />
            <button
              type="button"
              onClick={() => setVideoUrl('')}
              className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-red-400"
            >
              <X size={12} /> Remove video
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] transition-colors hover:border-[#D4D4D4]/40 hover:text-white">
            {uploadingVideo ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-[11px]">{uploadingVideo ? 'Uploading…' : 'Upload video'}</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploadingVideo}
              onChange={(e) => upload(e.target.files?.[0], setUploadingVideo, setVideoUrl, 'Video')}
            />
          </label>
        )}

        <p className="text-xs text-[#555555]">
          Portrait clips look best — the carousel cards are 3:4. Keep them short; they autoplay muted.
        </p>
      </section>

      {/* Poster */}
      <section className="space-y-4 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">
          Poster <span className="font-normal text-[#6B7280]">(optional)</span>
        </h3>

        <div className="flex items-center gap-4">
          {posterUrl && (
            <div className="group relative h-24 w-20 overflow-hidden rounded-xl border border-[#1F1F1F]">
              <Image src={posterUrl} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => setPosterUrl(null)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            </div>
          )}
          <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] transition-colors hover:border-[#D4D4D4]/40 hover:text-white">
            {uploadingPoster ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-[10px]">Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingPoster}
              onChange={(e) => upload(e.target.files?.[0], setUploadingPoster, setPosterUrl, 'Poster')}
            />
          </label>
        </div>

        <p className="text-xs text-[#555555]">
          Shown while the video loads, and if the browser blocks autoplay.
        </p>
      </section>

      <section className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              type="number"
              className={inputClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <label className="mt-7 flex items-center gap-2 text-sm text-[#9CA3AF]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on the homepage)
          </label>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving || uploadingVideo || uploadingPoster}
        className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        {isEdit ? 'Save Changes' : 'Create Demo'}
      </button>
    </form>
  )
}
