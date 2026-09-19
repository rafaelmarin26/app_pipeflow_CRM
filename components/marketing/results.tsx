import { Reveal } from "@/components/marketing/reveal";

/**
 * The results band — four numbers, four rules above them.
 *
 * No colour on the figures. In this palette the accent means "you are pointing
 * at this" and a stage colour means "this is that stage of the funnel"
 * (CLAUDE.md §7); a marketing statistic is neither, and painting a percentage
 * green only because it sounds like good news would start a third vocabulary.
 * The typographic contrast — Syne at display size over a mono label — is what
 * carries the band.
 */

const RESULTS = [
  { figure: "+47%", label: "de conversão no funil" },
  { figure: "3.2x", label: "mais leads qualificados" },
  { figure: "-62%", label: "no ciclo de venda" },
  { figure: "1200+", label: "times usando o PipeFlow" },
];

export function Results() {
  return (
    <section className="border-y border-hairline">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
        {RESULTS.map((result, index) => (
          <Reveal key={result.figure} delayMs={index * 80}>
            <div className="h-full bg-canvas px-5 py-10 text-center sm:px-6 sm:py-12">
              <p className="display-lg text-3xl text-foreground sm:text-4xl">
                {result.figure}
              </p>
              <p className="label-mono mt-3 text-faint">{result.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
