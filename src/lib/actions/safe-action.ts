/**
 * Server Actions 安全包裝器
 * 自動處理 Zod 驗證和錯誤轉換
 */

import { ZodError, type ZodTypeAny, type z } from "zod";
import { type ActionResult, failure } from "./types";

export function safeAction<TSchema extends ZodTypeAny, TOut>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<ActionResult<TOut>>
) {
  return async (rawInput: unknown): Promise<ActionResult<TOut>> => {
    try {
      const input = schema.parse(rawInput);
      return await handler(input);
    } catch (err) {
      if (err instanceof ZodError) {
        return failure(
          "VALIDATION_ERROR",
          "輸入資料無效",
          err.flatten().fieldErrors as Record<string, string[]>
        );
      }
      console.error("Action error:", err);
      return failure("INTERNAL_ERROR", "系統錯誤，請稍後再試");
    }
  };
}

export function safeActionWithoutSchema<TOut>(
  handler: () => Promise<ActionResult<TOut>>
) {
  return async (): Promise<ActionResult<TOut>> => {
    try {
      return await handler();
    } catch (err) {
      console.error("Action error:", err);
      return failure("INTERNAL_ERROR", "系統錯誤，請稍後再試");
    }
  };
}
