import { baseURL } from "@/Utils/Utils";
import { useCallback, useEffect, useState, useMemo } from "react";

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
  isHidden?: boolean;
  _id?:string
}

export interface NewsSections {
  india?: NewsItem[];
  sports?: NewsItem[];
  business?: NewsItem[];
  lifestyle?: NewsItem[];
  entertainment?: NewsItem[];
  health?: NewsItem[];
  awards?: NewsItem[];
  technology?: NewsItem[];
  world?: NewsItem[];
  education?: NewsItem[];
  environment?: NewsItem[];
  science?: NewsItem[];
  opinion?: NewsItem[];
  auto?: NewsItem[];
  travel?: NewsItem[];
  state?: NewsItem[];
}

export interface NewsDocument extends NewsSections {
  _id?: string;
  isActive?: boolean;
  lastUpdated?: string;
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

  deleteNews = (params: { section: string; slug: string }): Promise<ApiResponse<{ deleted: boolean }>> =>
    this.request(`/deletenews/${params.section}/${params.slug}`, { method: "DELETE" });

  setNewsFlags = (params: {
    section: string;
    slug: string;
    flags: Partial<Pick<NewsItem, "isLatest" | "isTrending" | "isHidden">>;
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
    return () => {
      mounted = false;
    };
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

export const useAllNews = (): UseApiResult<NewsDocument[]> =>
  useApi<NewsDocument[]>(() => newsService.getAllNews());

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
  useApiMutation<ApiResponse<NewsItem>>(
    (payload: { slug: string; isLatest?: boolean; isTrending?: boolean; isHidden?: boolean }) =>
      newsService.setNewsFlags({
        section,
        slug: payload.slug,
        flags: {
          isLatest: payload.isLatest,
          isTrending: payload.isTrending,
          isHidden: payload.isHidden,
        },
      })
  );

export const filterNewsByVisibility = (
  items: NewsItem[],
  filter: "all" | "visible" | "hidden"
): NewsItem[] => {
  switch (filter) {
    case "hidden":
      return items.filter((item) => item.isHidden === true);
    case "visible":
      return items.filter((item) => !item.isHidden);
    case "all":
    default:
      return items;
  }
};

export const useNewsBySectionWithFilter = (
  section: string,
  visibilityFilter: "all" | "visible" | "hidden" = "all"
): UseApiResult<NewsItem[]> => {
  const { data, loading, error, refetch } = useNewsBySection(section);

  const filteredData = data ? filterNewsByVisibility(data, visibilityFilter) : null;

  return { data: filteredData, loading, error, refetch };
};

export const useNewsVisibilityStats = (items: NewsItem[] | null) => {
  return useMemo(() => {
    if (!items) {
      return { total: 0, visible: 0, hidden: 0 };
    }

    const hidden = items.filter((item) => item.isHidden === true).length;
    const visible = items.length - hidden;

    return {
      total: items.length,
      visible,
      hidden,
    };
  }, [items]);
};
