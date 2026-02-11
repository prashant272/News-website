"use client"
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
  [key: string]: any; 
}

export interface NewsSections {
  india?: NewsItem[];
  sports?: NewsItem[];
  business?: NewsItem[];
  entertainment?: NewsItem[];
  lifestyle?: NewsItem[];
  health?: NewsItem[];
  world?: NewsItem[];
  technology?: NewsItem[];
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

export interface ApiResponse<T> {
  success: boolean;
  msg?: string;
  news?: T;
  data?: T;
  [key: string]: any; 
}

class NewsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}/news${endpoint}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
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

  updateNewsBySlug = (section: string, slug: string, news: Partial<NewsItem>): Promise<ApiResponse<NewsItem>> =>
    this.request(`/updatenews/${section}/${slug}`, { method: "PUT", body: JSON.stringify(news) });

  deleteNewsBySlug = (section: string, slug: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/deletenews/${section}/${slug}`, { method: "DELETE" });
}

export const newsService = new NewsService();

export const useApi = <T>(fetchFn: () => Promise<ApiResponse<T>>) => {
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
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};

export const useAllNews = () => {
  return useApi<NewsDocument[]>(() => newsService.getAllNews());
};

export const useNewsBySection = (section: string) => {
  return useApi<NewsItem[]>(() => newsService.getNewsBySection(section));
};

export const useNewsBySlug = (section: string, slug: string) => {
  return useApi<NewsItem>(() => newsService.getNewsBySlug(section, slug));
};

export const useAddNews = () => {
  return useApiMutation<NewsItem>(newsService.addNews);
};

export const useUpdateNews = (section: string, slug: string) => {
  return useApiMutation<NewsItem>((data: Partial<NewsItem>) =>
    newsService.updateNewsBySlug(section, slug, data)
  );
};

export const useDeleteNews = (section: string, slug: string) => {
  return useApiMutation<{ deleted: boolean }>(() =>
    newsService.deleteNewsBySlug(section, slug)
  );
};

export const useApiMutation = <T>(mutateFn: (data?: any) => Promise<ApiResponse<T>>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutateFn(data);
      if (!res.success) throw new Error(res.msg || "Mutation failed");
      return res;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutateFn]);

  return { mutate, loading, error };
};