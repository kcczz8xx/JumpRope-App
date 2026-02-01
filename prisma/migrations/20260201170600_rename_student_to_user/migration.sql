-- AlterEnum: Rename STUDENT to USER
-- PostgreSQL doesn't support renaming enum values directly
-- We need to recreate the enum type

-- Step 1: Drop default constraint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- Step 2: Create new enum type
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'TUTOR', 'ADMIN', 'STAFF');

-- Step 3: Alter column to use new type (with cast)
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'STUDENT' THEN 'USER'
    ELSE "role"::text
  END
)::"UserRole_new";

-- Step 4: Drop old enum and rename new one
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Step 5: Restore default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";