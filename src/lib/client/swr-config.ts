/**
 * SWR 全局配置
 */

import type { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
};
