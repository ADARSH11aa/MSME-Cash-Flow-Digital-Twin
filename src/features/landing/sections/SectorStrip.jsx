import Reveal from './Reveal';

/**
 * Sector strip (PRD 3.1.3) — the reference's logo wall, replaced with the
 * sectors this product actually serves, since real MSME logos would be
 * fabricated social proof.
 */

const SECTORS = ['Textiles', 'Furniture', 'Electronics retail', 'Food processing', 'Auto parts'];

export default function SectorStrip() {
  return (
    <section className="border-b border-edge-dark py-12">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="text-center text-label-xs uppercase text-chalk-lo">
            Built for MSMEs across sectors
          </p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {SECTORS.map((sector) => (
              <li
                key={sector}
                className="border border-edge-dark px-4 py-2 text-label-xs uppercase text-chalk-lo"
              >
                {sector}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
