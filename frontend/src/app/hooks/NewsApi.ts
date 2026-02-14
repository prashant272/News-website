'use client';

import { baseURL } from "@/Utils/Utils";
import { useCallback, useEffect, useState } from "react";

const API_BASE = baseURL;

export interface NewsItem {
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  summary?: string;
  content: string;
  image?: string;
  tags: string[];
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
  isLatest?: boolean;
  isTrending?: boolean;
  section?: string;
  [key: string]: any;
}

export interface NewsSections {
  india?: NewsItem[];
  sports?: NewsItem[];
  business?: NewsItem[];
  entertainment?: NewsItem[];
  lifestyle?: NewsItem[];
  health?: NewsItem[];
  technology?: NewsItem[];
  world?: NewsItem[];
  education?: NewsItem[];
  environment?: NewsItem[];
  science?: NewsItem[];
  opinion?: NewsItem[];
  auto?: NewsItem[];
  travel?: NewsItem[];
  awards?: NewsItem[];
  state?: NewsItem[];
}

export interface NewsDocument extends NewsSections {
  _id: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated?: string;
  isActive: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  msg?: string;
  news?: T;
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

class NewsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}/news${endpoint}`;
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

  addNews = (news: Omit<NewsItem, "id"> & { section: string }): Promise<ApiResponse<NewsItem>> =>
    this.request("/addnews", { method: "POST", body: JSON.stringify(news) });

  getAllNews = (): Promise<ApiResponse<NewsDocument[]>> => this.request("/getallnews");

  getNewsBySection = (section: string): Promise<ApiResponse<NewsItem[]>> =>
    this.request(`/getnewsbysection/${section}`);

  getNewsBySlug = (section: string, slug: string): Promise<ApiResponse<NewsItem>> =>
    this.request(`/getnewsbyslug/${section}/${slug}`);

  updateNews = (params: { section: string; slug: string; data: Partial<NewsItem> }): Promise<ApiResponse<NewsItem>> =>
    this.request(`/updatenews/${params.section}/${params.slug}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });

  updateNewsBySlug = (section: string, slug: string, news: Partial<NewsItem>): Promise<ApiResponse<NewsItem>> =>
    this.request(`/updatenews/${section}/${slug}`, { method: "PUT", body: JSON.stringify(news) });

  deleteNews = (params: { section: string; slug: string }): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/deletenews/${params.section}/${params.slug}`, { method: "DELETE" });

  deleteNewsBySlug = (section: string, slug: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/deletenews/${section}/${slug}`, { method: "DELETE" });

  setNewsFlags = (params: {
    section: string;
    slug: string;
    flags: Partial<Pick<NewsItem, "isLatest" | "isTrending">>;
  }): Promise<ApiResponse<NewsItem>> =>
    this.request(`/flags/${params.section}/${params.slug}`, {
      method: "PATCH",
      body: JSON.stringify(params.flags),
    });
}

export const newsService = new NewsService();

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

      const payload = res.data ?? res.news ?? null;
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

export const useAllNews = (): UseApiResult<NewsDocument[]> =>
  useApi<NewsDocument[]>(() => newsService.getAllNews());

export const useNewsBySection = (section: string): UseApiResult<NewsItem[]> =>
  useApi<NewsItem[]>(() => newsService.getNewsBySection(section));

export const useNewsBySlug = (section: string, slug: string): UseApiResult<NewsItem> =>
  useApi<NewsItem>(() => newsService.getNewsBySlug(section, slug));

export const useAddNews = (): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>(newsService.addNews);

export const useUpdateNews = (section: string, slug?: string): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>((payload: { slug?: string; news?: Partial<NewsItem>; data?: Partial<NewsItem> }) => {
    const targetSlug = payload.slug || slug;
    const newsData = payload.news || payload.data;
    
    if (!targetSlug) {
      throw new Error("Slug is required for update");
    }
    
    return newsService.updateNews({ section, slug: targetSlug, data: newsData || {} });
  });

export const useDeleteNews = (section: string, slug?: string): UseApiMutationResult<ApiResponse<{ deleted: boolean }>> =>
  useApiMutation<ApiResponse<{ deleted: boolean }>>((payload?: { slug?: string }) => {
    const targetSlug = payload?.slug || slug;
    
    if (!targetSlug) {
      throw new Error("Slug is required for delete");
    }
    
    return newsService.deleteNews({ section, slug: targetSlug });
  });

export const useSetNewsFlags = (section: string): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>((payload: { slug: string; isLatest?: boolean; isTrending?: boolean }) =>
    newsService.setNewsFlags({
      section,
      slug: payload.slug,
      flags: { isLatest: payload.isLatest, isTrending: payload.isTrending },
    })
  );
