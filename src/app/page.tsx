import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Brand Pixel World</h1>
        <p className="text-zinc-600">
          Next.js + TypeScript 초기 세팅이 완료된 상태입니다.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-semibold">현재 준비된 항목</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          <li>App Router 기반 Next.js 프로젝트</li>
          <li>Supabase 클라이언트 유틸 및 환경변수 스키마</li>
          <li>도메인 타입 초안 (lot/building/interaction/footprint)</li>
          <li>헬스 체크 API (`/api/health`)</li>
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-semibold">다음 단계</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
          <li>
            <code>.env.local</code>에 Supabase URL/anon key 입력
          </li>
          <li>Vercel 대시보드에서 GitHub Import</li>
          <li>Vercel 환경변수(Local/Preview/Production) 설정</li>
          <li>월드(Phaser) + 오버레이(React) 화면 골격 구현 시작</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href="/village">
          마을 맵 (Phaser)
        </Link>
        <Link className="underline" href="/api/health">
          health 확인
        </Link>
      </div>
    </main>
  );
}
