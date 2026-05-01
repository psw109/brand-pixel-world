"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOT_INQUIRY_STATUSES } from "@/lib/bpw/lotInquirySpec";

const statusSchema = z.enum(LOT_INQUIRY_STATUSES);

/**
 * lot_inquiry.status 변경 (목업: DB 미연동)
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const id = inquiryId.trim();
  if (!id) {
    return { ok: false, message: "문의 ID가 없습니다." };
  }

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, message: "허용되지 않은 상태 값입니다." };
  }

  await new Promise((r) => setTimeout(r, 150));

  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");

  return { ok: true };
}
