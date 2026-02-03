/**
 * Enum Config Sync Tests
 *
 * 測試 Config 的完整性和一致性
 * 注意：由於 Jest/Prisma 兼容性問題，這裡不直接導入 @prisma/client
 * 而是測試 Config 自身的結構完整性
 */

import {
  COURSE_STATUS_CONFIG,
  COURSE_TERM_CONFIG,
  LESSON_STATUS_CONFIG,
  LESSON_TYPE_CONFIG,
  INVOICE_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PARTNERSHIP_STATUS_CONFIG,
  CHARGING_MODEL_CONFIG,
  TUTOR_ROLE_CONFIG,
  USER_ROLE_CONFIG,
  GENDER_CONFIG,
} from "../index";

import type { EnumConfig } from "../types";

/**
 * 通用測試函數：檢查 Config 結構完整性
 */
function testEnumConfig<T extends string>(
  configName: string,
  config: EnumConfig<T>,
  expectedValues: readonly string[]
) {
  describe(`${configName}`, () => {
    test("values should match expected Prisma enum values", () => {
      expect([...config.values].sort()).toEqual([...expectedValues].sort());
    });

    test("all values should have corresponding options", () => {
      config.values.forEach((value) => {
        const hasOption = config.options.some((opt) => opt.value === value);
        expect(hasOption).toBe(true);
      });
    });

    test("all options should have required fields", () => {
      config.options.forEach((opt) => {
        expect(opt.value).toBeDefined();
        expect(opt.label).toBeDefined();
        expect(opt.label.length).toBeGreaterThan(0);
        expect(opt.color).toBeDefined();
        expect(["gray", "green", "yellow", "red", "blue", "purple"]).toContain(opt.color);
      });
    });

    test("no duplicate values in options", () => {
      const values = config.options.map((opt) => opt.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    test("options count should match values count", () => {
      expect(config.options.length).toBe(config.values.length);
    });
  });
}

describe("Enum Config Integrity Tests", () => {
  testEnumConfig("COURSE_STATUS_CONFIG", COURSE_STATUS_CONFIG, [
    "DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED", "SUSPENDED"
  ]);

  testEnumConfig("COURSE_TERM_CONFIG", COURSE_TERM_CONFIG, [
    "FULL_YEAR", "FIRST_TERM", "SECOND_TERM", "SUMMER"
  ]);

  testEnumConfig("LESSON_STATUS_CONFIG", LESSON_STATUS_CONFIG, [
    "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"
  ]);

  testEnumConfig("LESSON_TYPE_CONFIG", LESSON_TYPE_CONFIG, [
    "REGULAR", "MAKEUP", "EXTRA_PRACTICE"
  ]);

  testEnumConfig("INVOICE_STATUS_CONFIG", INVOICE_STATUS_CONFIG, [
    "DRAFT", "PENDING_APPROVAL", "PENDING_SEND", "SENT", "OVERDUE", "PAID", "CANCELLED", "VOID"
  ]);

  testEnumConfig("PAYMENT_METHOD_CONFIG", PAYMENT_METHOD_CONFIG, [
    "CASH", "CHEQUE", "BANK_TRANSFER", "FPS", "PAYME", "ALIPAY_HK", "WECHAT_PAY_HK", "CREDIT_CARD", "AUTOPAY", "OTHER"
  ]);

  testEnumConfig("PAYMENT_STATUS_CONFIG", PAYMENT_STATUS_CONFIG, [
    "PENDING", "PARTIAL", "PAID", "REFUNDED"
  ]);

  testEnumConfig("PARTNERSHIP_STATUS_CONFIG", PARTNERSHIP_STATUS_CONFIG, [
    "INQUIRY", "QUOTATION_SENT", "NEGOTIATING", "CONFIRMED", "ACTIVE", "SUSPENDED", "TERMINATED"
  ]);

  testEnumConfig("CHARGING_MODEL_CONFIG", CHARGING_MODEL_CONFIG, [
    "STUDENT_PER_LESSON", "TUTOR_PER_LESSON", "STUDENT_HOURLY", "TUTOR_HOURLY", "STUDENT_FULL_COURSE", "TEAM_ACTIVITY"
  ]);

  testEnumConfig("TUTOR_ROLE_CONFIG", TUTOR_ROLE_CONFIG, [
    "HEAD_COACH", "ASSISTANT_COACH", "TEACHING_ASSISTANT", "SUBSTITUTE", "STAFF", "NOT_APPLICABLE"
  ]);

  testEnumConfig("USER_ROLE_CONFIG", USER_ROLE_CONFIG, [
    "ADMIN", "STAFF", "TUTOR", "PARENT", "STUDENT", "USER"
  ]);

  testEnumConfig("GENDER_CONFIG", GENDER_CONFIG, [
    "MALE", "FEMALE"
  ]);
});
