import Link from "next/link";
import { MOCK_INQUIRIES, MOCK_MAP_LOTS, ProgressLotsTable } from "@/components/admin";
import {
  PROGRESS_PAGE_STAGE_LABEL_KO,
  PROGRESS_PAGE_STAGES,
  buildProgressLotRows,
  filterProgressLotRows,
  parseProgressPageStage,
  sortProgressLotRows,
  type ProgressPageStage,
} from "@/lib/bpw/progressLots";

function stageHelp(stage: ProgressPageStage): string {
  switch (stage) {
    case "reserved":
      return "예약 확정(선정 후·공사 전) 필지만.";
    case "construction":
      return "공사(construction) 단계 필지만.";
    case "built":
      return "완료(built) 필지만.";
    case "pipeline":
    default:
      return "문의만 접수 중인 필지는 제외하고, 예약 확정 이후~완료까지 표시합니다.";
  }
}

export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageRaw } = await searchParams;
  const stage = parseProgressPageStage(stageRaw);

  const rows = sortProgressLotRows(
    filterProgressLotRows(buildProgressLotRows(MOCK_MAP_LOTS, MOCK_INQUIRIES), stage),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          진행 목록
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stageHelp(stage)}</p>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        {PROGRESS_PAGE_STAGES.map((key) => {
          const href =
            key === "pipeline" ? "/admin/progress" : `/admin/progress?stage=${key}`;
          const active = stage === key;
          return (
            <Link
              key={key}
              href={href}
              className={`rounded-full border px-3 py-1.5 font-medium transition ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500"
              }`}
            >
              {PROGRESS_PAGE_STAGE_LABEL_KO[key]}
            </Link>
          );
        })}
      </nav>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        map_lot 기준 · 칸반「문의·접수」에만 있는 필지는 이 화면에 나오지 않습니다. 접수 중 문의는{" "}
        <Link
          href="/admin/inquiries"
          className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          문의 목록
        </Link>
        을 이용하세요.
      </p>

      <ProgressLotsTable
        rows={rows}
        emptyMessage="이 조건에 맞는 부지가 없습니다."
      />
    </div>
  );
}
