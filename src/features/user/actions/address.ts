"use server";

/**
 * User Actions - Address
 * 用戶地址操作
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { updateAddressSchema } from "../schemas/address";

export const updateAddressAction = safeAction(updateAddressSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { region, district, address } = input;

  const updatedAddress = await prisma.userAddress.upsert({
    where: { userId },
    update: {
      region: region || null,
      district,
      address,
    },
    create: {
      userId,
      region: region || null,
      district,
      address,
    },
  });

  return success({ message: "地址更新成功", address: updatedAddress });
});

export async function deleteAddressAction() {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const existingAddress = await prisma.userAddress.findUnique({
    where: { userId },
  });

  if (!existingAddress) {
    return failure("NOT_FOUND", "沒有地址資料可刪除");
  }

  await prisma.userAddress.delete({
    where: { userId },
  });

  return success({ message: "地址已刪除" });
}
