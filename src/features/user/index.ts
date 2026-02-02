/**
 * User Feature - 用戶模組
 * 公開 API
 */

// Components
export { default as ProfilePageContent } from "./components/profile/ProfilePageContent";

// Actions
export {
    updateProfileAction,
    updateAddressAction,
    deleteAddressAction,
    updateBankAction,
    deleteBankAction,
    createChildAction,
    updateChildAction,
    deleteChildAction,
    createTutorDocumentAction,
    updateTutorDocumentAction,
    deleteTutorDocumentAction,
} from "./actions";

// Queries - 已移至 ./server.ts（僅供 Server Components 使用）
// import { getProfile, ... } from "@/features/user/server";

// Schemas
export {
    updateProfileSchema,
    updateAddressSchema,
    updateBankSchema,
    createChildSchema,
    updateChildSchema,
    deleteChildSchema,
    createTutorDocumentSchema,
    updateTutorDocumentSchema,
    deleteTutorDocumentSchema,
} from "./schemas";

// Types
export type {
    UpdateProfileInput,
    UpdateAddressInput,
    UpdateBankInput,
    CreateChildInput,
    UpdateChildInput,
    DeleteChildInput,
    CreateTutorDocumentInput,
    UpdateTutorDocumentInput,
    DeleteTutorDocumentInput,
} from "./schemas";
