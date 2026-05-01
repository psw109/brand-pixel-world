import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function AdminHomePage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">관리자</h1>
        <p className="mt-2 text-sm text-zinc-600">
          하위 메뉴에서 도구를 선택하세요. 공개 사이트에는 이 영역 링크를 두지
          않습니다.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/editor"
            className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
          >
            <span className="font-semibold text-zinc-900">맵 에디터</span>
            <p className="mt-1 text-sm text-zinc-600">
              타일·오브젝트·부지·건물 편집 (구현 예정)
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/inquiries"
            className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
          >
            <span className="font-semibold text-zinc-900">입점 문의</span>
            <p className="mt-1 text-sm text-zinc-600">
              부지 문의 목록·처리 (구현 예정)
            </p>
          </Link>
        </li>
      </ul>
    </main>
  );
}
