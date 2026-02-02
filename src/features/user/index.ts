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

// Queries
export {
    getProfile,
    getAddress,
    getBankAccount,
    getChildren,
    getTutorDocuments,
} from "./queries";

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
} from "./schema";

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
} from "./schema";
