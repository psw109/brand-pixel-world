import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "로그인",
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">관리자 로그인</h1>
        <p className="text-sm text-zinc-600">
          인증된 세션만 `/admin` 하위 페이지를 볼 수 있습니다.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            불러오는 중…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
