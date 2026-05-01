import Link from "next/link";
import { MOCK_RECENT_INQUIRIES } from "./mockAdminData";

export function AdminDashboardKpiCards() {
  const rows = MOCK_RECENT_INQUIRIES;
  const total = rows.length;
  const development = rows.filter((r) => r.lotPhase === "construction").length;
  const completed = rows.filter((r) => r.lotPhase === "built").length;

  const items = [
    {
      label: "총 문의",
      count: total,
      unit: "건",
      href: "/admin/inquiries",
      hint: "전체 문의 목록",
    },
    {
      label: "개발 진행",
      count: development,
      unit: "건",
      href: "/admin/inquiries?focus=development",
      hint: "부지 단계가 공사(construction)인 문의",
    },
    {
      label: "완료",
      count: completed,
      unit: "건",
      href: "/admin/inquiries?focus=completed",
      hint: "부지 단계가 완료(built)인 문의",
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ label, count, unit, href, hint }) => (
        <Link
          key={href}
          href={href}
          className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm outline-none ring-zinc-400 transition hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {count}
            <span className="ml-1 text-base font-normal text-zinc-500">{unit}</span>
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
        </Link>
      ))}
    </div>
  );
}
