# Context 目錄清理

## 清理日期
2026-02-02

## 清理原因

發現 `context/` 目錄中存在過時的 Context Providers，這些使用舊的外部 API 認證系統，與項目現有的 NextAuth + lib/rbac 架構重複且不兼容。

## 已刪除的文件

### Context 文件
| 文件 | 說明 |
|------|------|
| `context/AuthContext.tsx` | 舊的 JWT 認證系統，使用 localStorage 和外部 API |
| `context/TenantContext.tsx` | 多租戶功能，依賴舊 AuthContext |
| `context/PermissionContext.tsx` | 舊權限系統，與 `hooks/usePermission.ts` + `lib/rbac/` 重複 |

### 相關文件
| 文件 | 說明 |
|------|------|
| `hooks/useTenantTheme.ts` | 依賴 TenantContext |
| `components/tailadmin/layout/TenantThemeProvider.tsx` | 租戶主題 Provider |
| `components/tailadmin/ui/PermissionAwareComponent.tsx` | 依賴舊 PermissionContext |
| `components/tailadmin/navigation/PermissionAwareNavigation.tsx` | 依賴舊 PermissionContext |
| `components/tailadmin/__tests__/PermissionAwareComponent.test.tsx` | 測試文件 |

## 保留的 Context 文件

| 文件 | 用途 |
|------|------|
| `SessionProvider.tsx` | NextAuth session 包裝 |
| `SWRProvider.tsx` | SWR 全局配置 |
| `SidebarContext.tsx` | 側邊欄展開/收合狀態 |
| `ThemeContext.tsx` | 深色/淺色主題切換 |

## Layout 變更

### 修改前
```tsx
<SessionProvider>
  <SWRProvider>
    <AuthProvider>           // 已移除
      <TenantProvider>       // 已移除
        <PermissionProvider> // 已移除
          <ThemeProvider>
            <TenantThemeProvider>  // 已移除
              <SidebarProvider>{children}</SidebarProvider>
            </TenantThemeProvider>
          </ThemeProvider>
        </PermissionProvider>
      </TenantProvider>
    </AuthProvider>
  </SWRProvider>
  <Toaster />
</SessionProvider>
```

### 修改後
```tsx
<SessionProvider>
  <SWRProvider>
    <ThemeProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  </SWRProvider>
  <Toaster />
</SessionProvider>
```

## 現有認證/權限系統

項目使用以下系統（無需變更）：

- **認證**：`lib/auth/` (NextAuth v5)
- **權限**：`lib/rbac/` + `hooks/usePermission.ts`
- **Session**：`context/SessionProvider.tsx`

## 清理效果

- 移除了 7 個過時/重複文件
- 移除了 console.log 測試日誌輸出
- 簡化了 Provider 嵌套層級（從 7 層減少到 4 層）
- 消除了對外部 API (`NEXT_PUBLIC_API_URL`) 的依賴
