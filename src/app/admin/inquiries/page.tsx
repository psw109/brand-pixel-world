import { Suspense } from "react";
import { InquiriesListPanel, MOCK_RECENT_INQUIRIES } from "@/components/admin";

export default function AdminInquiriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          문의 목록
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          검색은 신청인 이름·이메일·연락처 일부로 찾습니다.{" "}
          <span className="font-mono text-xs">focus</span>·<span className="font-mono text-xs">status</span>·
          <span className="font-mono text-xs">lotId</span>
          로도 좁힐 수 있습니다(목업).
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-zinc-500 dark:text-zinc-400">목록 필터 불러오는 중…</p>
        }
      >
        <InquiriesListPanel rows={MOCK_RECENT_INQUIRIES} />
      </Suspense>
    </div>
  );
}
