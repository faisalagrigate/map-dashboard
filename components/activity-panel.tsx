'use client';

import React, { useMemo } from 'react';
import { useLocation } from '@/context/location-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, LogOut, Clock, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

export function ActivityPanel() {
  const { activities, agents, geofences, orders, alerts, clearAlerts } = useLocation();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry': return <LogIn className="h-3.5 w-3.5 text-emerald-600" />;
      case 'exit': return <LogOut className="h-3.5 w-3.5 text-destructive" />;
      case 'order': return <ShoppingCart className="h-3.5 w-3.5 text-primary" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'entry': return 'bg-emerald-50 border-emerald-100';
      case 'exit': return 'bg-red-50 border-red-100';
      case 'order': return 'bg-blue-50 border-blue-100';
      default: return 'bg-muted/50 border-border';
    }
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Recently';
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Recent orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 8).map((order) => {
      const agent = agents.find((a) => a.id === order.agentId);
      return { ...order, agentName: agent?.name || 'Unknown' };
    });
  }, [orders, agents]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Activity Feed</h3>
      </div>

      <Tabs defaultValue="activity" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border h-8 bg-muted/20 mx-0">
          <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-card">
            Activity
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs data-[state=active]:bg-card">
            Orders
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs data-[state=active]:bg-card relative">
            Alerts
            {alerts.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs">
                {alerts.length > 9 ? '9+' : alerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Activities */}
        <TabsContent value="activity" className="flex-1 overflow-y-auto mt-0 p-2">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No activities yet</p>
              <p className="text-xs opacity-60">Agent activities will appear here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activities.map((activity) => {
                const agent = agents.find((a) => a.id === activity.employeeId);
                const geo = geofences.find((g) => g.id === activity.geofenceId);
                return (
                  <div
                    key={activity.id}
                    className={`p-2.5 rounded-md border text-xs ${getActivityBg(activity.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{agent?.name}</p>
                        <p className="text-muted-foreground mt-0.5">
                          {activity.type === 'entry' ? `Entered ${geo?.name}` :
                            activity.type === 'exit' ? `Left ${geo?.name}` :
                              activity.description || 'Activity update'}
                        </p>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="flex-1 overflow-y-auto mt-0 p-2">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-2.5 rounded-md border border-border bg-card">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-semibold text-foreground">{order.product}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs px-1 py-0 ${order.status === 'delivered'
                          ? 'text-emerald-600 border-emerald-200'
                          : order.status === 'confirmed'
                            ? 'text-blue-600 border-blue-200'
                            : order.status === 'pending'
                              ? 'text-amber-600 border-amber-200'
                              : 'text-destructive border-destructive/20'
                        }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{order.agentName}</span>
                    <span className="text-xs font-semibold text-foreground">
                      INR {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {order.quantity} bags
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="flex-1 overflow-y-auto mt-0 p-2">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No alerts</p>
              <p className="text-xs opacity-60">Geofence alerts appear here</p>
            </div>
          ) : (
            <>
              <button
                onClick={clearAlerts}
                className="text-xs text-primary hover:underline mb-2 block ml-auto"
              >
                Clear all
              </button>
              <div className="space-y-1.5">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-md border text-xs ${alert.type === 'geofence_entry'
                        ? 'bg-emerald-50 border-emerald-100'
                        : alert.type === 'geofence_exit'
                          ? 'bg-red-50 border-red-100'
                          : 'bg-amber-50 border-amber-100'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.type === 'geofence_entry' ? (
                        <LogIn className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{alert.employeeName}</p>
                        <p className="text-muted-foreground">
                          {alert.type === 'geofence_entry' ? `Entered ${alert.geofenceName}` :
                            alert.type === 'geofence_exit' ? `Left ${alert.geofenceName}` :
                              alert.message || 'Alert'}
                        </p>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
