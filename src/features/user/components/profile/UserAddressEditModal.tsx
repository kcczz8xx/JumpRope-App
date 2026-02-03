"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import Button from "@/components/tailadmin/ui/button/Button";
import { FormError } from "@/components/shared/forms";
import {
  HK_REGIONS,
  getRegionByDistrict,
} from "@/lib/constants/hk-address-data";
import { updateAddressSchema, type UpdateAddressInput } from "../../schemas";

export type UserAddressFormData = UpdateAddressInput;

interface UserAddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserAddressFormData) => void;
  onDelete?: () => void;
  initialData?: Partial<UserAddressFormData>;
  isLoading?: boolean;
  hasExistingData?: boolean;
}

export default function UserAddressEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = {},
  isLoading = false,
  hasExistingData = false,
}: UserAddressEditModalProps) {
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initDistrict = initialData.district || "";
      const initRegion =
        initialData.region || getRegionByDistrict(initDistrict);

      setRegion(initRegion);
      setDistrict(initDistrict);
      setAddress(initialData.address || "");
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setDistrict("");
  };

  const districtOptions = useMemo(() => {
    const selectedRegionData = HK_REGIONS.find((r) => r.value === region);
    return selectedRegionData ? selectedRegionData.districts : [];
  }, [region]);

  const regionOptions = HK_REGIONS.map((r) => ({
    value: r.value,
    label: r.label,
  }));

  const handleSave = () => {
    const formData = { region, district, address };
    const result = updateAddressSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(result.data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-5 lg:p-8"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          編輯地址
        </h4>

        <div className="space-y-5">
          <div>
            <Label>地域</Label>
            <SearchableSelect
              options={regionOptions}
              placeholder="請選擇地域（香港島/九龍/新界）"
              defaultValue={region}
              onChange={handleRegionChange}
            />
          </div>

          <div>
            <Label>地區</Label>
            <SearchableSelect
              options={districtOptions}
              placeholder={region ? "請選擇或搜尋分區" : "請先選擇地域"}
              defaultValue={district}
              onChange={(val) => {
                setDistrict(val);
                setErrors((prev) => ({ ...prev, district: "" }));
              }}
            />
            <FormError message={errors.district} />
          </div>

          <div>
            <Label>詳細地址</Label>
            <TextArea
              placeholder="請輸入屋苑、大廈名稱、座數及室號"
              value={address}
              onChange={(val) => {
                setAddress(val);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
              rows={3}
            />
            {!errors.address && (
              <p className="mt-1 text-xs text-gray-400">無需重複填寫地區</p>
            )}
            <FormError message={errors.address} />
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-6">
          {hasExistingData && onDelete ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={isLoading}
              className="text-error-500 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-500/50 dark:hover:bg-error-500/10"
            >
              刪除資料
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
