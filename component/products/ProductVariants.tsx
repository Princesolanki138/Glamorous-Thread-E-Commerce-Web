'use client'

import { Check } from 'lucide-react'

type ColorOption = {
  name: string
  value: string
}

type Props = {
  colors: ColorOption[]
  textures: string[]

  selectedColor?: ColorOption
  selectedTexture?: string

  onSelectColor?: (
    color: ColorOption
  ) => void

  onSelectTexture?: (
    texture: string
  ) => void
}

export default function ProductVariants({
  colors,
  textures,
  selectedColor,
  selectedTexture,
  onSelectColor,
  onSelectTexture,
}: Props) {

  //
  // SAFETY
  //

  if (
    !colors?.length ||
    !textures?.length
  ) {
    return null
  }

  //
  // CURRENT VALUES
  //

  const currentColor =
    selectedColor ??
    colors[0]

  const currentTexture =
    selectedTexture ??
    textures[0]

  return (

    <div className="mt-10 space-y-10">

      {/* COLOR */}

      <div>

        <div className="flex items-center justify-between mb-5">

          <h3
            className="
              uppercase
              tracking-[0.28em]
              text-xs
              md:text-sm
              text-neutral-500
              font-medium
            "
          >
            Color
          </h3>

          <span className="text-sm font-medium text-white">
            {currentColor.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-4">

          {colors.map((color) => {

            const isSelected =
              currentColor.name ===
              color.name

            return (

              <button
                key={color.name}

                type="button"

                aria-label={`Select ${color.name}`}

                onClick={() =>
                  onSelectColor?.(
                    color
                  )
                }

                className={`
                  relative
                  w-14
                  h-14
                  rounded-2xl
                  border-2
                  overflow-hidden
                  transition-all
                  duration-300
                  hover:scale-105
                  active:scale-95
                  ${
                    isSelected
                      ? 'border-black shadow-lg'
                      : 'border-neutral-200 hover:border-black'
                  }
                `}
              >

                {/* SWATCH */}

                <div
                  className={`
                    absolute
                    inset-1
                    rounded-xl
                    ${color.value}
                  `}
                />

                {/* ACTIVE */}

                {isSelected && (

                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        w-6
                        h-6
                        rounded-full
                        bg-white
                        shadow-md
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Check
                        size={14}
                        className="text-black"
                      />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* TEXTURE */}

      <div>

        <div className="flex items-center justify-between mb-5">

          <h3
            className="
              uppercase
              tracking-[0.28em]
              text-xs
              md:text-sm
              text-neutral-500
              font-medium
            "
          >
            Texture
          </h3>

          <span className="text-sm font-medium text-white">
            {currentTexture}
          </span>
        </div>

        <div className="flex flex-wrap gap-4">

          {textures.map((texture) => {

            const isSelected =
              currentTexture ===
              texture

            return (

              <button
                key={texture}

                type="button"

                aria-label={`Select ${texture} texture`}

                onClick={() =>
                  onSelectTexture?.(
                    texture
                  )
                }

                className={`
                  px-7
                  py-4
                  rounded-2xl
                  border
                  text-sm
                  md:text-base
                  font-medium
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-white text-black border-neutral-200 hover:border-black'
                  }
                `}
              >
                {texture}
              </button>
            )
          })}
        </div>
      </div>

      {/* SUMMARY */}

      <div
        className="
          rounded-3xl
          border
          border-neutral-200
          bg-neutral-50
          p-5
        "
      >

        <p
          className="
            text-sm
            text-neutral-600
            leading-7
          "
        >
          Selected:

          <span className="font-medium text-black">
            {' '}
            {currentColor.name}
          </span>

          {' · '}

          <span className="font-medium text-black">
            {currentTexture}
          </span>
        </p>
      </div>
    </div>
  )
}