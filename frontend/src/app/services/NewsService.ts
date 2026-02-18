import { baseURL } from "@/Utils/Utils";

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
    targetLink?: string;
    nominationLink?: string;
    author?: string;
    _id?: string
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

        // Add default revalidation for GET requests
        const isGet = !options.method || options.method === 'GET';
        const fetchOptions: RequestInit = {
            headers: { "Content-Type": "application/json" },
            ...options,
            next: isGet ? { revalidate: 60, tags: ['news'] } : options.next
        };

        const res = await fetch(url, fetchOptions);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.msg || `API Error: ${res.status}`);
        }
        return res.json();
    }

    addNews = (news: Omit<NewsItem, "id"> & { section: string }): Promise<ApiResponse<NewsItem>> =>
        this.request("/addnews", { method: "POST", body: JSON.stringify(news) });

    getAllNews = (includeDrafts: boolean = false): Promise<ApiResponse<NewsDocument[]>> => {
        const endpoint = `/getallnews${includeDrafts ? '?includeDrafts=true' : ''}`;
        return this.request(endpoint);
    };

    getNewsBySection = (section: string, includeDrafts: boolean = false): Promise<ApiResponse<NewsItem[]>> => {
        const endpoint = `/getnewsbysection/${section}${includeDrafts ? '?includeDrafts=true' : ''}`;
        return this.request(endpoint);
    };

    getNewsBySlug = (section: string, slug: string, includeDrafts: boolean = false): Promise<ApiResponse<NewsItem>> => {
        const endpoint = `/getnewsbyslug/${section}/${slug}${includeDrafts ? '?includeDrafts=true' : ''}`;
        return this.request(endpoint);
    };

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
