'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from '@/component/auth/SessionProvider'
import { Star } from 'lucide-react'

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  userName: string
}

type Product = {
  id: string
  title: string
  reviews: Review[]
}

/** Mirrors reviewSchema on the server, so short comments fail before the request. */
const MIN_COMMENT_LENGTH = 10

export default function CustomerReviews({ product }: { product: Product }) {
  const { isSignedIn } = useSession()
  const [reviews, setReviews] = useState<Review[]>(product.reviews ?? [])
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reviewCount = reviews.length
  const averageRating = useMemo(
    () =>
      reviewCount > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
        : '0.0',
    [reviews, reviewCount],
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const trimmed = comment.trim()
    if (trimmed.length < MIN_COMMENT_LENGTH) {
      setError(
        `Please write at least ${MIN_COMMENT_LENGTH} characters — you have ${trimmed.length}.`,
      )
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating, comment: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        // A 422 carries per-field messages; surface those instead of "Validation failed".
        const fieldError = data?.fields
          ? Object.values(data.fields as Record<string, string[] | undefined>)
              .flat()
              .find(Boolean)
          : undefined
        setError(fieldError || data?.error || 'Something went wrong.')
        return
      }
      setReviews((prev) => [data.data, ...prev])
      setComment('')
      setRating(5)
      setMessage('Your review was posted successfully.')
    } catch {
      setError('Unable to post your review. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarDisplay = ({ value, size = 16 }: { value: number; size?: number }) => (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          strokeWidth={1.5}
          className={s <= value ? 'fill-[#D4D4D4] text-[#D4D4D4]' : 'text-[#333333]'}
        />
      ))}
    </span>
  )

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 lg:px-16 bg-[#0E0E0E]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div>
            <div className="section-label mb-6">Real Experiences</div>
            <h2 className="font-cormorant text-4xl md:text-5xl text-white tracking-tight">
              Customer <span className="gradient-text italic">Reviews</span>
            </h2>
            <p className="text-[#8A8A8A] mt-4 max-w-2xl text-sm md:text-base leading-relaxed">
              Discover what our customers love about Glamorous Thread — from natural blending to
              premium quality and confidence-boosting transformations.
            </p>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl px-6 py-5 w-fit shrink-0">
            <div className="font-cormorant text-5xl text-white font-light">{averageRating}</div>
            <div>
              <StarDisplay value={Math.round(Number(averageRating))} size={18} />
              <p className="text-xs text-[#8A8A8A] mt-2 tracking-wide">
                Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">

          {/* Reviews List */}
          <div className="space-y-5">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] p-12 text-center">
                <p className="text-[#8A8A8A] text-sm">
                  No reviews yet. Be the first to share your experience with{' '}
                  <span className="text-[#D4D4D4]">{product.title}</span>.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#333333] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-xs font-semibold text-[#D4D4D4]">
                          {review.userName[0]?.toUpperCase() || 'G'}
                        </div>
                        <h4 className="font-medium text-white text-sm">{review.userName}</h4>
                        <span className="text-[10px] text-[#D4D4D4]/60 border border-[#333333] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#555555] ml-11">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StarDisplay value={review.rating} />
                  </div>
                  <p className="text-[#B8B8B8] leading-relaxed text-sm md:text-[0.9rem] ml-11">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-7">
            <h3 className="font-cormorant text-2xl text-white mb-2">Write a Review</h3>
            <p className="text-sm text-[#8A8A8A] mb-7">
              Share your experience to help others shop with confidence.
            </p>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {message}
              </div>
            )}

            {isSignedIn ? (
              <form className="space-y-5" onSubmit={onSubmit}>
                {/* Star Picker */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] text-[#8A8A8A] mb-3">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                      >
                        <Star
                          size={28}
                          strokeWidth={1.5}
                          className={`transition-colors ${
                            s <= (hoverRating || rating)
                              ? 'fill-[#D4D4D4] text-[#D4D4D4]'
                              : 'text-[#333333] hover:text-[#555555]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] text-[#8A8A8A] mb-2" htmlFor="review-comment">
                    Review
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-[#2A2A2A] bg-[#222222] px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition focus:border-[#D4D4D4]/40 resize-none"
                    placeholder="Write a short review of your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="luxury-button w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting…' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#222222] p-7 text-center">
                <p className="mb-5 text-sm text-[#8A8A8A]">
                  You must be signed in to leave a review.
                </p>
                <Link href="/auth/login" className="luxury-button inline-flex">
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
