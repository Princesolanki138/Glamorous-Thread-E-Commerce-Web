'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import TiptapEditor from './TiptapEditor'
import { uploadToCloudinary } from '@/lib/cloudinary'

type ImageInput = { url: string; alt?: string }
type VariantInput = {
  color: string
  length: string
  texture: string
  sku: string
  stock: number
  price: string
  comparePrice: string
}

type ProductFormValues = {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string | null
  price: number
  comparePrice: number | null
  collectionId: string
  featured: boolean
  isActive: boolean
  hairColor: string | null
  hairLength: string | null
  hairStyle: string | null
  hairTexture: string | null
  specs: Record<string, string> | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  images: { url: string; alt: string | null }[]
  variants: { color: string | null; length: string | null; texture: string | null; sku: string | null; stock: number; price: number | null; comparePrice: number | null }[]
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const inputClass =
  'h-11 w-full rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-4 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#D4D4D4]/40'
const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-wider text-[#6B7280]'

export default function ProductForm({
  collections,
  product,
}: {
  collections: { id: string; title: string }[]
  product?: ProductFormValues
}) {
  const router = useRouter()
  const isEdit = !!product

  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [description, setDescription] = useState(product?.description ?? '')
  const [shortDesc, setShortDesc] = useState(product?.shortDesc ?? '')
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [comparePrice, setComparePrice] = useState(product?.comparePrice != null ? String(product.comparePrice) : '')
  const [collectionId, setCollectionId] = useState(product?.collectionId ?? collections[0]?.id ?? '')
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [hairColor, setHairColor] = useState(product?.hairColor ?? '')
  const [hairLength, setHairLength] = useState(product?.hairLength ?? '')
  const [hairStyle, setHairStyle] = useState(product?.hairStyle ?? '')
  const [hairTexture, setHairTexture] = useState(product?.hairTexture ?? '')
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    Object.entries(product?.specs ?? {}).map(([key, value]) => ({ key, value: String(value) })),
  )
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '')
  const [metaKeywords, setMetaKeywords] = useState(product?.metaKeywords ?? '')

  const [images, setImages] = useState<ImageInput[]>(
    product?.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined })) ?? [],
  )
  const [uploading, setUploading] = useState(false)

  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.map((v) => ({
      color: v.color ?? '',
      length: v.length ?? '',
      texture: v.texture ?? '',
      sku: v.sku ?? '',
      stock: v.stock,
      price: v.price != null ? String(v.price) : '',
      comparePrice: v.comparePrice != null ? String(v.comparePrice) : '',
    })) ?? [],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const result = await uploadToCloudinary(file)
        setImages((prev) => [...prev, { url: result.secure_url }])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const addSpec = () => setSpecs((prev) => [...prev, { key: '', value: '' }])

  const removeSpec = (index: number) => setSpecs((prev) => prev.filter((_, i) => i !== index))

  const updateSpec = (index: number, field: 'key' | 'value', value: string) =>
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))

  const addVariant = () =>
    setVariants((prev) => [...prev, { color: '', length: '', texture: '', sku: '', stock: 0, price: '', comparePrice: '' }])

  const removeVariant = (index: number) => setVariants((prev) => prev.filter((_, i) => i !== index))

  const updateVariant = (index: number, field: keyof VariantInput, value: string) =>
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (variants.length === 0) {
      setError('Add at least one variant.')
      return
    }

    setSaving(true)
    try {
      const specsObject = specs.reduce<Record<string, string>>((acc, s) => {
        const key = s.key.trim()
        if (key) acc[key] = s.value.trim()
        return acc
      }, {})

      const payload = {
        title,
        slug,
        description,
        shortDesc: shortDesc || undefined,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        collectionId,
        featured,
        isActive,
        hairColor: hairColor || undefined,
        hairLength: hairLength || undefined,
        hairStyle: hairStyle || undefined,
        hairTexture: hairTexture || undefined,
        // Sent even when empty so clearing every row actually clears the specs.
        specs: specsObject,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
        images,
        variants: variants.map((v) => ({
          color: v.color || undefined,
          length: v.length || undefined,
          texture: v.texture || undefined,
          sku: v.sku || undefined,
          stock: Number(v.stock) || 0,
          price: v.price ? Number(v.price) : undefined,
          comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
        })),
      }

      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.')
        return
      }

      router.push('/admin/products')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Basics */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">Basics</h3>

        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
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
          <label className={labelClass}>Short Description</label>
          <input
            className={inputClass}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="One-line summary shown on the product page"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <div className="rounded-xl border border-[#1F1F1F] bg-[#141414] p-3">
            <TiptapEditor value={description} onChange={setDescription} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on the storefront)
          </label>
        </div>
      </section>

      {/* Pricing & collection */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">Pricing &amp; Collection</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Compare-at Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Collection</label>
            <select className={inputClass} value={collectionId} onChange={(e) => setCollectionId(e.target.value)} required>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Hair attributes */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">Hair Attributes</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Color</label>
            <input className={inputClass} value={hairColor} onChange={(e) => setHairColor(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Length</label>
            <input className={inputClass} value={hairLength} onChange={(e) => setHairLength(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Style</label>
            <input className={inputClass} value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Texture</label>
            <input className={inputClass} value={hairTexture} onChange={(e) => setHairTexture(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Specifications</h3>
          <button
            type="button"
            onClick={addSpec}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white"
          >
            <Plus size={13} /> Add Row
          </button>
        </div>

        <p className="text-xs text-[#555555]">
          Free-form attribute/value pairs shown on the product page — e.g. Weight, Material,
          Country of Origin.
        </p>

        {specs.length === 0 && <p className="text-sm text-[#555555]">No specifications yet.</p>}

        <div className="space-y-3">
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                placeholder="Attribute (e.g. Weight)"
                className={inputClass}
                value={s.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
              />
              <input
                placeholder="Value (e.g. 120 gm)"
                className={inputClass}
                value={s.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1F1F1F] text-[#6B7280] hover:border-red-500/40 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <h3 className="text-sm font-semibold text-white">Images</h3>

        <div className="flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={img.url + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-[#1F1F1F]">
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#2A2A2A] text-[#6B7280] transition-colors hover:border-[#D4D4D4]/40 hover:text-white">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-[10px]">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-5 rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white"
          >
            <Plus size={13} /> Add Variant
          </button>
        </div>

        {variants.length === 0 && <p className="text-sm text-[#555555]">No variants yet — add at least one.</p>}

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-[#1F1F1F] bg-[#141414] p-4 sm:grid-cols-7">
              <input
                placeholder="Color"
                className={inputClass}
                value={v.color}
                onChange={(e) => updateVariant(i, 'color', e.target.value)}
              />
              <input
                placeholder="Length"
                className={inputClass}
                value={v.length}
                onChange={(e) => updateVariant(i, 'length', e.target.value)}
              />
              <input
                placeholder="Texture"
                className={inputClass}
                value={v.texture}
                onChange={(e) => updateVariant(i, 'texture', e.target.value)}
              />
              <input
                placeholder="SKU"
                className={inputClass}
                value={v.sku}
                onChange={(e) => updateVariant(i, 'sku', e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                className={inputClass}
                value={v.stock}
                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price override"
                className={inputClass}
                value={v.price}
                onChange={(e) => updateVariant(i, 'price', e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Compare"
                  className={inputClass}
                  value={v.comparePrice}
                  onChange={(e) => updateVariant(i, 'comparePrice', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1F1F1F] text-[#6B7280] hover:border-red-500/40 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO */}
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
        <div>
          <label className={labelClass}>Meta Keywords</label>
          <input className={inputClass} value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
