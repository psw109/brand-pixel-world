import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiryById, InquiryDetailAside, InquiryDetailForm } from "@/components/admin";

type Props = { params: Promise<{ id: string }> };

export default async function AdminInquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = getInquiryById(id);
  if (!inquiry) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <InquiryDetailForm key={inquiry.id} inquiry={inquiry} />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)]">
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/20 dark:text-zinc-400">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">타임라인 · 메모 · 첨부</p>
          <p className="mt-2">
            DB 연동 후 이 영역에 상태 변경 이력, 내부 메모, 파일을 두면 됩니다.
          </p>
          <Link
            href="/admin/inquiries"
            className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            ← 문의 목록
          </Link>
        </div>
        <InquiryDetailAside />
      </div>
    </div>
  );
}
