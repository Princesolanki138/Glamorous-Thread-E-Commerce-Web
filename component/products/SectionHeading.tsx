export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string
  subtitle?: string | null
  align?: 'center' | 'left' | 'right'
}) {
  return (
    <div
      className={`
        mb-14 md:mb-20
        ${
          align === 'center'
            ? 'text-center'
            : align === 'left'
            ? 'text-left'
            : 'text-right'
        }
      `}
    >
      {/* Optional Subtitle */}
      {subtitle && (
        <p
          className="
            uppercase
            tracking-[0.35em]
            text-[11px]
            md:text-xs
            text-neutral-500
            mb-5
          "
        >
          {subtitle}
        </p>
      )}

      {/* Heading */}
      <h2
        className="
          text-3xl
          sm:text-4xl
          md:text-5xl
          xl:text-6xl
          font-semibold
          tracking-tight
          leading-[1.05]
          text-black
        "
      >
        {title}
      </h2>

      {/* Decorative Line */}
      <div
        className={`
          mt-6
          h-[2px]
          rounded-full
          bg-black
          transition-all
          duration-500
          ${
            align === 'center'
              ? 'w-20 mx-auto'
              : align === 'left'
              ? 'w-20'
              : 'w-20 ml-auto'
          }
        `}
      />

      {/* Optional Glow Accent */}
      <div
        className={`
          mt-2
          h-[2px]
          rounded-full
          bg-black/10
          blur-sm
          ${
            align === 'center'
              ? 'w-28 mx-auto'
              : align === 'left'
              ? 'w-28'
              : 'w-28 ml-auto'
          }
        `}
      />
    </div>
  )
}