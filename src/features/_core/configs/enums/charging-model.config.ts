/**
 * ChargingModel Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { ChargingModel } from "@prisma/client";
import type { EnumConfig } from "./types";

export const CHARGING_MODEL_CONFIG: EnumConfig<ChargingModel> = {
  values: Object.values(ChargingModel),
  options: [
    { value: ChargingModel.STUDENT_PER_LESSON, label: "學生每節課堂", color: "blue" },
    { value: ChargingModel.TUTOR_PER_LESSON, label: "導師每堂節數", color: "green" },
    { value: ChargingModel.STUDENT_HOURLY, label: "學生課堂時數", color: "blue" },
    { value: ChargingModel.TUTOR_HOURLY, label: "導師時薪節數", color: "green" },
    { value: ChargingModel.STUDENT_FULL_COURSE, label: "學生全期課程", color: "purple" },
    { value: ChargingModel.TEAM_ACTIVITY, label: "帶隊活動", color: "yellow" },
  ],
  default: ChargingModel.STUDENT_PER_LESSON,
};
