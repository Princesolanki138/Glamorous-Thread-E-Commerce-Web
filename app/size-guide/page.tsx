import type { Metadata } from 'next'
import StaticPage, { Section } from '@/component/common/StaticPage'

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Hair length chart and wig cap size guidance to help you choose the right Glamorous Thread product.',
}

export default function Page() {
  return (
    <StaticPage
      title="Size Guide"
      label="Help"
      intro="Choosing the right length and cap size makes the difference between hair that looks worn and hair that looks like yours."
    >
      <Section heading="Hair Length Guide">
        <p>Lengths are measured from the top of the base to the tip of the hair when straight. Curly and wavy textures will appear shorter when worn.</p>
        <div className="overflow-x-auto rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A]">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-[#555555]">
                <th className="px-5 py-4 font-medium">Length</th>
                <th className="px-5 py-4 font-medium">Approx.</th>
                <th className="px-5 py-4 font-medium">Falls At</th>
              </tr>
            </thead>
            <tbody className="text-[#8A8A8A]">
            <tr className="border-t border-[#2A2A2A]">
              <td className="px-5 py-3 text-white">10&Prime;</td>
              <td className="px-5 py-3">25 cm</td>
              <td className="px-5 py-3">Chin length</td>
            </tr>
            <tr className="border-t border-[#2A2A2A]">
              <td className="px-5 py-3 text-white">14&Prime;</td>
              <td className="px-5 py-3">36 cm</td>
              <td className="px-5 py-3">Shoulder length</td>
            </tr>
            <tr className="border-t border-[#2A2A2A]">
              <td className="px-5 py-3 text-white">18&Prime;</td>
              <td className="px-5 py-3">46 cm</td>
              <td className="px-5 py-3">Just below the collarbone</td>
            </tr>
            <tr className="border-t border-[#2A2A2A]">
              <td className="px-5 py-3 text-white">22&Prime;</td>
              <td className="px-5 py-3">56 cm</td>
              <td className="px-5 py-3">Mid-back</td>
            </tr>
            <tr className="border-t border-[#2A2A2A]">
              <td className="px-5 py-3 text-white">26&Prime;</td>
              <td className="px-5 py-3">66 cm</td>
              <td className="px-5 py-3">Waist length</td>
            </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section heading="Wig Cap Sizes">
        <p>To measure, run a soft tape around your head: across the forehead just above the ears, and around the nape of the neck.</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[#D4D4D4]">
          <li><strong className="text-[#D4D4D4]">Petite</strong> &mdash; approx. 20.5&Prime; (52 cm) head circumference.</li>
          <li><strong className="text-[#D4D4D4]">Average</strong> &mdash; approx. 22&Prime; (56 cm). This fits the majority of wearers.</li>
          <li><strong className="text-[#D4D4D4]">Large</strong> &mdash; approx. 23.5&Prime; (60 cm).</li>
        </ul>
      </Section>

      <Section heading="Toppers and Patches">
        <p>Toppers are sized by their base, not by head circumference. Choose a base that comfortably covers the area of thinning with a little margin on each side, so the clips attach to denser hair and stay secure.</p>
        <p>Not sure which to choose? Send us a photo on WhatsApp and we will recommend a size honestly, including telling you if a smaller, cheaper piece would serve you better.</p>
      </Section>

    </StaticPage>
  )
}
