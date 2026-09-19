"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DEAL_STAGE_LABELS, isClosedStage } from "@/lib/labels";
import type { FunnelStage } from "@/lib/metrics";
import { STAGE_COLOR } from "@/lib/stage-styles";
import { formatCurrency } from "@/lib/utils";
import type { DealStage } from "@/types/database";

/**
 * The sales funnel — PLAN.md M8.
 *
 * **Why bars and not a trapezoid.** Recharts ships a `FunnelChart`, and it
 * assumes every step is a narrowing of the one above it. Our sixth stage is not:
 * `won` and `lost` are two outcomes of the fourth stage, not a fifth and sixth
 * narrowing, and stacking them into one tapering shape would draw a claim the
 * data does not make. So the four open stages are one chart, the two outcomes
 * are another, they share an x domain so their bars stay comparable, and a
 * hairline separates them — the same divider the Kanban board draws before its
 * closed columns.
 *
 * Bar length is the deal count, because a funnel is about how many survive each
 * step. The money is one hover away, in the tooltip.
 */

/** Height of one stage row. Matches the 44px table density of CLAUDE.md §7. */
const ROW_HEIGHT = 44;

/** Vertical breathing room inside the plot area, above and below the bars. */
const CHART_PADDING = 8;

type FunnelDatum = FunnelStage;

/**
 * The category label, in the product's label voice and in its own stage colour —
 * so the axis says the same thing as the badge on a card and the header of a
 * Kanban column. SVG has no `text-transform`, hence the uppercase here.
 */
function StageTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const stage = payload?.value as DealStage | undefined;
  if (!stage) return null;

  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill={STAGE_COLOR[stage]}
      fontFamily="var(--font-mono)"
      fontSize={11}
      fontWeight={500}
      letterSpacing="0.12em"
    >
      {DEAL_STAGE_LABELS[stage].toUpperCase()}
    </text>
  );
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: FunnelDatum }[];
}) {
  const datum = active ? payload?.[0]?.payload : undefined;
  if (!datum) return null;

  return (
    <div className="rounded-md border border-border bg-elevated px-3 py-2 shadow-lg shadow-black/40">
      <p
        className="label-mono flex items-center gap-1.5"
        style={{ color: STAGE_COLOR[datum.stage] }}
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: STAGE_COLOR[datum.stage] }}
          aria-hidden
        />
        {DEAL_STAGE_LABELS[datum.stage]}
      </p>

      <p className="mt-1.5 text-sm text-foreground">
        {datum.count === 1 ? "1 negócio" : `${datum.count} negócios`}
      </p>
      <p className="money text-xs text-muted-foreground">
        {formatCurrency(datum.totalCents)}
      </p>
    </div>
  );
}

/**
 * One of the two stacked charts. Both are handed the same `domainMax`, which is
 * what makes a bar of three in the lower chart exactly as long as a bar of three
 * in the upper one — two independent charts would otherwise each rescale to
 * their own maximum and quietly lie about the comparison.
 */
function StageBars({
  data,
  domainMax,
}: {
  data: FunnelDatum[];
  domainMax: number;
}) {
  return (
    <ResponsiveContainer
      width="100%"
      height={data.length * ROW_HEIGHT + CHART_PADDING * 2}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: CHART_PADDING, right: 8, bottom: CHART_PADDING, left: 0 }}
        barCategoryGap="30%"
      >
        <XAxis type="number" domain={[0, domainMax]} hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={158}
          tickLine={false}
          axisLine={false}
          tick={<StageTick />}
          interval={0}
        />
        <Tooltip
          content={<FunnelTooltip />}
          cursor={{ fill: "var(--surface-2)" }}
        />

        <Bar
          dataKey="count"
          radius={[0, 2, 2, 0]}
          maxBarSize={18}
          // Recharts grows its bars from zero width on mount, which is a second
          // entrance stacked on the panel's own fade-and-rise — and CLAUDE.md
          // §7 allows one per screen. It is also the fragile one: a bar mid-
          // animation is a zero-width rectangle that Recharts renders as
          // nothing at all, so any frame the browser skips leaves the chart
          // blank. The panel carries the entrance; the bars are drawn final.
          isAnimationActive={false}
        >
          {data.map((datum) => (
            <Cell key={datum.stage} fill={STAGE_COLOR[datum.stage]} />
          ))}

          <LabelList
            dataKey="count"
            position="right"
            offset={10}
            fill="var(--text-secondary)"
            fontFamily="var(--font-mono)"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SalesFunnel({ data }: { data: FunnelStage[] }) {
  const open = data.filter((datum) => !isClosedStage(datum.stage));
  const closed = data.filter((datum) => isClosedStage(datum.stage));

  // A domain of zero would collapse the axis, so an empty funnel still scales
  // to one — every bar then has length zero, which is the truth.
  const domainMax = Math.max(1, ...data.map((datum) => datum.count)) * 1.18;

  return (
    <div className="space-y-1">
      <StageBars data={open} domainMax={domainMax} />

      <div className="border-t border-hairline pt-1">
        <StageBars data={closed} domainMax={domainMax} />
      </div>
    </div>
  );
}
