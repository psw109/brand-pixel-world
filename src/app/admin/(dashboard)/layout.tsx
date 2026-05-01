import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 text-sm"
          aria-label="관리자 내비게이션"
        >
          <Link href="/admin" className="font-semibold text-zinc-900">
            관리자
          </Link>
          <Link
            href="/admin/editor"
            className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            맵 에디터
          </Link>
          <Link
            href="/admin/inquiries"
            className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            입점 문의
          </Link>
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-l border-zinc-200 pl-6">
            <AdminLogoutButton />
            <Link
              href="/"
              className="text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
            >
              사이트 홈
            </Link>
          </div>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</div>
    </>
  );
}
