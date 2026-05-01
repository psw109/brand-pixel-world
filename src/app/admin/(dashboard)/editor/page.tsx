import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "맵 에디터",
};

export default function AdminEditorPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">맵 에디터</h1>
      <p className="text-sm text-zinc-600">
        심시티식 툴·레이어·저장 흐름은 저장소{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
          docs/dev/MAP_EDITOR.md
        </code>
        를 따릅니다. 본 페이지는 라우트 스캐폴드입니다.
      </p>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        에디터 UI는 추후 이 경로에 연결합니다.
      </div>
    </main>
  );
}
