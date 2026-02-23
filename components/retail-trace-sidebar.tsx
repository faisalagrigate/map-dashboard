'use client';

import React, { useState, useMemo } from 'react';
import {
    districts, upazilas, bazars, rtDealers, rtSRs,
    getUpazilasForDistrict, getBazarsForUpazila, getBazarsForDistrict,
    getDealersForDistrict, getDealersForUpazila, getDealersForBazar,
    getDealerStats, getSRStats,
    type RTDealer,
} from '@/lib/retail-trace-data';

interface RetailTraceSidebarProps {
    selectedDistrict: string;
    selectedUpazila: string;
    selectedBazar: string;
    selectedSR: string | null;
    onDistrictChange: (id: string) => void;
    onUpazilaChange: (id: string) => void;
    onBazarChange: (id: string) => void;
    onDealerClick: (id: string) => void;
    onSRSelect: (id: string | null) => void;
    visibleDealerCount: number;
}

export function RetailTraceSidebar({
    selectedDistrict,
    selectedUpazila,
    selectedBazar,
    selectedSR,
    onDistrictChange,
    onUpazilaChange,
    onBazarChange,
    onDealerClick,
    onSRSelect,
    visibleDealerCount,
}: RetailTraceSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'dealers' | 'srs'>('dealers');

    const availableUpazilas = selectedDistrict && selectedDistrict !== 'all'
        ? getUpazilasForDistrict(selectedDistrict)
        : upazilas;

    const availableBazars = selectedUpazila && selectedUpazila !== 'all'
        ? getBazarsForUpazila(selectedUpazila)
        : selectedDistrict && selectedDistrict !== 'all'
            ? getBazarsForDistrict(selectedDistrict)
            : bazars;

    const filteredDealers = useMemo(() => {
        let dealers = rtDealers;
        if (selectedBazar && selectedBazar !== 'all') {
            dealers = getDealersForBazar(selectedBazar);
        } else if (selectedUpazila && selectedUpazila !== 'all') {
            dealers = getDealersForUpazila(selectedUpazila);
        } else if (selectedDistrict && selectedDistrict !== 'all') {
            dealers = getDealersForDistrict(selectedDistrict);
        }
        if (typeFilter !== 'all') dealers = dealers.filter(d => d.type === typeFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            dealers = dealers.filter(d =>
                d.name.toLowerCase().includes(q) || d.ownerName.toLowerCase().includes(q) || d.phone.includes(q)
            );
        }
        return dealers;
    }, [selectedDistrict, selectedUpazila, selectedBazar, typeFilter, searchQuery]);

    const filteredSRs = useMemo(() => {
        if (selectedDistrict && selectedDistrict !== 'all') {
            return rtSRs.filter(s => s.districtId === selectedDistrict);
        }
        return rtSRs;
    }, [selectedDistrict]);

    const dealerStats = getDealerStats();
    const srStats = getSRStats();

    const fmtBDT = (n: number) => {
        if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
        return `৳${n}`;
    };

    const dealerTypeColors: Record<string, string> = {
        active: 'bg-emerald-500', prospect: 'bg-blue-500', inactive: 'bg-gray-400', declining: 'bg-amber-500',
    };

    const srStatusColors: Record<string, string> = {
        active: 'bg-emerald-500', idle: 'bg-amber-500', offline: 'bg-gray-400',
    };

    return (
        <div className="flex flex-col h-full">
            {/* Stats Cards */}
            <div className="p-3 border-b border-border">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Total Dealers</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{dealerStats.total}</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">{dealerStats.active} active</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Monthly Sales</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmtBDT(dealerStats.totalSales)}</p>
                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">{srStats.active}/{srStats.total} SRs active</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800">
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Prospects</p>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{dealerStats.prospect}</p>
                        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{dealerStats.declining} declining</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800">
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">Bazars</p>
                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{bazars.length}</p>
                        <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70">{districts.length} districts</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-border space-y-2">
                <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Filter by Region</p>
                <select
                    value={selectedDistrict}
                    onChange={e => { onDistrictChange(e.target.value); onUpazilaChange('all'); onBazarChange('all'); }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                    <option value="all">All Districts ({districts.length})</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name} — {d.division}</option>)}
                </select>
                <select
                    value={selectedUpazila}
                    onChange={e => { onUpazilaChange(e.target.value); onBazarChange('all'); }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    disabled={!selectedDistrict || selectedDistrict === 'all'}
                >
                    <option value="all">All Upazilas ({availableUpazilas.length})</option>
                    {availableUpazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select
                    value={selectedBazar}
                    onChange={e => onBazarChange(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    disabled={!selectedDistrict || selectedDistrict === 'all'}
                >
                    <option value="all">All Bazars ({availableBazars.length})</option>
                    {availableBazars.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>

            {/* Tab Switcher: Dealers | SRs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('dealers')}
                    className={`flex-1 text-xs font-semibold py-2 transition-colors ${activeTab === 'dealers'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    🏪 Dealers ({filteredDealers.length})
                </button>
                <button
                    onClick={() => setActiveTab('srs')}
                    className={`flex-1 text-xs font-semibold py-2 transition-colors ${activeTab === 'srs'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    📍 SRs ({filteredSRs.length})
                </button>
            </div>

            {/* Dealer Tab Content */}
            {activeTab === 'dealers' && (
                <>
                    <div className="p-3 border-b border-border space-y-2">
                        <input
                            type="text"
                            placeholder="Search dealers..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                        <div className="flex gap-1 flex-wrap">
                            {['all', 'active', 'prospect', 'declining', 'inactive'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTypeFilter(t)}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-colors ${typeFilter === t ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                        }`}
                                >
                                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Showing <b>{filteredDealers.length}</b> of {rtDealers.length} dealers
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredDealers.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">No dealers found.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredDealers.slice(0, 80).map(dealer => {
                                    const bazarName = bazars.find(b => b.id === dealer.bazarId)?.name || '';
                                    return (
                                        <button
                                            key={dealer.id}
                                            onClick={() => onDealerClick(dealer.id)}
                                            className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${dealerTypeColors[dealer.type]}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{dealer.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{dealer.ownerName} • {bazarName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {dealer.monthlyOrder > 0 && (
                                                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{fmtBDT(dealer.monthlyOrder)}/mo</span>
                                                        )}
                                                        <span className={`text-[9px] px-1.5 py-0 rounded-full font-semibold text-white ${dealerTypeColors[dealer.type]}`}>{dealer.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredDealers.length > 80 && (
                                    <div className="p-3 text-center text-[10px] text-muted-foreground">+ {filteredDealers.length - 80} more dealers.</div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* SRs Tab Content */}
            {activeTab === 'srs' && (
                <div className="flex-1 overflow-y-auto">
                    <div className="p-3 border-b border-border">
                        <p className="text-[10px] text-muted-foreground">
                            Click an SR to <b>trace their route</b> to dealer stops on the map.
                        </p>
                    </div>
                    <div className="divide-y divide-border">
                        {filteredSRs.map(sr => {
                            const distName = districts.find(d => d.id === sr.districtId)?.name || '';
                            const isSelected = selectedSR === sr.id;
                            const progress = sr.target > 0 ? Math.round((sr.monthlySales / sr.target) * 100) : 0;
                            return (
                                <button
                                    key={sr.id}
                                    onClick={() => onSRSelect(isSelected ? null : sr.id)}
                                    className={`w-full text-left px-3 py-2.5 transition-colors group ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/30 border-l-3 border-indigo-500' : 'hover:bg-accent/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className="relative flex-shrink-0 mt-0.5">
                                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${srStatusColors[sr.status]}`}>
                                                {sr.designation}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold truncate transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground group-hover:text-primary'}`}>
                                                {sr.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{distName} • {sr.dealerCount} dealers</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : progress >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-semibold text-muted-foreground">{progress}%</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground">{fmtBDT(sr.monthlySales)} / {fmtBDT(sr.target)}</span>
                                                <span className={`text-[9px] px-1.5 py-0 rounded-full font-semibold text-white ${srStatusColors[sr.status]}`}>
                                                    {sr.status}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 animate-pulse">
                                                    🗺️ Tracing route on map...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
