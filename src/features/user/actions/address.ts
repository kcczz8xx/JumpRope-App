"use server";

/**
 * User Actions - Address
 * 用戶地址操作
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import type { UserAddress } from "@prisma/client";
import { createAction, success, failure } from "@/lib/patterns";
import { updateAddressSchema, type UpdateAddressInput } from "../schemas/address";

/**
 * 更新用戶地址
 */
export const updateAddressAction = createAction<
  UpdateAddressInput,
  { message: string; address: UserAddress }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;
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
  },
  {
    schema: updateAddressSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_ADDRESS_UPDATE",
    auditResource: "user_address",
  }
);

/**
 * 刪除用戶地址
 */
export const deleteAddressAction = createAction<void, { message: string }>(
  async (_, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;

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
  },
  {
    requireAuth: true,
    audit: true,
    auditAction: "USER_ADDRESS_DELETE",
    auditResource: "user_address",
  }
);
