/**
 * DB 명세 참고용 — 상세 보조 설명 (스키마 미생성)
 */
export function InquiryDetailAside() {
  return (
    <aside className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">명세 정리</h2>
      <ul className="list-inside list-disc space-y-2 leading-relaxed">
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">lot_inquiry</strong>:{" "}
          <span className="font-mono">contact_email</span>,{" "}
          <span className="font-mono">phone_number</span>,{" "}
          <span className="font-mono">applicant_identity</span> (jsonb),{" "}
          <span className="font-mono">status</span>는{" "}
          <span className="font-mono">pending | selected | rejected</span>만.
        </li>
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">map_lot.lot_phase</strong>는 캐시 필드(
          <span className="font-mono">vacant | contact | construction | built</span>)이며, 건물·문의
          변경 시 재계산합니다.
        </li>
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">applicant_brand</strong>,{" "}
          <span className="font-mono">extra</span>는 상세 폼 확장 시 추가하면 됩니다.
        </li>
        <li>
          같은 <span className="font-mono">map_lot</span>에 여러 문의가 있으면, 목록에서 부지 코드·
          <span className="font-mono">map_lot.id</span>로 묶어 보면 됩니다.
        </li>
      </ul>
    </aside>
  );
}
