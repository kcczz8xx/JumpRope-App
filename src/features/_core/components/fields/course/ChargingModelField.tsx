import { CHARGING_MODEL_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 收費模式欄位
 *
 * @description 顯示課程收費模式
 * @example
 * ```tsx
 * <ChargingModelField
 *   value={chargingModel}
 *   onChange={setChargingModel}
 *   label="收費模式"
 * />
 * ```
 */
export const ChargingModelField = createEnumField(
  "ChargingModelField",
  CHARGING_MODEL_CONFIG.options,
  "blue"
);
