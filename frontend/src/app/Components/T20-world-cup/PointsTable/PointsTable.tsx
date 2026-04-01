"use client";
import React, { useEffect, useState } from "react";
import { cricketService } from "@/app/services/CricketService";

interface PointsTableProps {
    seriesId: string;
    lang?: string;
}

const CricketPointsTable: React.FC<PointsTableProps> = ({ seriesId, lang = 'hi' }) => {
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
                    setError("Points Table not found or not available yet.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch Points Table");
            } finally {
                setLoading(false);
            }
        };
        fetchPoints();
    }, [seriesId]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading Points Table...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!pointsTable || pointsTable.length === 0) return <div className="p-4 text-center text-gray-500">No standings available.</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 my-4 w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Points Table</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3">Team</th>
                            <th className="p-3 text-right">M</th>
                            <th className="p-3 text-right">W</th>
                            <th className="p-3 text-right">L</th>
                            <th className="p-3 text-right">T</th>
                            <th className="p-3 text-right">NR</th>
                            <th className="p-3 text-right">PTS</th>
                            <th className="p-3 text-right">NRR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pointsTable.map((teamRow: any, i: number) => (
                            <tr key={teamRow.team_id || i} className="hover:bg-gray-50">
                                <td className="p-3 flex items-center gap-3">
                                    {teamRow.img && <img src={teamRow.img} alt={teamRow.teamname} className="w-6 h-6 rounded-full" />}
                                    <span className="font-semibold text-gray-800">{teamRow.teamname}</span>
                                </td>
                                <td className="p-3 text-right text-gray-600">{teamRow.matches}</td>
                                <td className="p-3 text-right text-green-600 font-medium">{teamRow.wins}</td>
                                <td className="p-3 text-right text-red-500">{teamRow.loss}</td>
                                <td className="p-3 text-right text-gray-600">{teamRow.ties}</td>
                                <td className="p-3 text-right text-gray-400">{teamRow.nr}</td>
                                <td className="p-3 text-right font-bold text-primary">{teamRow.pts}</td>
                                <td className="p-3 text-right text-gray-800">{teamRow.nrr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CricketPointsTable;
