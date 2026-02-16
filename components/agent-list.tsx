'use client';

import React, { useState } from 'react';
import { useLocation } from '@/context/location-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, MapPin, Target, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';
import { formatDuration } from '@/lib/geofence-detector';

export function AgentList() {
  const { agents, dealers } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.geoHierarchy.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.geoHierarchy.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'idle': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'offline': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTargetPercent = (achieved: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((achieved / target) * 100));
  };

  const getDealerCount = (agentId: string) => {
    return dealers.filter((d) => d.assignedAgentId === agentId && d.type === 'active').length;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Field Agents</h2>
          <Badge variant="outline" className="text-xs font-medium">
            {agents.filter((a) => a.status === 'active').length}/{agents.length} Active
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input
            type="text"
            placeholder="Search agent, area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/50 border-border"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredAgents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-xs">No agents found</div>
        ) : (
          filteredAgents.map((agent) => {
            const targetPercent = getTargetPercent(agent.achievedMonthly, agent.targetMonthly);
            const dealerPercent = getTargetPercent(agent.dealersAcquired, agent.dealersTarget);

            return (
              <div
                key={agent.id}
                className="p-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-xs truncate">{agent.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {agent.geoHierarchy.area}, {agent.geoHierarchy.region}
                      </span>
                    </div>
                  </div>
                  <Badge className={`text-xs px-1.5 py-0 ml-2 border ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </Badge>
                </div>

                {/* Sales Target */}
                <div className="mb-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">Sales</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {formatCurrency(agent.achievedMonthly)}/{formatCurrency(agent.targetMonthly)}
                    </span>
                  </div>
                  <Progress
                    value={targetPercent}
                    className="h-1.5"
                  />
                </div>

                {/* Dealer Acquisition */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-secondary" />
                    <span className="text-xs text-muted-foreground">Dealers</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {getDealerCount(agent.id)} active / {agent.dealersAcquired} new
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-emerald-600">
              {agents.filter((a) => a.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-600">
              {agents.filter((a) => a.status === 'idle').length}
            </div>
            <div className="text-xs text-muted-foreground">Idle</div>
          </div>
          <div>
            <div className="text-sm font-bold text-muted-foreground">
              {agents.filter((a) => a.status === 'offline').length}
            </div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
