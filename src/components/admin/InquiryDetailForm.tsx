"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateInquiryStatus } from "@/app/admin/inquiries/actions";
import type { InquiryDetail } from "./mockAdminData";
import { INQUIRY_STATUS_OPTIONS } from "./mockAdminData";
import {
  LOT_INQUIRY_STATUS_LABEL_KO,
  LOT_PHASE_LABEL_KO,
} from "@/lib/bpw/lotInquirySpec";
import type { LotInquiryStatus } from "@/lib/bpw/lotInquirySpec";

type Props = {
  inquiry: InquiryDetail;
};

export function InquiryDetailForm({ inquiry }: Props) {
  const [status, setStatus] = useState(inquiry.status);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const canSave = dirty && status !== inquiry.status;

  function handleStatusChange(next: string) {
    setStatus(next as LotInquiryStatus);
    setDirty(next !== inquiry.status);
    setMessage(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateInquiryStatus(inquiry.id, status);
      if (!res.ok) {
        setMessage({ tone: "err", text: res.message });
        return;
      }
      setDirty(false);
      setMessage({
        tone: "ok",
        text: "저장되었습니다. (목업: 새로고침하면 목 데이터 기준으로 다시 불러옵니다.)",
      });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            문의 상세 <span className="font-mono normal-case">lot_inquiry</span>
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {inquiry.lotCode}
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              #{inquiry.id}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {inquiry.applicantDisplay} · 아래에서 문의 상태를 바꾼 뒤 저장할 수 있습니다.
          </p>
        </div>
        <Link
          href="/admin/inquiries"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          목록
        </Link>
      </div>

      <dl className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">map_lot.id</dt>
          <dd className="mt-1 break-all font-mono text-xs text-zinc-900 dark:text-zinc-50">
            {inquiry.mapLotId}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">부지 코드 (UI)</dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {inquiry.lotCode}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">map_lot.lot_phase</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            <span className="font-mono">{inquiry.lotPhase}</span>
            <span className="ml-2 text-zinc-500 dark:text-zinc-400">
              ({LOT_PHASE_LABEL_KO[inquiry.lotPhase]})
            </span>
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">접수일시 (created_at)</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{inquiry.submittedAt}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">표시명 (identity 요약)</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{inquiry.applicantDisplay}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">contact_email</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{inquiry.contactEmail}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">phone_number</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{inquiry.phoneNumber ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">applicant_identity (jsonb)</dt>
          <dd className="mt-1 break-all rounded-md bg-zinc-50 p-2 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {inquiry.applicantIdentityJson}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">message</dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {inquiry.message ?? "—"}
          </dd>
        </div>
      </dl>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div>
          <label
            htmlFor="inquiry-status"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            lot_inquiry.status
          </label>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            DB CHECK: pending · selected · rejected. 선정은 부지당 최대 1건(부분 유니크) 정책과 연동 예정.
          </p>
          <select
            id="inquiry-status"
            name="status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="mt-2 block w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {INQUIRY_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {LOT_INQUIRY_STATUS_LABEL_KO[opt]} ({opt})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSave || pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {pending ? "저장 중…" : "상태 저장"}
          </button>
          {!canSave && !pending && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">변경된 내용이 없습니다.</span>
          )}
        </div>

        {message && (
          <p
            role="status"
            className={
              message.tone === "ok"
                ? "text-sm text-emerald-700 dark:text-emerald-400"
                : "text-sm text-red-600 dark:text-red-400"
            }
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
