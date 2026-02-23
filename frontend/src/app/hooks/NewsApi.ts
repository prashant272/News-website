'use client';
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { newsService, NewsItem, NewsDocument, ApiResponse } from "../services/NewsService";
import { baseURL } from "@/Utils/Utils";
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
    fetchData();
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

const NEWS_CACHE_KEY = 'ptm_news_cache';
const NEWS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface NewsCache {
  data: NewsItem[];
  timestamp: number;
}

function getCachedNews(): NewsItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const cache: NewsCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > NEWS_CACHE_TTL) {
      localStorage.removeItem(NEWS_CACHE_KEY);
      return null;
    }
    return cache.data;
  } catch {
    return null;
  }
}

function setCachedNews(data: NewsItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const cache: NewsCache = { data, timestamp: Date.now() };
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Hook for progressive streaming of news items via NDJSON.
 * Uses localStorage cache for instant first paint, then refreshes in background.
 */
export const useStreamingNews = (section?: string, limit: number = 150) => {
  const cached = typeof window !== 'undefined' ? getCachedNews() : null;
  const [news, setNews] = useState<NewsItem[]>(cached || []);
  const [loading, setLoading] = useState(!cached); // if cache hit, don't show loading
  const [error, setError] = useState<string | null>(null);
  const streamingRef = useRef<boolean>(false);

  const startStream = useCallback(async (isBackground = false) => {
    if (streamingRef.current) {
      console.log("Stream already active, ignoring start request");
      return;
    }

    streamingRef.current = true;
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }

    const abortController = new AbortController();

    try {
      const url = `${baseURL}/news/stream?limit=${limit}${section ? `&section=${section}` : ''}`;
      const response = await fetch(url, { signal: abortController.signal });

      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let newItems: NewsItem[] = [];
      let lastUpdate = Date.now();
      const freshItems: NewsItem[] = [];

      while (true) {
        if (!streamingRef.current) {
          abortController.abort();
          break;
        }

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const item = JSON.parse(line);
              newItems.push(item);
              freshItems.push(item);
            } catch (e) {
              console.error("Failed to parse stream item:", e);
            }
          }
        }

        // Batch updates every 200ms or if we have a significant amount of items
        if (newItems.length > 0 && (Date.now() - lastUpdate > 200 || newItems.length > 50)) {
          const itemsToAdd = [...newItems];
          newItems = [];

          setNews(prev => {
            const existingIds = new Set(prev.map(i => i._id || i.slug));
            const filtered = itemsToAdd.filter(item => !existingIds.has(item._id || item.slug));
            if (filtered.length === 0) return prev;
            return [...prev, ...filtered];
          });

          lastUpdate = Date.now();
        }
      }

      // Final update for any remaining items
      if (newItems.length > 0) {
        setNews(prev => {
          const existingIds = new Set(prev.map(i => i._id || i.slug));
          const filtered = newItems.filter(item => !existingIds.has(item._id || item.slug));
          if (filtered.length === 0) return prev;
          return [...prev, ...filtered];
        });
        freshItems.push(...newItems);
      }

      // Save fresh data to cache
      if (freshItems.length > 0) {
        setCachedNews(freshItems);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      streamingRef.current = false;
    }
  }, [section, limit]);

  useEffect(() => {
    const cached = getCachedNews();
    if (cached && cached.length > 0) {
      // Cache hit: show instantly, refresh silently in background after 1s
      setNews(cached);
      setLoading(false);
      const timer = setTimeout(() => startStream(true), 1000);
      return () => {
        clearTimeout(timer);
        streamingRef.current = false;
      };
    } else {
      // No cache: stream immediately
      startStream(false);
      return () => {
        streamingRef.current = false;
      };
    }
  }, [startStream]);

  return { news, loading, error, refetch: startStream };
};


export const useNewsBySection = (section: string, includeDrafts: boolean = false, page: number = 1, limit: number = 100): UseApiResult<NewsItem[]> =>
  useApi<NewsItem[]>(() => newsService.getNewsBySection(section, includeDrafts, page, limit), [section, includeDrafts, page, limit]);

export const useNewsBySlug = (section: string, slug: string, includeDrafts: boolean = false): UseApiResult<NewsItem> =>
  useApi<NewsItem>(() => newsService.getNewsBySlug(section, slug, includeDrafts), [section, slug, includeDrafts]);

export const useAllNews = (includeDrafts: boolean = false, page: number = 1, limit: number = 1000): UseApiResult<NewsItem[]> =>
  useApi<NewsItem[]>(() => newsService.getAllNews(includeDrafts, page, limit), [includeDrafts, page, limit]);

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
