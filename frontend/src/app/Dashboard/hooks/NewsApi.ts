import { baseURL } from "@/Utils/Utils";
import { useCallback, useEffect, useState } from "react";

export interface NewsItem {
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  summary?: string;
  content: string;
  image?: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  isLatest?: boolean;
  isTrending?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  news?: T;
  data?: T;
  msg: string;
  total?: number;
}

class NewsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${baseURL}/news${endpoint}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.msg || `API Error: ${res.status}`);
    }
    return res.json();
  }

  addNews = (news: Omit<NewsItem, "id"> & { section: string }): Promise<ApiResponse<NewsItem>> =>
    this.request("/addnews", { method: "POST", body: JSON.stringify(news) });

  getAllNews = (): Promise<ApiResponse<NewsItem[]>> => this.request("/getallnews");

  getNewsBySection = (section: string): Promise<ApiResponse<NewsItem[]>> =>
    this.request(`/getnewsbysection/${section}`);

  getNewsBySlug = (section: string, slug: string): Promise<ApiResponse<NewsItem>> =>
    this.request(`/getnewsbyslug/${section}/${slug}`);

  updateNews = (params: { section: string; slug: string; data: Partial<NewsItem> }): Promise<ApiResponse<NewsItem>> =>
    this.request(`/updatenews/${params.section}/${params.slug}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });

  deleteNews = (params: { section: string; slug: string }): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/deletenews/${params.section}/${params.slug}`, { method: "DELETE" });

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

type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useApi = <T,>(fetchFn: () => Promise<ApiResponse<T>>): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchFn();
      if (!res.success) throw new Error(res.msg || "API Error");
      setData((res.news ?? res.data ?? null) as T);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    let mounted = true;
    fetchData().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

type UseApiMutationResult<T> = {
  mutate: (data?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
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

export const useNewsBySection = (section: string): UseApiResult<NewsItem[]> =>
  useApi<NewsItem[]>(() => newsService.getNewsBySection(section));

export const useNewsBySlug = (section: string, slug: string): UseApiResult<NewsItem> =>
  useApi<NewsItem>(() => newsService.getNewsBySlug(section, slug));

export const useAllNews = (): UseApiResult<NewsItem[]> =>
  useApi<NewsItem[]>(() => newsService.getAllNews());

export const useAddNews = (): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>(newsService.addNews);

export const useUpdateNews = (section: string): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>((payload: { slug: string; news: Partial<NewsItem> }) =>
    newsService.updateNews({ section, slug: payload.slug, data: payload.news })
  );

export const useDeleteNews = (section: string): UseApiMutationResult<ApiResponse<{ deleted: boolean }>> =>
  useApiMutation<ApiResponse<{ deleted: boolean }>>((payload: { slug: string }) =>
    newsService.deleteNews({ section, slug: payload.slug })
  );


export const useSetNewsFlags = (section: string): UseApiMutationResult<ApiResponse<NewsItem>> =>
  useApiMutation<ApiResponse<NewsItem>>((payload: { slug: string; isLatest?: boolean; isTrending?: boolean }) =>
    newsService.setNewsFlags({
      section,
      slug: payload.slug,
      flags: { isLatest: payload.isLatest, isTrending: payload.isTrending },
    })
  );