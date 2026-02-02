/**
 * OTP 相關常量配置
 */

export const OTP_CONFIG = {
    /** OTP 有效期（毫秒）- 10 分鐘 */
    EXPIRY_MS: 10 * 60 * 1000,

    /** 註冊 OTP 驗證窗口（毫秒）- 30 分鐘 */
    REGISTER_VERIFY_WINDOW_MS: 30 * 60 * 1000,

    /** 聯繫方式更新 OTP 驗證窗口（毫秒）- 10 分鐘 */
    UPDATE_CONTACT_VERIFY_WINDOW_MS: 10 * 60 * 1000,

    /** OTP 長度 */
    CODE_LENGTH: 6,

    /** 最大嘗試次數 */
    MAX_ATTEMPTS: 5,
} as const;
