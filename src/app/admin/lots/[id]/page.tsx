import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getInquiriesForLot,
  getMapLotById,
  RecentInquiriesTable,
} from "@/components/admin";
import {
  LOT_BOARD_COLUMN_LABEL_KO,
  getLotBoardColumn,
} from "@/lib/bpw/lotBoard";
import { LOT_PHASE_LABEL_KO } from "@/lib/bpw/lotInquirySpec";

type Props = { params: Promise<{ id: string }> };

export default async function AdminLotDetailPage({ params }: Props) {
  const { id } = await params;
  const lot = getMapLotById(decodeURIComponent(id));
  if (!lot) {
    notFound();
  }

  const inquiries = getInquiriesForLot(lot.id);
  const boardCol = getLotBoardColumn(lot, inquiries);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {lot.lotCode}
          </h1>
          <p className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">{lot.id}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {LOT_PHASE_LABEL_KO[lot.lotPhase]} · {LOT_BOARD_COLUMN_LABEL_KO[boardCol]}
          </p>
        </div>
        <Link
          href="/admin/lots"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          ← 목록
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          문의 · {inquiries.length}건
        </h2>
        <RecentInquiriesTable rows={inquiries} emptyMessage="문의가 없습니다." />
      </section>

      <p className="text-center text-sm">
        <Link
          href={`/admin/inquiries?lotId=${encodeURIComponent(lot.id)}`}
          className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          문의 목록에서 이 부지만 보기
        </Link>
      </p>
    </div>
  );
}
