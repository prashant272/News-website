"use client";
import React, { useEffect, useState } from "react";
import { cricketService } from "@/app/services/CricketService";

interface ScorecardProps {
    matchId: string;
}

const CricketScorecard: React.FC<ScorecardProps> = ({ matchId }) => {
    const [scorecard, setScorecard] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScorecard = async () => {
            try {
                setLoading(true);
                const res = await cricketService.getScorecard(matchId);
                if (res.success && res.data?.status === "success") {
                    setScorecard(res.data.data);
                } else {
                    setError("Scorecard not found or not available yet.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch Scorecard");
            } finally {
                setLoading(false);
            }
        };
        fetchScorecard();
    }, [matchId]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading Scorecard...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!scorecard) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 my-4 w-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{scorecard.name}</h2>
            <p className="text-gray-600 mb-4">{scorecard.venue} | {new Date(scorecard.dateTimeGMT).toLocaleString()}</p>
            <div className="mb-4 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {scorecard.status}
            </div>

            {/* Innnings Details */}
            {scorecard.scorecard && scorecard.scorecard.map((inning: any, idx: number) => (
                <div key={idx} className="mt-8 border-t pt-4">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 bg-gray-50 p-2 rounded">
                        {inning.inning} - {inning.totals.R}/{inning.totals.W} ({inning.totals.O} ov)
                    </h3>

                    {/* Batsmen */}
                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2">Batsman</th>
                                    <th className="p-2">Dismissal</th>
                                    <th className="p-2 text-right">R</th>
                                    <th className="p-2 text-right">B</th>
                                    <th className="p-2 text-right">4s</th>
                                    <th className="p-2 text-right">6s</th>
                                    <th className="p-2 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {inning.batting?.map((batter: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-2 font-medium text-gray-800">{batter.batsman.name}</td>
                                        <td className="p-2 text-gray-500 text-xs">
                                            {(() => {
                                                if (batter.dismissal === 'not out') return <span className="text-green-600 font-medium">not out</span>;
                                                const d = batter.dismissal || '';
                                                let info = d;
                                                if (d.includes('catch') && batter.catcher && batter.bowler) {
                                                    info = `c ${batter.catcher.name} b ${batter.bowler.name}`;
                                                } else if (d.includes('catch') && batter.bowler) {
                                                    info = `c ${batter.catcher?.name || 'field'} b ${batter.bowler.name}`;
                                                } else if (d.includes('bowled') && batter.bowler) {
                                                    info = `b ${batter.bowler.name}`;
                                                } else if (d.includes('lbw') && batter.bowler) {
                                                    info = `lbw b ${batter.bowler.name}`;
                                                } else if (d.includes('stump') && batter.stumper && batter.bowler) {
                                                    info = `st ${batter.stumper.name} b ${batter.bowler.name}`;
                                                } else if (d.includes('run out') && batter.dismissalInfo) {
                                                    info = `run out (${batter.dismissalInfo})`;
                                                }
                                                return info;
                                            })()}
                                        </td>
                                        <td className="p-2 text-right font-semibold">{batter.r}</td>
                                        <td className="p-2 text-right text-gray-600">{batter.b}</td>
                                        <td className="p-2 text-right text-gray-600">{batter.u4s || batter["4s"]}</td>
                                        <td className="p-2 text-right text-gray-600">{batter.u6s || batter["6s"]}</td>
                                        <td className="p-2 text-right text-gray-600">{batter.sr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bowlers */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2">Bowler</th>
                                    <th className="p-2 text-right">O</th>
                                    <th className="p-2 text-right">M</th>
                                    <th className="p-2 text-right">R</th>
                                    <th className="p-2 text-right">W</th>
                                    <th className="p-2 text-right">ECON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {inning.bowling?.map((bowler: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-2 font-medium text-gray-800">{bowler.bowler.name}</td>
                                        <td className="p-2 text-right text-gray-600">{bowler.o}</td>
                                        <td className="p-2 text-right text-gray-600">{bowler.m}</td>
                                        <td className="p-2 text-right text-gray-600">{bowler.r}</td>
                                        <td className="p-2 text-right font-bold text-gray-800">{bowler.w}</td>
                                        <td className="p-2 text-right text-gray-600">{bowler.eco}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CricketScorecard;
