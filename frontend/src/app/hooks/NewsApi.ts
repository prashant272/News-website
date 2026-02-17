'use client';
import { useCallback, useEffect, useState, useMemo } from "react";
import { newsService, NewsItem, NewsDocument, ApiResponse } from "../services/NewsService";
export { newsService };
export type { NewsItem, NewsDocument, ApiResponse };

type UseApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useApi = <T,>(fetchFn: () => Promise<ApiResponse<T>>, deps: any[] = []): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function based on dependencies
  const memoizedFetch = useCallback(fetchFn, deps);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await memoizedFetch();
      if (!res.success) throw new Error(res.msg || "API Error");
      setData((res.news ?? res.data ?? null) as T);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memoizedFetch]);

  useEffect(() => {
    let mounted = true;
    fetchData();
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
  useApi<NewsItem[]>(() => newsService.getNewsBySection(section), [section]);

export const useNewsBySlug = (section: string, slug: string): UseApiResult<NewsItem> =>
  useApi<NewsItem>(() => newsService.getNewsBySlug(section, slug), [section, slug]);

export const useAllNews = (): UseApiResult<NewsDocument[]> =>
  useApi<NewsDocument[]>(() => newsService.getAllNews(), []);

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
  const filteredData = useMemo(() => data ? filterNewsByVisibility(data, visibilityFilter) : null, [data, visibilityFilter]);
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
