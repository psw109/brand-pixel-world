"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminLotList } from "./AdminLotList";
import { LotStageFilterBar } from "./LotStageFilterBar";
import type { InquiryRow, MapLotRow } from "./mockAdminData";
import {
  filterLotsByStageFilter,
  parseLotListStageFilter,
  type LotListStageFilter,
} from "@/lib/bpw/lotBoard";

type Props = {
  lots: MapLotRow[];
  inquiries: InquiryRow[];
  /** `true`면 `?phase=` 와 동기화 (`/admin/lots` 전용) */
  syncPhaseToUrl?: boolean;
};

export function AdminLotListSection({
  lots,
  inquiries,
  syncPhaseToUrl = false,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlPhase = parseLotListStageFilter(searchParams.get("phase"));
  const [localPhase, setLocalPhase] = useState<LotListStageFilter>("all");

  const phase = syncPhaseToUrl ? urlPhase : localPhase;

  const setPhase = useCallback(
    (next: LotListStageFilter) => {
      if (syncPhaseToUrl) {
        const p = new URLSearchParams(searchParams.toString());
        if (next === "all") {
          p.delete("phase");
        } else {
          p.set("phase", next);
        }
        const qs = p.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      } else {
        setLocalPhase(next);
      }
    },
    [pathname, router, searchParams, syncPhaseToUrl],
  );

  const filteredLots = useMemo(
    () => filterLotsByStageFilter(lots, inquiries, phase),
    [lots, inquiries, phase],
  );

  return (
    <div className="space-y-3">
      <LotStageFilterBar
        phase={phase}
        onChange={setPhase}
        resultCount={filteredLots.length}
        totalCount={lots.length}
      />
      <AdminLotList lots={filteredLots} inquiries={inquiries} />
      {syncPhaseToUrl ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          URL:{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            ?phase=presales|development|done
          </code>
          · 문의·예약 = 칸반「문의·접수」+「예약 진행」필지
        </p>
      ) : null}
    </div>
  );
}
