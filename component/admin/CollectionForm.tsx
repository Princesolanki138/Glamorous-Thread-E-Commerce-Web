'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'

type CollectionFormValues = {
  id: string
  title: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const inputClass =
  'h-11 w-full rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#D4D4D4]/40'
const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-wider text-[#6B7280]'

export default function CollectionForm({ collection }: { collection?: CollectionFormValues }) {
  const router = useRouter()
  const isEdit = !!collection

  const [title, setTitle] = useState(collection?.title ?? '')
  const [slug, setSlug] = useState(collection?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [description, setDescription] = useState(collection?.description ?? '')
  const [image, setImage] = useState<string | null>(collection?.image ?? null)
  const [sortOrder, setSortOrder] = useState(String(collection?.sortOrder ?? 0))
  const [isActive, setIsActive] = useState(collection?.isActive ?? true)
  const [metaTitle, setMetaTitle] = useState(collection?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(collection?.metaDescription ?? '')

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleFileUpload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await uploadToCloudinary(file)
      setImage(result.secure_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        title,
        slug,
        description: description || undefined,
        image: image || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      }

      const res = await fetch(isEdit ? `/api/admin/collections/${collection!.id}` : '/api/admin/collections', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.')
        return
      }

      router.push('/admin/categories')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#D4D4D4]/40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Image</label>
          <div className="flex items-center gap-4">
            {image && (
              <div className="group relative h-20 w-20 overflow-hidden rounded-xl border border-[#1F1F1F]">
                <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] transition-colors hover:border-[#D4D4D4]/40 hover:text-white">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span className="text-[10px]">Upload</span>
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleFileUpload(e.target.files)} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sort Order</label>
            <input type="number" className={inputClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <label className="mt-7 flex items-center gap-2 text-sm text-[#9CA3AF]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">SEO</h3>
        <div>
          <label className={labelClass}>Meta Title</label>
          <input className={inputClass} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Meta Description</label>
          <input className={inputClass} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving || uploading}
        className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        {isEdit ? 'Save Changes' : 'Create Collection'}
      </button>
    </form>
  )
}
