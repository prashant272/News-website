"use client";
import React, { useEffect, useState } from "react";
import { cricketService } from "@/app/services/CricketService";

interface PointsTableProps {
    seriesId: string;
    lang?: string;
    compact?: boolean;
}

const CricketPointsTable: React.FC<PointsTableProps> = ({ seriesId, lang = 'hi', compact = false }) => {
    const [pointsTable, setPointsTable] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                setLoading(true);
                const res = await cricketService.getPointsTable(seriesId, lang);
                if (res.success && res.data?.status === "success" && res.data.data) {
                    setPointsTable(res.data.data);
                } else {
                    setError("Standings not available");
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        };
        fetchPoints();
    }, [seriesId]);

    if (loading) return <div className="p-4 text-center text-gray-400 animate-pulse text-sm">Standings...</div>;
    if (error) return <div className="p-4 text-center text-red-400 text-sm">{error}</div>;
    if (!pointsTable || pointsTable.length === 0) return <div className="p-4 text-center text-gray-400 text-sm">No data</div>;

    return (
        <div className={`bg-white rounded-lg w-full ${compact ? 'p-0 border-0 shadow-none' : 'shadow-sm border border-gray-100 p-6 my-4'}`}>
            {!compact && <h2 className="text-2xl font-bold mb-4 text-gray-800">Points Table</h2>}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="min-w-[450px] w-full text-left text-[11px] md:text-sm">
                    <thead className={`${compact ? 'bg-gray-50' : 'bg-gray-100'} text-gray-600`}>
                        <tr>
                            <th className={`${compact ? 'p-1.5' : 'p-3'} sticky left-0 bg-inherit shadow-[1px_0_0_0_#edf2f7]`}>Team</th>
                            <th className={`${compact ? 'p-1' : 'p-3'} text-right`}>M</th>
                            <th className={`${compact ? 'p-1' : 'p-3'} text-right`}>W</th>
                            <th className={`${compact ? 'p-1' : 'p-3'} text-right`}>L</th>
                            <th className={`${compact ? 'p-1' : 'p-3'} text-right`}>T</th>
                            <th className={`${compact ? 'p-1.5' : 'p-3'} text-right`}>PTS</th>
                            <th className={`${compact ? 'p-1' : 'p-3'} text-right`}>NRR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pointsTable.map((teamRow: any, i: number) => (
                            <tr key={teamRow.team_id || i} className="hover:bg-gray-50">
                                <td className={`${compact ? 'p-1.5' : 'p-3'} sticky left-0 bg-inherit shadow-[1px_0_0_0_#edf2f7] flex items-center gap-1`}>
                                    {teamRow.img && <img src={teamRow.img} alt={teamRow.teamname} className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} rounded-full`} />}
                                    <span className={`font-bold text-gray-800 ${compact ? 'truncate max-w-[40px]' : ''}`}>
                                        {compact ? teamRow.team_id || teamRow.teamname.substring(0, 3).toUpperCase() : teamRow.teamname}
                                    </span>
                                </td>
                                <td className={`${compact ? 'p-1' : 'p-3'} text-right text-gray-600`}>{teamRow.matches || 0}</td>
                                <td className={`${compact ? 'p-1' : 'p-3'} text-right text-green-600 font-medium`}>{teamRow.wins || 0}</td>
                                <td className={`${compact ? 'p-1' : 'p-3'} text-right text-red-500`}>{teamRow.loss || 0}</td>
                                <td className={`${compact ? 'p-1' : 'p-3'} text-right text-gray-600`}>{teamRow.ties || 0}</td>
                                <td className={`${compact ? 'p-1.5' : 'p-3'} text-right font-black text-red-600`}>{teamRow.pts || 0}</td>
                                <td className={`${compact ? 'p-1' : 'p-3'} text-right text-gray-800`}>{teamRow.nrr || '0.000'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CricketPointsTable;
