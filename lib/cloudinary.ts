const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

// Raw file types that must go to /raw/upload instead of /image/upload
const RAW_EXTENSIONS = ['.glb', '.gltf', '.usdz', '.fbx', '.obj']

// Video must go to /video/upload; Cloudinary rejects it on the image endpoint.
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.avi']

function resourceTypeFor(file: File): 'raw' | 'video' | 'image' {
  const name = file.name.toLowerCase()
  if (RAW_EXTENSIONS.some((ext) => name.endsWith(ext))) return 'raw'
  if (file.type.startsWith('video/') || VIDEO_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return 'video'
  }
  return 'image'
}

export const uploadToCloudinary = async (file: File) => {
  const resourceType = resourceTypeFor(file)

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
