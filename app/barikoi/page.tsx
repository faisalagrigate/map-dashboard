'use client';

import { useState, useCallback } from 'react';
import { RetailTraceMap } from '@/components/retail-trace-map';
import { RetailTraceSidebar } from '@/components/retail-trace-sidebar';
import { rtSRs, getDealerStats, getSRStats, districts } from '@/lib/retail-trace-data';
import {
    MapPin,
    Users,
    Store,
    TrendingUp,
    Wheat,
    Activity,
} from 'lucide-react';

export default function BarikoiPage() {
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedUpazila, setSelectedUpazila] = useState('all');
    const [selectedBazar, setSelectedBazar] = useState('all');
    const [flyToDealer, setFlyToDealer] = useState<string | null>(null);
    const [selectedSR, setSelectedSR] = useState<string | null>(null);
    const [visibleDealerCount, setVisibleDealerCount] = useState(0);

    const dealerStats = getDealerStats();
    const srStats = getSRStats();

    const handleDealerClick = useCallback((id: string) => {
        setFlyToDealer(null);
        setTimeout(() => setFlyToDealer(id), 50);
    }, []);

    const handleDealerCountUpdate = useCallback((count: number) => {
        setVisibleDealerCount(count);
    }, []);

    const handleSRSelect = useCallback((id: string | null) => {
        setSelectedSR(id);
    }, []);

    const fmtBDT = (n: number) => {
        if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
        return `৳${n}`;
    };

    return (
        <main className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                        <Wheat className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight tracking-wide">
                            Retail TRACE
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium">
                            Astha Feed Industries — Field Intelligence Platform
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-slate-700/60 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-600/50">
                        <Store className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-white">{dealerStats.total}</span>
                        <span className="text-[9px] text-slate-400">Dealers</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-700/60 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-600/50">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-white">{srStats.active}</span>
                        <span className="text-[9px] text-slate-400">SRs Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-700/60 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-600/50">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-white">{fmtBDT(dealerStats.totalSales)}</span>
                        <span className="text-[9px] text-slate-400">Sales</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-700/60 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-600/50">
                        <MapPin className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-xs font-bold text-white">{districts.length}</span>
                        <span className="text-[9px] text-slate-400">Districts</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-600/20 backdrop-blur rounded-lg px-3 py-1.5 border border-emerald-500/40">
                        <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-semibold text-emerald-300">LIVE</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-80 flex flex-col border-r border-border bg-card overflow-hidden">
                    <RetailTraceSidebar
                        selectedDistrict={selectedDistrict}
                        selectedUpazila={selectedUpazila}
                        selectedBazar={selectedBazar}
                        selectedSR={selectedSR}
                        onDistrictChange={setSelectedDistrict}
                        onUpazilaChange={setSelectedUpazila}
                        onBazarChange={setSelectedBazar}
                        onDealerClick={handleDealerClick}
                        onSRSelect={handleSRSelect}
                        visibleDealerCount={visibleDealerCount}
                    />
                </div>

                {/* Center — Map */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <RetailTraceMap
                        selectedDistrict={selectedDistrict}
                        selectedUpazila={selectedUpazila}
                        selectedBazar={selectedBazar}
                        flyToDealer={flyToDealer}
                        selectedSR={selectedSR}
                        onDealerCountUpdate={handleDealerCountUpdate}
                        onSRSelect={handleSRSelect}
                    />
                </div>
            </div>
        </main>
    );
}
