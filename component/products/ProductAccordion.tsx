'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function ProductAccordion({
  title,
  content,
  items,
}: {
  title: string
  content?: string | null
  /** Attribute/value rows rendered as a spec table instead of prose. */
  items?: Record<string, string> | null
}) {
  const [open, setOpen] = useState(false)
  const rows = items ? Object.entries(items) : []

  const body =
    content ||
    'Premium quality 100% human hair product designed for seamless blending, long-lasting wear, and a naturally luxurious finish.'

  return (
    <div className="border-b border-neutral-200 py-7">
      
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex
          items-center
          justify-between
          gap-6
          text-left
          group
        "
      >
        <span
          className="
            text-lg
            md:text-xl
            font-medium
            tracking-tight
            text-white
            transition-colors
            duration-300
            group-hover:text-neutral-600
          "
        >
          {title}
        </span>

        <div
          className="
            flex
            items-center
            justify-center
            w-10
            h-10
            rounded-full
            border
            border-neutral-300
            transition-all
            duration-300
            group-hover:bg-black
            group-hover:border-black
          "
        >
          {open ? (
            <Minus
              size={18}
              className="transition-colors duration-300 group-hover:text-white"
            />
          ) : (
            <Plus
              size={18}
              className="transition-colors duration-300 group-hover:text-white"
            />
          )}
        </div>
      </button>

      <div
        className={`
          grid
          transition-all
          duration-500
          ease-in-out
          ${
            open
              ? 'grid-rows-[1fr] opacity-100 mt-5'
              : 'grid-rows-[0fr] opacity-0'
          }
        `}
      >
        <div className="overflow-hidden">
          {rows.length > 0 ? (
            <dl className="grid max-w-3xl gap-x-10 gap-y-1 pr-4 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-neutral-800 py-2.5"
                >
                  <dt className="text-sm text-neutral-500">{label}</dt>
                  <dd className="text-right text-sm text-neutral-300">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p
              className="
                text-neutral-600
                leading-8
                text-sm
                md:text-base
                max-w-3xl
                pr-4
              "
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}