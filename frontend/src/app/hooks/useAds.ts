'use client';

import { baseURL } from "@/Utils/Utils";
import { useCallback, useEffect, useState } from "react";

const API_BASE = baseURL;

export interface Ad {
  _id?: string;
  title: string;
  link: string;
  headerImageUrl?: string;
  sidebarImageUrl?: string;
  imageUrl: string;
  placement?: 'header' | 'sidebar' | 'in-article';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  msg?: string;
  ad?: T;
  ads?: T;
  data?: T;
  total?: number;
  [key: string]: any;
}

type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UseApiMutationResult<T> = {
  mutate: (data?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
};

class AdService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}/promotions${endpoint}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.msg || `API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  addAd = (ad: Omit<Ad, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Ad>> =>
    this.request("/add", { method: "POST", body: JSON.stringify(ad) });

  getAllAds = (): Promise<ApiResponse<Ad[]>> => this.request("/all");

  getActiveAds = (): Promise<ApiResponse<Ad[]>> => this.request("/active");

  updateAd = (id: string, ad: Partial<Ad>): Promise<ApiResponse<Ad>> =>
    this.request(`/update/${id}`, { method: "PUT", body: JSON.stringify(ad) });

  deleteAd = (id: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/delete/${id}`, { method: "DELETE" });
}

export const adService = new AdService();

export const useApi = <T,>(fetchFn: () => Promise<ApiResponse<T>>): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchFn();

      if (!res.success) {
        throw new Error(res.msg || "API returned success: false");
      }

      const payload = res.data ?? res.ads ?? res.ad ?? null;
      setData(payload as T);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    let mounted = true;
    load().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
};

export const useApiMutation = <T,>(mutateFn: (data?: any) => Promise<T>): UseApiMutationResult<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data?: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await mutateFn(data);
        return res;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutateFn]
  );

  return { mutate, loading, error };
};

export const useAllAds = (): UseApiResult<Ad[]> =>
  useApi<Ad[]>(() => adService.getAllAds());

export const useActiveAds = (): UseApiResult<Ad[]> =>
  useApi<Ad[]>(() => adService.getActiveAds());

export const useAddAd = (): UseApiMutationResult<ApiResponse<Ad>> =>
  useApiMutation<ApiResponse<Ad>>(adService.addAd);

export const useUpdateAd = (id: string): UseApiMutationResult<ApiResponse<Ad>> =>
  useApiMutation<ApiResponse<Ad>>((data: Partial<Ad>) =>
    adService.updateAd(id, data)
  );

export const useDeleteAd = (id: string): UseApiMutationResult<ApiResponse<{ deleted: boolean }>> =>
  useApiMutation<ApiResponse<{ deleted: boolean }>>(() =>
    adService.deleteAd(id)
  );
