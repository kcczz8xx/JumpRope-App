import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  isAdmin,
  isStaffOrAdmin,
  isTutor,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  PERMISSIONS,
} from "../permissions";

describe("RBAC Permissions", () => {
  describe("hasPermission", () => {
    it("ADMIN 可存取 ADMIN_DASHBOARD", () => {
      expect(hasPermission("ADMIN", "ADMIN_DASHBOARD")).toBe(true);
    });

    it("USER 無法存取 ADMIN_DASHBOARD", () => {
      expect(hasPermission("USER", "ADMIN_DASHBOARD")).toBe(false);
    });

    it("STAFF 可存取 STAFF_DASHBOARD", () => {
      expect(hasPermission("STAFF", "STAFF_DASHBOARD")).toBe(true);
    });

    it("ADMIN 可存取 STAFF_DASHBOARD", () => {
      expect(hasPermission("ADMIN", "STAFF_DASHBOARD")).toBe(true);
    });

    it("USER 可存取 USER_PROFILE_READ_OWN", () => {
      expect(hasPermission("USER", "USER_PROFILE_READ_OWN")).toBe(true);
    });

    it("TUTOR 可存取 TUTOR_DOCUMENT_CREATE", () => {
      expect(hasPermission("TUTOR", "TUTOR_DOCUMENT_CREATE")).toBe(true);
    });

    it("PARENT 可存取 CHILD_CREATE", () => {
      expect(hasPermission("PARENT", "CHILD_CREATE")).toBe(true);
    });

    it("undefined 角色返回 false", () => {
      expect(hasPermission(undefined, "USER_PROFILE_READ_OWN")).toBe(false);
    });

    it("null 角色返回 false", () => {
      expect(hasPermission(null, "USER_PROFILE_READ_OWN")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("有任一權限返回 true", () => {
      expect(
        hasAnyPermission("USER", ["ADMIN_DASHBOARD", "USER_PROFILE_READ_OWN"])
      ).toBe(true);
    });

    it("無任何權限返回 false", () => {
      expect(
        hasAnyPermission("USER", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(false);
    });

    it("空權限陣列返回 false", () => {
      expect(hasAnyPermission("ADMIN", [])).toBe(false);
    });

    it("undefined 角色返回 false", () => {
      expect(hasAnyPermission(undefined, ["USER_PROFILE_READ_OWN"])).toBe(false);
    });

    it("null 角色返回 false", () => {
      expect(hasAnyPermission(null, ["USER_PROFILE_READ_OWN"])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("擁有所有權限返回 true", () => {
      expect(
        hasAllPermissions("ADMIN", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(true);
    });

    it("缺少任一權限返回 false", () => {
      expect(
        hasAllPermissions("STAFF", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(false);
    });

    it("空權限陣列返回 true", () => {
      expect(hasAllPermissions("USER", [])).toBe(true);
    });

    it("undefined 角色返回 false", () => {
      expect(hasAllPermissions(undefined, ["USER_PROFILE_READ_OWN"])).toBe(
        false
      );
    });

    it("null 角色返回 false", () => {
      expect(hasAllPermissions(null, ["USER_PROFILE_READ_OWN"])).toBe(false);
    });
  });

  describe("isRoleAtLeast", () => {
    it("STAFF 角色至少是 USER", () => {
      expect(isRoleAtLeast("STAFF", "USER")).toBe(true);
    });

    it("USER 角色不是 ADMIN", () => {
      expect(isRoleAtLeast("USER", "ADMIN")).toBe(false);
    });

    it("ADMIN 角色至少是 ADMIN", () => {
      expect(isRoleAtLeast("ADMIN", "ADMIN")).toBe(true);
    });

    it("TUTOR 角色至少是 PARENT", () => {
      expect(isRoleAtLeast("TUTOR", "PARENT")).toBe(true);
    });

    it("STUDENT 角色不是 TUTOR", () => {
      expect(isRoleAtLeast("STUDENT", "TUTOR")).toBe(false);
    });

    it("undefined 角色返回 false", () => {
      expect(isRoleAtLeast(undefined, "USER")).toBe(false);
    });

    it("null 角色返回 false", () => {
      expect(isRoleAtLeast(null, "USER")).toBe(false);
    });
  });

  describe("Helper Functions", () => {
    describe("isAdmin", () => {
      it("ADMIN 返回 true", () => {
        expect(isAdmin("ADMIN")).toBe(true);
      });

      it("STAFF 返回 false", () => {
        expect(isAdmin("STAFF")).toBe(false);
      });

      it("undefined 返回 false", () => {
        expect(isAdmin(undefined)).toBe(false);
      });

      it("null 返回 false", () => {
        expect(isAdmin(null)).toBe(false);
      });
    });

    describe("isStaffOrAdmin", () => {
      it("ADMIN 返回 true", () => {
        expect(isStaffOrAdmin("ADMIN")).toBe(true);
      });

      it("STAFF 返回 true", () => {
        expect(isStaffOrAdmin("STAFF")).toBe(true);
      });

      it("USER 返回 false", () => {
        expect(isStaffOrAdmin("USER")).toBe(false);
      });

      it("TUTOR 返回 false", () => {
        expect(isStaffOrAdmin("TUTOR")).toBe(false);
      });

      it("undefined 返回 false", () => {
        expect(isStaffOrAdmin(undefined)).toBe(false);
      });
    });

    describe("isTutor", () => {
      it("TUTOR 返回 true", () => {
        expect(isTutor("TUTOR")).toBe(true);
      });

      it("USER 返回 false", () => {
        expect(isTutor("USER")).toBe(false);
      });

      it("undefined 返回 false", () => {
        expect(isTutor(undefined)).toBe(false);
      });
    });
  });

  describe("Constants", () => {
    it("ROLE_HIERARCHY 包含所有角色", () => {
      expect(ROLE_HIERARCHY).toHaveProperty("ADMIN");
      expect(ROLE_HIERARCHY).toHaveProperty("STAFF");
      expect(ROLE_HIERARCHY).toHaveProperty("TUTOR");
      expect(ROLE_HIERARCHY).toHaveProperty("PARENT");
      expect(ROLE_HIERARCHY).toHaveProperty("STUDENT");
      expect(ROLE_HIERARCHY).toHaveProperty("USER");
    });

    it("ROLE_HIERARCHY 數值正確排序", () => {
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.STAFF);
      expect(ROLE_HIERARCHY.STAFF).toBeGreaterThan(ROLE_HIERARCHY.TUTOR);
      expect(ROLE_HIERARCHY.TUTOR).toBeGreaterThan(ROLE_HIERARCHY.PARENT);
      expect(ROLE_HIERARCHY.PARENT).toBeGreaterThan(ROLE_HIERARCHY.STUDENT);
      expect(ROLE_HIERARCHY.STUDENT).toBeGreaterThan(ROLE_HIERARCHY.USER);
    });

    it("ROLE_LABELS 包含所有角色標籤", () => {
      expect(ROLE_LABELS.ADMIN).toBe("管理員");
      expect(ROLE_LABELS.STAFF).toBe("職員");
      expect(ROLE_LABELS.TUTOR).toBe("導師");
      expect(ROLE_LABELS.PARENT).toBe("家長");
      expect(ROLE_LABELS.STUDENT).toBe("學員");
      expect(ROLE_LABELS.USER).toBe("用戶");
    });

    it("PERMISSIONS 包含關鍵權限定義", () => {
      expect(PERMISSIONS.ADMIN_DASHBOARD).toContain("ADMIN");
      expect(PERMISSIONS.STAFF_DASHBOARD).toContain("STAFF");
      expect(PERMISSIONS.STAFF_DASHBOARD).toContain("ADMIN");
      expect(PERMISSIONS.USER_PROFILE_READ_OWN).toContain("USER");
    });
  });
});
