/**
 * User Schemas - Address
 * 用戶地址驗證規則
 */

import { z } from "zod";

export const updateAddressSchema = z.object({
  region: z.string().optional(),
  district: z.string().min(1, "請選擇地區"),
  address: z.string().min(1, "請輸入詳細地址").max(200, "地址不能超過 200 字元"),
});

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
