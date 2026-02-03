import { parsePhoneNumber } from "libphonenumber-js";

export const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return "-";
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
  } catch (error) {
    // 如果解析失敗，返回原始值
  }
  return phone;
};

export const formatYearLabel = (year: string) => {
  if (year.includes("-")) {
    return `${year}年度`;
  }
  return `${year}年度`;
};
