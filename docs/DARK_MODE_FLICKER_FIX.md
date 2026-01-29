# Dark Mode 閃爍問題修復

## 問題描述

在 Dark Mode 下重新整理頁面時會出現閃爍現象，頁面會先顯示 Light Mode 然後快速切換到 Dark Mode。

## 根本原因

1. **SSR/CSR 不匹配**：服務端渲染時無法訪問 `localStorage`，默認渲染 Light Mode
2. **客戶端水合延遲**：React 在 `useEffect` 中才讀取 `localStorage` 並應用主題
3. **CSS Transition 閃爍**：主題切換時的過渡效果在初始載入時也會觸發

## 解決方案

### 1. 阻塞腳本防止閃爍

在 `app/dashboard/layout.tsx` 的 `<head>` 中添加同步執行的腳本：

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            const theme = localStorage.getItem('theme') || 'light';
            const root = document.documentElement;
            
            // 防止初始載入時的 transition 閃爍
            root.classList.add('no-transitions');
            
            if (theme === 'dark') {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
            
            // 設置 data-theme 屬性
            root.setAttribute('data-theme', theme);
            
            // 頁面載入後移除 no-transitions
            window.addEventListener('load', function() {
              root.classList.remove('no-transitions');
            });
          } catch (e) {}
        })();
      `,
    }}
  />
</head>
```

**關鍵點**：

- 腳本在 `<head>` 中同步執行，在頁面渲染前就應用主題
- 添加 `no-transitions` class 防止過渡效果閃爍
- 頁面載入完成後移除 `no-transitions`，恢復正常過渡效果

### 2. CSS 防閃爍樣式

在 `app/dashboard/globals.css` 中添加：

```css
@layer base {
  /* 防止頁面初始載入時的主題切換閃爍 */
  .no-transitions,
  .no-transitions *,
  .no-transitions *::before,
  .no-transitions *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

### 3. 優化 ThemeContext

簡化 `context/ThemeContext.tsx`：

```tsx
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    localStorage.setItem("theme", theme);
    root.setAttribute("data-theme", theme);

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**改進點**：

- 使用 lazy initializer 直接從 `localStorage` 讀取初始值
- 移除不必要的 `isInitialized` state
- 添加 `data-theme` 屬性設置，與阻塞腳本保持一致

### 4. HTML 標籤優化

在 `app/dashboard/layout.tsx` 添加 `suppressHydrationWarning`：

```tsx
<html lang="en" suppressHydrationWarning>
```

這會抑制 React 因為阻塞腳本修改 DOM 而產生的水合警告。

## 工作流程

1. **頁面載入開始**

   - 阻塞腳本立即執行
   - 從 `localStorage` 讀取主題
   - 添加 `dark` class（如需要）
   - 添加 `no-transitions` class

2. **React 水合**

   - ThemeContext 從 `localStorage` 讀取相同值
   - 狀態與 DOM 保持一致
   - 無閃爍發生

3. **頁面載入完成**

   - 移除 `no-transitions` class
   - 恢復正常的過渡效果

4. **用戶切換主題**
   - React state 更新
   - `useEffect` 觸發
   - 更新 `localStorage`、`data-theme` 和 `dark` class
   - 正常過渡效果生效

## 測試步驟

1. 切換到 Dark Mode
2. 重新整理頁面（Cmd+R 或 F5）
3. 確認沒有閃爍現象
4. 切換回 Light Mode
5. 再次重新整理頁面
6. 確認沒有閃爍現象

## 相關文件

- `app/dashboard/layout.tsx` - 阻塞腳本和 HTML 配置
- `app/dashboard/globals.css` - 防閃爍 CSS 樣式
- `context/ThemeContext.tsx` - 主題狀態管理
- `components/common/ThemeToggleButton.tsx` - 主題切換按鈕
- `components/common/ThemeTogglerTwo.tsx` - 備用主題切換按鈕

## 注意事項

- 阻塞腳本必須在 `<head>` 中，確保在頁面渲染前執行
- `suppressHydrationWarning` 只應用於 `<html>` 標籤
- `no-transitions` class 會暫時禁用所有過渡效果，確保頁面載入後移除
- 此解決方案適用於所有基於 Tailwind CSS dark mode 的 Next.js 應用

## 參考資料

- [Next.js Dark Mode Best Practices](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#preventing-flash-of-unstyled-content)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Preventing Flash of Incorrect Theme](https://www.joshwcomeau.com/react/dark-mode/)
