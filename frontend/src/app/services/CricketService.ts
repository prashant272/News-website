import { baseURL } from "@/Utils/Utils";

export interface Score {
    inning: string;
    r: number;
    w: number;
    o: string;
    raw: string;
}

export interface LiveMatch {
    id: string;
    name: string;
    matchType: string;
    status: string;
    venue: string;
    date: string;
    teams: string[];
    score: Score[];
    category: 'live' | 'upcoming' | 'recent';
    isLiveTracked: boolean;
    showInUpcoming: boolean;
    showInRecent: boolean;
    isDiscoveryOnly: boolean;
    isManual?: boolean;
    metaText?: string;
    lastUpdated: string;
}

export interface CricketApiResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: string;
}

class CricketService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<CricketApiResponse<T>> {
        const url = `${baseURL}/api/live${endpoint}`;

        const fetchOptions: RequestInit = {
            headers: { "Content-Type": "application/json" },
            ...options,
        };

        const res = await fetch(url, fetchOptions);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${res.status}`);
        }
        return res.json();
    }

    getLiveMatches = (): Promise<CricketApiResponse<{ live: LiveMatch[], upcoming: LiveMatch[], recent: LiveMatch[] }>> =>
        this.request("/live-matches");

    getAllDiscovered = (): Promise<CricketApiResponse<LiveMatch[]>> =>
        this.request("/all-discovered");

    toggleTracking = (id: string, isLiveTracked: boolean): Promise<CricketApiResponse<LiveMatch>> =>
        this.request(`/toggle-tracking/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isLiveTracked }),
        });

    toggleStatus = (id: string, field: string, value: boolean): Promise<CricketApiResponse<LiveMatch>> =>
        this.request("/toggle-status", {
            method: "POST",
            body: JSON.stringify({ id, field, value }),
        });

    addMatch = (matchId: string): Promise<CricketApiResponse<LiveMatch>> =>
        this.request("/add-match", {
            method: "POST",
            body: JSON.stringify({ matchId }),
        });

    getScorecard = (matchId: string): Promise<CricketApiResponse<any>> =>
        this.request(`/scorecard/${matchId}`);

    getPointsTable = (seriesId: string): Promise<CricketApiResponse<any>> =>
        this.request(`/points/${seriesId}`);

    getSquad = (matchId: string): Promise<CricketApiResponse<any>> =>
        this.request(`/squad/${matchId}`);

    getPlayerInfo = (playerId: string): Promise<CricketApiResponse<any>> =>
        this.request(`/player/${playerId}`);

    getSettings = (): Promise<CricketApiResponse<{ activeTournament: string, activeSeriesId: string, autoTrackEnabled: boolean }>> =>
        this.request("/settings");

    async updateSettings(settings: any) {
        return this.request('/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings)
        });
    }

    async searchSeries(query: string): Promise<any[]> {
        const res = await this.request<any[]>(`/series/search?q=${encodeURIComponent(query)}`);
        return res.data;
    }

    saveManualPoints = (seriesId: string, seriesName: string, tableData: any[]): Promise<CricketApiResponse<any>> =>
        this.request("/points/manual", {
            method: "POST",
            body: JSON.stringify({ seriesId, seriesName, tableData }),
        });

    createManualMatch = (matchData: any): Promise<CricketApiResponse<LiveMatch>> =>
        this.request("/create-match", {
            method: "POST",
            body: JSON.stringify(matchData),
        });
}

export const cricketService = new CricketService();
