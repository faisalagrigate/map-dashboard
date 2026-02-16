'use client';

import React from 'react';
import { useLocation } from '@/context/location-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GEO_ZONES } from '@/lib/mock-data';
import { Globe, ChevronRight } from 'lucide-react';

export function GeoFilter() {
  const { selectedZone, setSelectedZone, agents, dealers } = useLocation();

  const getZoneStats = (zoneName: string) => {
    const zoneAgents = agents.filter((a) => a.geoHierarchy.zone === zoneName);
    const zoneDealers = dealers.filter((d) => d.geoHierarchy.zone === zoneName);
    return {
      agents: zoneAgents.length,
      activeAgents: zoneAgents.filter((a) => a.status === 'active').length,
      dealers: zoneDealers.length,
    };
  };

  return (
    <Card className="p-3 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-3.5 w-3.5 text-primary" />
        <h3 className="font-semibold text-foreground text-xs">Geographic Hierarchy</h3>
      </div>

      {/* All Zones Option */}
      <button
        onClick={() => setSelectedZone('all')}
        className={`w-full text-left px-2.5 py-2 rounded-md text-xs mb-1 transition-colors flex items-center justify-between ${
          selectedZone === 'all'
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-foreground hover:bg-muted/50'
        }`}
      >
        <span>All Zones</span>
        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
          {agents.length}
        </Badge>
      </button>

      {/* Zone List */}
      <div className="space-y-0.5">
        {GEO_ZONES.map((zone) => {
          const stats = getZoneStats(zone.zone);
          const isActive = selectedZone === zone.zone;

          return (
            <div key={zone.zone}>
              <button
                onClick={() => setSelectedZone(zone.zone)}
                className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  <span>{zone.zone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-emerald-600 border-emerald-200">
                    {stats.activeAgents}A
                  </Badge>
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-muted-foreground">
                    {stats.dealers}D
                  </Badge>
                </div>
              </button>

              {isActive && (
                <div className="ml-5 mt-0.5 space-y-0.5">
                  {zone.regions.map((region) => (
                    <div key={region} className="px-2.5 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
                      <span>{region}</span>
                      <span className="text-xs">
                        {agents.filter((a) => a.geoHierarchy.region === region).length} agents
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
