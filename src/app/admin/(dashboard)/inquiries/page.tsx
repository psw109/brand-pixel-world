import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "입점 문의",
};

export default function AdminInquiriesPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">입점 문의</h1>
      <p className="text-sm text-zinc-600">
        Supabase{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
          lot_inquiry
        </code>{" "}
        연동·목록 UI는 추후 구현합니다. 스키마 정본은 저장소{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
          docs/DB.md
        </code>
        입니다.
      </p>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        문의 목록 테이블은 추후 이 경로에 연결합니다.
      </div>
    </main>
  );
}
