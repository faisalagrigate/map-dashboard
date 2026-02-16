'use client';

import { useState } from 'react';
import { MapDashboard } from '@/components/map-dashboard';
import { AgentList } from '@/components/agent-list';
import { KPIPanel } from '@/components/kpi-panel';
import { GeoFilter } from '@/components/geo-filter';
import { ActivityPanel } from '@/components/activity-panel';
import { TargetDashboard } from '@/components/target-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/context/location-context';
import {
  MapPin,
  BarChart3,
  Target,
  Globe,
  Eye,
  EyeOff,
  Wheat,
} from 'lucide-react';

export default function Home() {
  const [sidebarTab, setSidebarTab] = useState<string>('agents');
  const { agents, showCompetition, toggleCompetition, alerts } = useLocation();
  const activeAgents = agents.filter((a) => a.status === 'active').length;

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wheat className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground leading-tight">
              Astha Feeds
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Agent & Dealer Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Competition Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCompetition}
            className={`text-xs h-7 gap-1.5 ${
              showCompetition
                ? 'text-destructive hover:text-destructive'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
            }`}
          >
            {showCompetition ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Competition
          </Button>

          {/* Live status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-sidebar-accent rounded-md">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-sidebar-foreground font-medium">
              {activeAgents} Active
            </span>
          </div>

          {/* Alerts badge */}
          {alerts.length > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs">
              {alerts.length}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 flex flex-col border-r border-border bg-card overflow-hidden">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border h-9 bg-muted/30">
              <TabsTrigger value="agents" className="text-xs px-1 data-[state=active]:bg-card">
                <MapPin className="h-3.5 w-3.5" />
              </TabsTrigger>
              <TabsTrigger value="kpis" className="text-xs px-1 data-[state=active]:bg-card">
                <BarChart3 className="h-3.5 w-3.5" />
              </TabsTrigger>
              <TabsTrigger value="targets" className="text-xs px-1 data-[state=active]:bg-card">
                <Target className="h-3.5 w-3.5" />
              </TabsTrigger>
              <TabsTrigger value="geo" className="text-xs px-1 data-[state=active]:bg-card">
                <Globe className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="flex-1 overflow-hidden mt-0">
              <AgentList />
            </TabsContent>

            <TabsContent value="kpis" className="flex-1 overflow-y-auto mt-0">
              <KPIPanel />
            </TabsContent>

            <TabsContent value="targets" className="flex-1 overflow-y-auto mt-0">
              <TargetDashboard />
            </TabsContent>

            <TabsContent value="geo" className="flex-1 overflow-y-auto mt-0 p-3">
              <GeoFilter />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Map */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MapDashboard />
        </div>

        {/* Right Sidebar - Activity */}
        <div className="w-80 flex flex-col border-l border-border bg-card overflow-hidden">
          <ActivityPanel />
        </div>
      </div>
    </main>
  );
}
