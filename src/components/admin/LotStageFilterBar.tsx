"use client";

import type { LotListStageFilter } from "@/lib/bpw/lotBoard";
import { LOT_LIST_STAGE_LABEL_KO } from "@/lib/bpw/lotBoard";

const OPTIONS: LotListStageFilter[] = ["all", "presales", "development", "done"];

type Props = {
  phase: LotListStageFilter;
  onChange: (next: LotListStageFilter) => void;
  resultCount: number;
  totalCount: number;
};

export function LotStageFilterBar({
  phase,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor="lot-stage-filter"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          운영 단계
        </label>
        <select
          id="lot-stage-filter"
          value={phase}
          onChange={(e) => onChange(e.target.value as LotListStageFilter)}
          className="h-10 min-w-[12rem] rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {OPTIONS.map((v) => (
            <option key={v} value={v}>
              {LOT_LIST_STAGE_LABEL_KO[v]}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
        {resultCount} / {totalCount}필지
      </p>
    </div>
  );
}
