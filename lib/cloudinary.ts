const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

// Raw file types that must go to /raw/upload instead of /image/upload
const RAW_EXTENSIONS = ['.glb', '.gltf', '.usdz', '.fbx', '.obj']

function isRawFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return RAW_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export const uploadToCloudinary = async (file: File) => {
  const resourceType = isRawFile(file) ? 'raw' : 'image'

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Cloudinary upload failed (${res.status})`)
  }

  return res.json() as Promise<{ secure_url: string; public_id: string }>
}
