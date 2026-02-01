# 導師文件管理系統

## 概述

導師文件管理系統用於處理導師相關的證書和文件上傳、驗證和管理。

## 目錄結構

```
components/feature/user/profile/
├── UserTutorCard.tsx              # 主卡片組件（包含所有 Modal）
└── tutor-documents/
    ├── index.ts                   # 統一導出
    ├── types.ts                   # 類型定義、常量、配置
    ├── FileUploadArea.tsx         # 文件上傳組件（拖放、驗證）
    ├── DocumentTable.tsx          # 文件表格組件
    └── TutorDocumentEditModal.tsx # 通用文件編輯 Modal
```

## 文件類型（DocumentType）

| 類型                      | 說明                          | 必須 |
| ------------------------- | ----------------------------- | ---- |
| `IDENTITY_DOCUMENT`       | 香港身份證                    | ✅   |
| `SEXUAL_CONVICTION_CHECK` | 性罪行定罪紀錄查核            | ✅   |
| `BANK_DOCUMENT`           | 銀行資料文件（月結單/銀行卡） | ❌   |
| `ADDRESS_PROOF`           | 住址證明（郵寄支票/文件用）   | ❌   |
| `FIRST_AID_CERTIFICATE`   | 急救證書                      | ❌   |
| `COACHING_CERTIFICATE`    | 教練證書                      | ❌   |
| `OTHER_CERTIFICATE`       | 其他證書                      | ❌   |

## API 端點

### `/api/user/tutor/document`

| 方法     | 說明                       |
| -------- | -------------------------- |
| `GET`    | 獲取當前用戶的所有導師文件 |
| `POST`   | 上傳新文件（FormData）     |
| `PUT`    | 更新現有文件               |
| `DELETE` | 刪除文件（需要 `id` 參數） |

### FormData 參數

```typescript
{
  documentType: DocumentType;  // 必須
  name: string;                // 必須
  referenceNumber?: string;    // 性罪行查核用
  certificateType?: string;    // 急救證書用
  issuingBody?: string;        // 簽發機構
  issueDate?: string;          // 簽發日期
  expiryDate?: string;         // 到期日期（空字串表示永久有效）
  notes?: string;              // 備註
  file?: File;                 // 文件（新增時必須）
}
```

## 文件存儲

使用 **Vercel Blob** 存儲文件：

- 路徑格式：`tutor-documents/{userId}/{documentType}/{timestamp}-{sanitizedFileName}`
- 支援格式：PDF、JPG、PNG
- 最大大小：5MB

### 環境變量

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 使用方式

### 導入組件

```tsx
// 導入主卡片
import UserTutorCard from "@/components/feature/user/profile/UserTutorCard";

// 導入子組件和類型
import {
  TutorDocumentEditModal,
  DocumentTable,
  DocumentType,
  TutorDocumentFormData,
} from "@/components/feature/user/profile/tutor-documents";
```

### 使用 UserTutorCard

```tsx
<UserTutorCard
  identityDocument={identityDoc}
  sexualConvictionCheck={scrcDoc}
  bankDocument={bankDoc}
  addressProof={addressDoc}
  firstAidCertificate={firstAidDoc}
  coachingCertificates={coachingDocs}
  otherCertificates={otherDocs}
/>
```

## Prisma Schema

```prisma
// prisma/schema/tutor.prisma

enum DocumentStatus {
  VALID
  EXPIRED
  EXPIRING_SOON
  PENDING
  NOT_SUBMITTED
}

enum DocumentType {
  IDENTITY_DOCUMENT
  SEXUAL_CONVICTION_CHECK
  BANK_DOCUMENT
  ADDRESS_PROOF
  FIRST_AID_CERTIFICATE
  COACHING_CERTIFICATE
  OTHER_CERTIFICATE
}

model TutorDocument {
  id              String         @id @default(cuid())
  tutorProfileId  String
  tutorProfile    TutorProfile   @relation(fields: [tutorProfileId], references: [id])
  documentType    DocumentType
  name            String
  status          DocumentStatus @default(PENDING)
  referenceNumber String?
  certificateType String?
  issuingBody     String?
  issueDate       DateTime?
  expiryDate      DateTime?
  documentUrl     String?
  uploadDate      DateTime?
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

## 待辦事項

- [ ] 實作文件審核流程（管理員端）
- [ ] 新增文件到期提醒通知
- [ ] 實作文件版本歷史記錄
