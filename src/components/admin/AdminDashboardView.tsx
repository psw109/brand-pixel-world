import Link from "next/link";
import { AdminDashboardKpiCards } from "./AdminDashboardKpiCards";
import { RecentInquiriesTable } from "./RecentInquiriesTable";
import { MOCK_RECENT_INQUIRIES, sortInquiriesBySubmittedDesc } from "./mockAdminData";

const RECENT_LIMIT = 5;

export function AdminDashboardView() {
  const recentRows = sortInquiriesBySubmittedDesc(MOCK_RECENT_INQUIRIES).slice(
    0,
    RECENT_LIMIT,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          상단 카드를 누르면 문의 목록이 같은 기준으로 필터됩니다. 부지별 목록은{" "}
          <Link
            href="/admin/lots"
            className="font-medium text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            부지 목록
          </Link>
          에서 보세요.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">요약</h2>
        <AdminDashboardKpiCards />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">최근 문의</h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              접수일시 기준 {RECENT_LIMIT}건
            </p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            전체 보기
          </Link>
        </div>
        <RecentInquiriesTable
          rows={recentRows}
          receiptOrderStart={1}
          emptyMessage="문의가 없습니다."
        />
      </section>
    </div>
  );
}
