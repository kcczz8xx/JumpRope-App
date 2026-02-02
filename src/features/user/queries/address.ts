/**
 * User Queries - Address
 * 用戶地址查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, type ActionResult } from "@/lib/actions";

export async function getAddress(): Promise<
  ActionResult<{
    id: string;
    region: string | null;
    district: string | null;
    address: string | null;
  } | null>
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const address = await prisma.userAddress.findUnique({
    where: { userId: auth.data.id },
    select: {
      id: true,
      region: true,
      district: true,
      address: true,
    },
  });

  return success(address);
}
