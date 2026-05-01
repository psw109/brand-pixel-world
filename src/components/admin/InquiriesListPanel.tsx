"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { InquiryRow } from "./mockAdminData";
import {
  INQUIRY_STATUS_OPTIONS,
  filterInquiriesByListFocus,
  parseInquiryStatusQuery,
} from "./mockAdminData";
import { RecentInquiriesTable } from "./RecentInquiriesTable";
import {
  LOT_INQUIRY_STATUS_LABEL_KO,
  parseInquiryListFocus,
} from "@/lib/bpw/lotInquirySpec";
import type { InquiryListFocus, LotInquiryStatus } from "@/lib/bpw/lotInquirySpec";

type Props = {
  rows: InquiryRow[];
};

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function matchesContactSearch(row: InquiryRow, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const name = row.applicantDisplay.toLowerCase();
  const email = row.contactEmail.toLowerCase();
  const phoneRaw = (row.phoneNumber ?? "").toLowerCase();

  if (name.includes(q) || email.includes(q) || phoneRaw.includes(q)) {
    return true;
  }

  const qDigits = digitsOnly(q);
  if (qDigits.length > 0 && row.phoneNumber) {
    const phoneDigits = digitsOnly(row.phoneNumber);
    if (phoneDigits.includes(qDigits)) return true;
  }

  return false;
}

export function InquiriesListPanel({ rows }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFromUrl = parseInquiryStatusQuery(searchParams.get("status"));
  const focusFromUrl = parseInquiryListFocus(searchParams.get("focus"));
  const lotIdFromUrl = searchParams.get("lotId");
  const [contactQuery, setContactQuery] = useState("");

  const setStatusInUrl = useCallback(
    (next: LotInquiryStatus | "") => {
      const p = new URLSearchParams(searchParams.toString());
      if (next) {
        p.set("status", next);
      } else {
        p.delete("status");
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setFocusInUrl = useCallback(
    (next: InquiryListFocus) => {
      const p = new URLSearchParams(searchParams.toString());
      if (next === "all") {
        p.delete("focus");
      } else {
        p.set("focus", next);
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearLotIdFromUrl = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("lotId");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const filtered = useMemo(() => {
    let out = filterInquiriesByListFocus(rows, focusFromUrl);
    if (lotIdFromUrl) {
      out = out.filter((r) => r.mapLotId === lotIdFromUrl);
    }
    out = out.filter((r) => matchesContactSearch(r, contactQuery));
    if (statusFromUrl) {
      out = out.filter((r) => r.status === statusFromUrl);
    }
    return out;
  }, [rows, contactQuery, statusFromUrl, focusFromUrl, lotIdFromUrl]);

  const hasFilters =
    focusFromUrl !== "all" ||
    contactQuery.trim() !== "" ||
    statusFromUrl !== null ||
    lotIdFromUrl !== null;

  function clearAllFilters() {
    setContactQuery("");
    setStatusInUrl("");
    setFocusInUrl("all");
    clearLotIdFromUrl();
  }

  return (
    <div className="space-y-4">
      {lotIdFromUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <span>
            한 부지만 보기(<span className="font-mono text-xs">{lotIdFromUrl.slice(0, 8)}…</span>)
          </span>
          <button
            type="button"
            onClick={clearLotIdFromUrl}
            className="shrink-0 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium hover:bg-amber-100 dark:border-amber-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            부지 한정 해제
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-4xl">
          <div>
            <label
              htmlFor="inquiry-focus-filter"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              부지 단계 뷰
            </label>
            <select
              id="inquiry-focus-filter"
              value={focusFromUrl === "all" ? "" : focusFromUrl}
              onChange={(e) => {
                const v = e.target.value;
                setFocusInUrl(v === "" ? "all" : (v as "development" | "completed"));
              }}
              className="mt-1 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">전체 (총 문의)</option>
              <option value="development">개발 진행 (공사)</option>
              <option value="completed">완료</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="inquiry-status-filter"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              lot_inquiry.status
            </label>
            <select
              id="inquiry-status-filter"
              value={statusFromUrl ?? ""}
              onChange={(e) => {
                const v = e.target.value as LotInquiryStatus | "";
                setStatusInUrl(v);
              }}
              className="mt-1 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">전체</option>
              {INQUIRY_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {LOT_INQUIRY_STATUS_LABEL_KO[opt]} ({opt})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="inquiry-contact-search"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              검색 (신청인 · 이메일 · 연락처)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="inquiry-contact-search"
                type="search"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="이름, 메일, 전화번호 일부"
                autoComplete="off"
                className="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              {contactQuery.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => setContactQuery("")}
                  className="h-10 shrink-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  지움
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {filtered.length} / {rows.length}건
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              필터 전체 초기화
            </button>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        URL:{" "}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">?focus=</code>,{" "}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">?status=</code>,{" "}
        <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">?lotId=</code>(부지 한정)
      </p>

      <RecentInquiriesTable
        rows={filtered}
        emptyMessage={
          hasFilters
            ? "조건에 맞는 문의가 없습니다."
            : "표시할 문의가 없습니다."
        }
      />
    </div>
  );
}
