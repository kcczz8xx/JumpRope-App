# ➕ 新增報價 - Quotations New

> **路徑**: `/dashboard/school/quotations/new`  
> **優先級**: P0  
> **角色**: ADMIN

---

## 📋 頁面概述

多步驟表單，用於記錄學校查詢並建立報價單。支援新增學校或選擇現有學校。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ ➕ 新增報價                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 步驟 1        步驟 2        步驟 3        步驟 4    │   │
│  │ ●──────────────○──────────────○──────────────○      │   │
│  │ 選擇學校      查詢需求      報價項目      預覽確認  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 步驟 1：選擇或新增學校                               │   │
│  │                                                      │   │
│  │ ○ 選擇現有學校                                       │   │
│  │   [ 搜尋學校... ▼ ]                                 │   │
│  │                                                      │   │
│  │ ● 新增學校                                          │   │
│  │   學校名稱（中文）* [________________]              │   │
│  │   學校名稱（英文）  [________________]              │   │
│  │   地址             [________________]              │   │
│  │   電話             [________________]              │   │
│  │                                                      │   │
│  │   ── 聯絡人資料 ──                                  │   │
│  │   姓名（中文）*    [________________]              │   │
│  │   職位             [________________]              │   │
│  │   手提電話         [________________]              │   │
│  │   電郵             [________________]              │   │
│  │                                                      │   │
│  │                              [ 取消 ] [ 下一步 → ] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件         | 路徑                              | 用途     |
| ------------ | --------------------------------- | -------- |
| `Input`      | `components/form/input/`          | 文字輸入 |
| `Select`     | `components/form/Select.tsx`      | 學校選擇 |
| `DatePicker` | `components/form/date-picker.tsx` | 日期選擇 |
| `Button`     | `components/ui/button/`           | 操作按鈕 |
| `Modal`      | `components/ui/modal/`            | 確認彈窗 |

### 需開發組件

| 組件                | 說明           |
| ------------------- | -------------- |
| `StepIndicator`     | 步驟進度條     |
| `SchoolSelector`    | 學校搜尋選擇器 |
| `QuotationItemForm` | 報價項目表單   |
| `QuotationPreview`  | 報價預覽卡片   |

---

## 📊 表單結構

### 步驟 1：選擇或新增學校

```typescript
interface Step1Data {
  mode: "existing" | "new";

  // 選擇現有學校
  schoolId?: string;

  // 新增學校
  newSchool?: {
    schoolName: string;
    schoolNameEnglish?: string;
    schoolType: SchoolType;
    district?: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  // 聯絡人（新學校必填）
  contact?: {
    nameChinese: string;
    nameEnglish?: string;
    position?: string;
    mobile?: string;
    email?: string;
  };
}
```

### 步驟 2：查詢需求

```typescript
interface Step2Data {
  inquiryDate: Date; // 預設今天
  expectedStartDate?: Date;
  expectedStudentCount?: number;
  preferredSchedule?: string; // 文字描述
  inquiryNotes?: string;
}
```

### 步驟 3：報價項目

```typescript
interface Step3Data {
  items: QuotationItemData[];
  validUntil: Date; // 預設 30 天後
  notes?: string;
}

interface QuotationItemData {
  id: string; // 臨時 ID
  courseName: string;
  courseType: CourseType;
  description?: string;
  chargingModel: ChargingModel;
  unitPrice: number;
  quantity: number;
  totalPrice: number; // 自動計算
  lessonsPerWeek?: number;
  lessonDuration?: number;
  expectedStudents?: number;
  requiredTutors?: number;
}
```

### 步驟 4：預覽確認

```typescript
interface Step4Data {
  // 整合前三步資料的唯讀預覽
  confirmed: boolean;
}
```

---

## 🎯 核心功能

### 1. 學校搜尋選擇器

