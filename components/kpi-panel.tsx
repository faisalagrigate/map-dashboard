'use client';

import React, { useMemo } from 'react';
import { useLocation } from '@/context/location-context';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Store, ShoppingCart, Target, Swords } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

export function KPIPanel() {
  const { agents, dealers, competitionDealers, orders, targets } = useLocation();

  const kpis = useMemo(() => {
    const totalSalesTarget = agents.reduce((s, a) => s + a.targetMonthly, 0);
    const totalSalesAchieved = agents.reduce((s, a) => s + a.achievedMonthly, 0);
    const activeDealers = dealers.filter((d) => d.type === 'active').length;
    const prospectDealers = dealers.filter((d) => d.type === 'prospect').length;
    const newDealersAcquired = agents.reduce((s, a) => s + a.dealersAcquired, 0);
    const newDealersTarget = agents.reduce((s, a) => s + a.dealersTarget, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const avgOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + o.amount, 0) / orders.length : 0;

    return {
      totalSalesTarget,
      totalSalesAchieved,
      salesPercent: totalSalesTarget > 0 ? Math.round((totalSalesAchieved / totalSalesTarget) * 100) : 0,
      activeDealers,
      prospectDealers,
      totalDealers: dealers.length,
      newDealersAcquired,
      newDealersTarget,
      dealerPercent: newDealersTarget > 0 ? Math.round((newDealersAcquired / newDealersTarget) * 100) : 0,
      totalOrders,
      deliveredOrders,
      avgOrderValue,
      competitionCount: competitionDealers.length,
      activeAgents: agents.filter((a) => a.status === 'active').length,
    };
  }, [agents, dealers, competitionDealers, orders, targets]);

  return (
    <div className="p-3 space-y-3 overflow-y-auto">
      <h2 className="text-sm font-semibold text-foreground">Key Performance Indicators</h2>

      {/* Sales Target Progress */}
      <Card className="p-3 bg-card border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Monthly Sales</p>
            <p className="text-sm font-bold text-foreground">
              {formatCurrency(kpis.totalSalesAchieved)} / {formatCurrency(kpis.totalSalesTarget)}
            </p>
          </div>
          <span className={`text-xs font-bold ${kpis.salesPercent >= 80 ? 'text-emerald-600' : kpis.salesPercent >= 50 ? 'text-amber-600' : 'text-destructive'}`}>
            {kpis.salesPercent}%
          </span>
        </div>
        <Progress value={kpis.salesPercent} className="h-2" />
      </Card>

      {/* Dealer Acquisition */}
      <Card className="p-3 bg-card border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-md bg-secondary/10 flex items-center justify-center">
            <Target className="h-3.5 w-3.5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Dealer Acquisition</p>
            <p className="text-sm font-bold text-foreground">
              {kpis.newDealersAcquired} / {kpis.newDealersTarget} new dealers
            </p>
          </div>
          <span className={`text-xs font-bold ${kpis.dealerPercent >= 80 ? 'text-emerald-600' : kpis.dealerPercent >= 50 ? 'text-amber-600' : 'text-destructive'}`}>
            {kpis.dealerPercent}%
          </span>
        </div>
        <Progress value={kpis.dealerPercent} className="h-2" />
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2.5 bg-card border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Agents</span>
          </div>
          <p className="text-lg font-bold text-foreground">{kpis.activeAgents}</p>
          <p className="text-xs text-muted-foreground">of {agents.length} active</p>
        </Card>

        <Card className="p-2.5 bg-card border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Store className="h-3 w-3 text-emerald-600" />
            <span className="text-xs text-muted-foreground">Dealers</span>
          </div>
          <p className="text-lg font-bold text-foreground">{kpis.activeDealers}</p>
          <p className="text-xs text-muted-foreground">{kpis.prospectDealers} prospects</p>
        </Card>

        <Card className="p-2.5 bg-card border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingCart className="h-3 w-3 text-secondary" />
            <span className="text-xs text-muted-foreground">Orders</span>
          </div>
          <p className="text-lg font-bold text-foreground">{kpis.totalOrders}</p>
          <p className="text-xs text-muted-foreground">{kpis.deliveredOrders} delivered</p>
        </Card>

        <Card className="p-2.5 bg-card border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Swords className="h-3 w-3 text-destructive" />
            <span className="text-xs text-muted-foreground">Competition</span>
          </div>
          <p className="text-lg font-bold text-foreground">{kpis.competitionCount}</p>
          <p className="text-xs text-muted-foreground">dealers mapped</p>
        </Card>
      </div>

      {/* Avg Order Value */}
      <Card className="p-3 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(kpis.avgOrderValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Zones Covered</p>
            <p className="text-lg font-bold text-foreground">3</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
