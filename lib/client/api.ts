/**
 * API Client Wrapper
 * 統一處理 API 請求、錯誤處理、類型安全
 */

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type RequestOptions = Omit<RequestInit, "body" | "method">;

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || errorData.message || `請求失敗 (${response.status})`;
    return { data: null, error: errorMessage };
  }

  try {
    const data = await response.json();
    if (data.success === false) {
      return { data: null, error: data.error || data.message || "操作失敗" };
    }
    return { data: data.data ?? data, error: null };
  } catch {
    return { data: null, error: "回應解析失敗" };
  }
}

export async function apiGet<T>(
  url: string,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "網絡錯誤",
    };
  }
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "網絡錯誤",
    };
  }
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "網絡錯誤",
    };
  }
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "網絡錯誤",
    };
  }
}

export async function apiDelete<T>(
  url: string,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "網絡錯誤",
    };
  }
}

export async function apiUpload<T>(
  url: string,
  formData: FormData,
  options?: Omit<RequestOptions, "body">
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "上傳失敗",
    };
  }
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  upload: apiUpload,
};