```tsx
// components/school-service/school/SchoolSelector.tsx
interface SchoolSelectorProps {
  value?: string;
  onChange: (schoolId: string) => void;
  onSelect?: (school: School) => void;
}

export function SchoolSelector({
  value,
  onChange,
  onSelect,
}: SchoolSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: schools } = useSWR(
    search.length >= 2 ? `/api/schools?search=${search}` : null,
    fetcher
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="輸入學校名稱搜尋..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
      />

      {isOpen && schools?.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          {schools.map((school: School) => (
            <button
              key={school.id}
              onClick={() => {
                onChange(school.id);
                onSelect?.(school);
                setSearch(school.schoolName);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="font-medium">{school.schoolName}</div>
              {school.district && (
                <div className="text-sm text-gray-500">{school.district}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. 報價項目表單

```tsx
// components/school-service/quotation/QuotationItemForm.tsx
interface QuotationItemFormProps {
  item?: QuotationItemData;
  onSave: (item: QuotationItemData) => void;
  onCancel: () => void;
}

export function QuotationItemForm({
  item,
  onSave,
  onCancel,
}: QuotationItemFormProps) {
  const [formData, setFormData] = useState<QuotationItemData>(
    item || {
      id: crypto.randomUUID(),
      courseName: "",
      courseType: "REGULAR_CLASS",
      chargingModel: "STUDENT_PER_LESSON",
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
    }
  );

  // 自動計算總價
  useEffect(() => {
    let total = formData.unitPrice * formData.quantity;

    // 如果是學生每堂收費，需要乘以預計學生數
    if (
      formData.chargingModel === "STUDENT_PER_LESSON" &&
      formData.expectedStudents
    ) {
      total =
        formData.unitPrice * formData.expectedStudents * formData.quantity;
    }

    setFormData((prev) => ({ ...prev, totalPrice: total }));
  }, [
    formData.unitPrice,
    formData.quantity,
    formData.chargingModel,
    formData.expectedStudents,
  ]);

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>課程名稱 *</Label>
          <Input
            value={formData.courseName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, courseName: e.target.value }))
            }
            placeholder="例：小學花式跳繩初班"
          />
        </div>

        <div>
          <Label>課程類型 *</Label>
          <Select
            value={formData.courseType}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, courseType: value }))
            }
            options={courseTypeOptions}
          />
        </div>

        <div>
          <Label>收費模式 *</Label>
          <Select
            value={formData.chargingModel}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, chargingModel: value }))
            }
            options={chargingModelOptions}
          />
        </div>

        <div>
          <Label>單價 (HK$) *</Label>
          <Input
            type="number"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                unitPrice: Number(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label>數量（堂數）*</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
        </div>

        {formData.chargingModel === "STUDENT_PER_LESSON" && (
          <div>
            <Label>預計學生人數</Label>
            <Input
              type="number"
              value={formData.expectedStudents || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedStudents: Number(e.target.value),
                }))
              }
            />
          </div>
        )}
      </div>

      {/* 課程安排建議 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>每週堂數</Label>
          <Input
            type="number"
            value={formData.lessonsPerWeek || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lessonsPerWeek: Number(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label>每堂時長（分鐘）</Label>
          <Input
            type="number"
            value={formData.lessonDuration || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lessonDuration: Number(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label>所需導師</Label>
          <Input
            type="number"
            value={formData.requiredTutors || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                requiredTutors: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      {/* 小計 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-lg font-medium">
          小計：HK$ {formData.totalPrice.toLocaleString()}
        </span>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={() => onSave(formData)}>
            {item ? "更新" : "新增"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 3. 步驟進度條

```tsx
// components/school-service/common/StepIndicator.tsx
interface StepIndicatorProps {
  steps: { id: number; label: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* 步驟圓點 */}
          <button
            onClick={() => onStepClick?.(step.id)}
            disabled={step.id > currentStep}
            className={cn(
              "flex flex-col items-center",
              step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step.id < currentStep && "bg-green-500 text-white",
                step.id === currentStep && "bg-primary-500 text-white",
                step.id > currentStep &&
                  "bg-gray-200 text-gray-500 dark:bg-gray-700"
              )}
            >
              {step.id < currentStep ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-sm",
                step.id === currentStep
                  ? "text-primary-600 font-medium"
                  : "text-gray-500"
              )}
            >
              {step.label}
            </span>
          </button>

          {/* 連接線 */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4",
                step.id < currentStep
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

---

## 💻 程式碼範例

### 頁面主結構

```tsx
// app/(private)/dashboard/school/quotations/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { StepIndicator } from "@/components/school-service/common/StepIndicator";
import { Step1School } from "./components/Step1School";
import { Step2Inquiry } from "./components/Step2Inquiry";
import { Step3Items } from "./components/Step3Items";
import { Step4Preview } from "./components/Step4Preview";

const steps = [
  { id: 1, label: "選擇學校" },
  { id: 2, label: "查詢需求" },
  { id: 3, label: "報價項目" },
  { id: 4, label: "預覽確認" },
];

export default function NewQuotationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuotationFormData>({
    step1: null,
    step2: null,
    step3: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Complete = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep3Complete = (data: Step3Data) => {
    setFormData((prev) => ({ ...prev, step3: data }));
    setCurrentStep(4);
  };

  const handleSubmit = async (asDraft: boolean) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: asDraft ? "DRAFT" : "SENT",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push(`/dashboard/school/quotations/${result.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("建立報價失敗:", error);
      // 顯示錯誤通知
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageBreadCrumb
        title="新增報價"
        items={[{ label: "報價管理", href: "/dashboard/school/quotations" }]}
      />

      {/* 步驟進度條 */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
      />

      {/* 步驟內容 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {currentStep === 1 && (
          <Step1School
            data={formData.step1}
            onComplete={handleStep1Complete}
            onCancel={() => router.push("/dashboard/school/quotations")}
          />
        )}

        {currentStep === 2 && (
          <Step2Inquiry
            data={formData.step2}
            onComplete={handleStep2Complete}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Items
            data={formData.step3}
            onComplete={handleStep3Complete}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Preview
            formData={formData}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(3)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
```

### API 提交

```typescript
// app/api/quotations/route.ts
export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { step1, step2, step3, status } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 處理學校
      let schoolId: string;

      if (step1.mode === "existing") {
        schoolId = step1.schoolId;
      } else {
        // 建立新學校
        const newSchool = await tx.school.create({
          data: {
            ...step1.newSchool,
            partnershipStatus: "INQUIRY",
          },
        });
        schoolId = newSchool.id;

        // 建立聯絡人
        if (step1.contact) {
          await tx.schoolContact.create({
            data: {
              schoolId,
              ...step1.contact,
              isPrimary: true,
            },
          });
        }
      }

      // 2. 生成報價編號
      const quotationNumber = await generateQuotationNumber(tx);

      // 3. 計算總金額
      const totalAmount = step3.items.reduce(
        (sum: number, item: QuotationItemData) => sum + item.totalPrice,
        0
      );

      // 4. 建立報價單
      const quotation = await tx.schoolQuotation.create({
        data: {
          schoolId,
          quotationNumber,
          quotationDate: new Date(),
          status,
          totalAmount,
          validUntil: step3.validUntil,
          inquiryDate: step2.inquiryDate,
          inquiryNotes: step2.inquiryNotes,
          expectedStartDate: step2.expectedStartDate,
          expectedStudentCount: step2.expectedStudentCount,
          preferredSchedule: step2.preferredSchedule,
          sentDate: status === "SENT" ? new Date() : null,
          createdBy: session.user.id,
        },
      });

      // 5. 建立報價項目
      await tx.schoolQuotationItem.createMany({
        data: step3.items.map((item: QuotationItemData, index: number) => ({
          quotationId: quotation.id,
          courseName: item.courseName,
          courseType: item.courseType,
          description: item.description,
          chargingModel: item.chargingModel,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          lessonsPerWeek: item.lessonsPerWeek,
          lessonDuration: item.lessonDuration,
          expectedStudents: item.expectedStudents,
          requiredTutors: item.requiredTutors,
          sortOrder: index,
        })),
      });

      // 6. 如果發送，更新學校狀態
      if (status === "SENT") {
        await tx.school.update({
          where: { id: schoolId },
          data: { partnershipStatus: "QUOTATION_SENT" },
        });
      }

      return quotation;
    });

    return Response.json(result);
  } catch (error) {
    console.error("建立報價失敗:", error);
    return Response.json({ error: "建立報價失敗" }, { status: 500 });
  }
}
```

---

## ✅ 驗收標準

- [ ] 可選擇現有學校或新增學校
- [ ] 新學校必須填寫聯絡人資料
- [ ] 可新增多個報價項目
- [ ] 金額自動計算正確
- [ ] 步驟可前後切換
- [ ] 預覽頁面顯示完整資料
- [ ] 可儲存為草稿
- [ ] 可建立並發送
- [ ] 報價編號自動生成
