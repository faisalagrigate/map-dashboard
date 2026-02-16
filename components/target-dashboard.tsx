'use client';

import React, { useMemo } from 'react';
import { useLocation } from '@/context/location-context';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/mock-data';
import { Target, TrendingUp, TrendingDown, Award } from 'lucide-react';

export function TargetDashboard() {
  const { agents, targets } = useLocation();

  const agentTargets = useMemo(() => {
    return agents.map((agent) => {
      const salesTarget = targets.find(
        (t) => t.agentId === agent.id && t.targetType === 'sales'
      );
      const dealerTarget = targets.find(
        (t) => t.agentId === agent.id && t.targetType === 'dealer_acquisition'
      );
      const salesPercent = salesTarget
        ? Math.round((salesTarget.achieved / salesTarget.target) * 100)
        : 0;
      const dealerPercent = dealerTarget
        ? Math.round((dealerTarget.achieved / dealerTarget.target) * 100)
        : 0;

      return {
        agent,
        salesTarget,
        dealerTarget,
        salesPercent,
        dealerPercent,
        overallPercent: Math.round((salesPercent + dealerPercent) / 2),
      };
    }).sort((a, b) => b.salesPercent - a.salesPercent);
  }, [agents, targets]);

  const topPerformer = agentTargets[0];

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Target Monitoring</h2>

      {/* Top Performer */}
      {topPerformer && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Top Performer</span>
          </div>
          <p className="text-sm font-bold text-foreground">{topPerformer.agent.name}</p>
          <p className="text-xs text-muted-foreground">
            {topPerformer.salesPercent}% sales target achieved
          </p>
        </Card>
      )}

      {/* Agent Targets List */}
      <div className="space-y-2">
        {agentTargets.map(({ agent, salesTarget, dealerTarget, salesPercent, dealerPercent }) => (
          <Card key={agent.id} className="p-3 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.geoHierarchy.area}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0 ${
                  salesPercent >= 100
                    ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                    : salesPercent >= 70
                    ? 'text-amber-600 border-amber-200 bg-amber-50'
                    : 'text-destructive border-destructive/20 bg-destructive/5'
                }`}
              >
                {salesPercent >= 100 ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {salesPercent}%
              </Badge>
            </div>

            {/* Sales Target */}
            {salesTarget && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Sales
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {formatCurrency(salesTarget.achieved)} / {formatCurrency(salesTarget.target)}
                  </span>
                </div>
                <Progress value={Math.min(100, salesPercent)} className="h-1.5" />
              </div>
            )}

            {/* Dealer Target */}
            {dealerTarget && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Dealers
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {dealerTarget.achieved} / {dealerTarget.target}
                  </span>
                </div>
                <Progress value={Math.min(100, dealerPercent)} className="h-1.5" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
