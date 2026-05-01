import Link from "next/link";
import { Suspense } from "react";
import { AdminLotListSection, MOCK_MAP_LOTS, MOCK_RECENT_INQUIRIES } from "@/components/admin";

export default function AdminLotsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            부지 목록
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            운영 단계로 필터한 뒤 행을 펼치면 해당 부지 문의를 볼 수 있습니다.
          </p>
        </div>
        <Link
          href="/admin/inquiries"
          className="shrink-0 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          문의 목록
        </Link>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500 dark:text-zinc-400">목록 불러오는 중…</p>
        }
      >
        <AdminLotListSection
          lots={MOCK_MAP_LOTS}
          inquiries={MOCK_RECENT_INQUIRIES}
          syncPhaseToUrl
        />
      </Suspense>
    </div>
  );
}
