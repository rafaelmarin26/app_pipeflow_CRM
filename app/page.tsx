import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Temporary scaffold page: proves the tokens, the font and the theme toggle.
 * Replaced by the marketing landing in M3.
 */

const surfaceTokens = [
  { name: "--bg", className: "bg-bg" },
  { name: "--surface", className: "bg-surface" },
  { name: "--border", className: "bg-border" },
  { name: "--text", className: "bg-text" },
  { name: "--muted", className: "bg-muted" },
];

const brandTokens = [
  { name: "--primary", className: "bg-primary" },
  { name: "--primary-hover", className: "bg-primary-hover" },
  { name: "--accent", className: "bg-accent" },
];

const funnelTokens = [
  { name: "--won", label: "Fechado Ganho", className: "bg-won" },
  { name: "--lost", label: "Fechado Perdido", className: "bg-lost" },
  { name: "--open", label: "Negócio aberto", className: "bg-open" },
  { name: "--due", label: "Prazo próximo", className: "bg-due" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">PipeFlow CRM</h1>
          <p className="mt-1 text-sm text-muted">
            Fundação do projeto: tokens, tipografia e tema. As telas começam no M3.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Superfícies</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {surfaceTokens.map((token) => (
            <Swatch key={token.name} name={token.name} className={token.className} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Marca</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {brandTokens.map((token) => (
            <Swatch key={token.name} name={token.name} className={token.className} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Funil</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {funnelTokens.map((token) => (
            <Swatch
              key={token.name}
              name={token.name}
              label={token.label}
              className={token.className}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Valores monetários</h2>
        <table className="mt-3 w-full max-w-xs text-sm">
          <tbody>
            {["1.250,00", "980,50", "12.400,00"].map((value) => (
              <tr key={value} className="border-b border-border">
                <td className="h-11 text-muted">Negócio</td>
                <td className="h-11 money text-right font-medium">R$ {value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Swatch({
  name,
  label,
  className,
}: {
  name: string;
  label?: string;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className={`h-10 rounded-lg border border-border ${className}`} />
      <p className="mt-2 text-xs text-muted">{name}</p>
      {label ? <p className="text-xs font-medium">{label}</p> : null}
    </div>
  );
}
