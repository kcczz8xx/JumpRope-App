import { apiGet, apiPost, apiPut, apiPatch, apiDelete, api } from "../api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("apiGet", () => {
    it("成功請求返回 { data, error: null }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, name: "Test" } }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toEqual({ id: 1, name: "Test" });
      expect(result.error).toBeNull();
    });

    it("success: false 返回錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: "資料不存在" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("資料不存在");
    });

    it("HTTP 404 返回 { data: null, error: '...' }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Not found");
    });

    it("HTTP 500 返回 { data: null, error: '...' }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Internal server error");
    });

    it("HTTP 錯誤且無法解析 JSON 返回通用錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("請求失敗 (500)");
    });

    it("網絡錯誤返回 { data: null, error: '...' }", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Network error");
    });

    it("非 Error 類型異常返回通用錯誤", async () => {
      mockFetch.mockRejectedValueOnce("Unknown error");

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("網絡錯誤");
    });

    it("成功但 JSON 解析失敗返回錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Parse error");
        },
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("回應解析失敗");
    });

    it("回應無 data 欄位時返回整個物件", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 1, name: "Test" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toEqual({ success: true, id: 1, name: "Test" });
      expect(result.error).toBeNull();
    });
  });

  describe("apiPost", () => {
    it("成功 POST 請求", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1 } }),
      });

      const result = await apiPost("/api/test", { name: "Test" });

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(result.data).toEqual({ id: 1 });
      expect(result.error).toBeNull();
    });

    it("POST 無 body 時不傳 body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await apiPost("/api/test");

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      });
    });

    it("success: false 返回錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: "Validation failed" }),
      });

      const result = await apiPost("/api/test", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Validation failed");
    });

    it("網絡錯誤返回錯誤", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await apiPost("/api/test", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Connection refused");
    });
  });

  describe("apiPut", () => {
    it("成功 PUT 請求", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, updated: true } }),
      });

      const result = await apiPut("/api/test/1", { name: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      });
      expect(result.data).toEqual({ id: 1, updated: true });
    });

    it("PUT 錯誤處理", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Resource not found" }),
      });

      const result = await apiPut("/api/test/999", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Resource not found");
    });
  });

  describe("apiPatch", () => {
    it("成功 PATCH 請求", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, patched: true } }),
      });

      const result = await apiPatch("/api/test/1", { name: "Patched" });

      expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Patched" }),
      });
      expect(result.data).toEqual({ id: 1, patched: true });
    });
  });

  describe("apiDelete", () => {
    it("成功 DELETE 請求", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { deleted: true } }),
      });

      const result = await apiDelete("/api/test/1");

      expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      expect(result.data).toEqual({ deleted: true });
    });

    it("DELETE 錯誤處理", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "Permission denied" }),
      });

      const result = await apiDelete("/api/test/1");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Permission denied");
    });
  });

  describe("api object", () => {
    it("api.get 與 apiGet 相同", () => {
      expect(api.get).toBe(apiGet);
    });

    it("api.post 與 apiPost 相同", () => {
      expect(api.post).toBe(apiPost);
    });

    it("api.put 與 apiPut 相同", () => {
      expect(api.put).toBe(apiPut);
    });

    it("api.patch 與 apiPatch 相同", () => {
      expect(api.patch).toBe(apiPatch);
    });

    it("api.delete 與 apiDelete 相同", () => {
      expect(api.delete).toBe(apiDelete);
    });
  });
});
