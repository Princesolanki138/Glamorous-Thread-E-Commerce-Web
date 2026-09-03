'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images?: Array<string | { url: string; alt?: string }>
  title?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any
}

export default function ProductGallery({
  images: imagesFromProps,
  title = 'Product',
  product,
}: ProductGalleryProps) {
  let images: string[] = []

  if (imagesFromProps && imagesFromProps.length > 0) {
    images = imagesFromProps.map((img) => (typeof img === 'string' ? img : img.url))
  } else if (product?.images && product.images.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images = product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
  } else if (product?.image) {
    images = [product.image]
  }

  const [selectedImage, setSelectedImage] = useState(images[0] || '/images/placeholder.jpg')
  const currentIndex = Math.max(0, images.indexOf(selectedImage))

  const handleNext = () => {
    const next = (currentIndex + 1) % images.length
    setSelectedImage(images[next])
  }

  const handlePrev = () => {
    const prev = (currentIndex - 1 + images.length) % images.length
    setSelectedImage(images[prev])
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 order-2 lg:order-1 overflow-x-auto lg:overflow-visible scrollbar-hide">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative min-w-[80px] w-[80px] aspect-[4/5] rounded-xl overflow-hidden border transition-all duration-300 ${
              selectedImage === img
                ? 'border-[#D4D4D4] opacity-100 scale-[1.02]'
                : 'border-[#2A2A2A] opacity-50 hover:opacity-80 hover:border-[#444444]'
            }`}
          >
            <Image src={img} alt={`${title} ${index + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 order-1 lg:order-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1A1A1A] group">
          <Image
            src={selectedImage}
            alt={title}
            fill
            priority
            sizes="(max-width:1024px) 90vw, 45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#121212]/80 backdrop-blur-md border border-[#333333] flex items-center justify-center text-[#D4D4D4] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#222222] hover:text-white"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#121212]/80 backdrop-blur-md border border-[#333333] flex items-center justify-center text-[#D4D4D4] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#222222] hover:text-white"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-[#121212]/80 backdrop-blur-md border border-[#333333] px-3 py-1.5 rounded-full text-[0.72rem] font-medium text-[#B8B8B8] tracking-widest">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}
