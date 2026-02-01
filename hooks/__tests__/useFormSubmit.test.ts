import { renderHook, act, waitFor } from "@testing-library/react";
import { useFormSubmit, useAsyncSubmit } from "../useFormSubmit";

jest.mock("@/lib/client", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "@/lib/client";

describe("useFormSubmit", () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初始狀態 isSubmitting 為 false", () => {
    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);
  });

  it("提交成功時 isSubmitting 變化正確", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    let submitPromise: Promise<boolean>;
    act(() => {
      submitPromise = result.current.submit({ name: "Test" });
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("連續點擊被防止", async () => {
    mockOnSubmit.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100)
        )
    );

    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.submit({});
      result.current.submit({});
      result.current.submit({});
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("onSuccess callback 正確觸發", async () => {
    const responseData = { id: 1, name: "Test" };
    mockOnSubmit.mockResolvedValueOnce({ data: responseData, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(responseData);
  });

  it("onError callback 正確觸發", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "提交失敗" });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnError).toHaveBeenCalledWith("提交失敗");
  });

  it("成功時顯示 success toast", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        successMessage: "儲存成功！",
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(toast.success).toHaveBeenCalledWith("儲存成功！");
  });

  it("錯誤時顯示 error toast", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "驗證失敗" });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(toast.error).toHaveBeenCalledWith("驗證失敗");
  });

  it("showSuccessToast: false 不顯示成功 toast", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        showSuccessToast: false,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("showErrorToast: false 不顯示錯誤 toast", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "錯誤" });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        showErrorToast: false,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("自定義 errorMessage 覆蓋 API 錯誤", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "API 錯誤" });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        errorMessage: "自定義錯誤訊息",
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(toast.error).toHaveBeenCalledWith("自定義錯誤訊息");
    expect(mockOnError).toHaveBeenCalledWith("自定義錯誤訊息");
  });

  it("異常處理 - Error 類型", async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error("網絡錯誤"));

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnError).toHaveBeenCalledWith("網絡錯誤");
  });

  it("異常處理 - 非 Error 類型", async () => {
    mockOnSubmit.mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnError).toHaveBeenCalledWith("操作失敗，請稍後再試");
  });

  it("submit 成功返回 true", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    let submitResult: boolean;
    await act(async () => {
      submitResult = await result.current.submit({});
    });

    expect(submitResult!).toBe(true);
  });

  it("submit 失敗返回 false", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "錯誤" });

    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    let submitResult: boolean;
    await act(async () => {
      submitResult = await result.current.submit({});
    });

    expect(submitResult!).toBe(false);
  });

  it("reset 函數正確重置狀態", async () => {
    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});

describe("useAsyncSubmit", () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初始狀態 isLoading 為 false", () => {
    const { result } = renderHook(() => useAsyncSubmit());

    expect(result.current.isLoading).toBe(false);
  });

  it("執行成功返回資料", async () => {
    const mockData = { id: 1, name: "Test" };

    const { result } = renderHook(() =>
      useAsyncSubmit({
        onSuccess: mockOnSuccess,
      })
    );

    let executeResult: typeof mockData | null;
    await act(async () => {
      executeResult = await result.current.execute(async () => ({
        data: mockData,
        error: null,
      }));
    });

    expect(executeResult!).toEqual(mockData);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it("執行失敗返回 null", async () => {
    const { result } = renderHook(() =>
      useAsyncSubmit({
        onError: mockOnError,
      })
    );

    let executeResult: unknown;
    await act(async () => {
      executeResult = await result.current.execute(async () => ({
        data: null,
        error: "執行失敗",
      }));
    });

    expect(executeResult).toBeNull();
    expect(mockOnError).toHaveBeenCalledWith("執行失敗");
  });

  it("連續執行被防止", async () => {
    const mockAsyncFn = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100)
        )
    );

    const { result } = renderHook(() => useAsyncSubmit());

    act(() => {
      result.current.execute(mockAsyncFn);
      result.current.execute(mockAsyncFn);
      result.current.execute(mockAsyncFn);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });

  it("異常處理", async () => {
    const { result } = renderHook(() =>
      useAsyncSubmit({
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error("網絡錯誤");
      });
    });

    expect(mockOnError).toHaveBeenCalledWith("網絡錯誤");
  });

  it("成功顯示 success toast", async () => {
    const { result } = renderHook(() =>
      useAsyncSubmit({
        successMessage: "操作完成",
      })
    );

    await act(async () => {
      await result.current.execute(async () => ({ data: {}, error: null }));
    });

    expect(toast.success).toHaveBeenCalledWith("操作完成");
  });
});
