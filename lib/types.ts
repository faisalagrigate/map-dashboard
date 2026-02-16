// Geographic Hierarchy
export interface GeoHierarchy {
  zone: string;
  region: string;
  area: string;
}

// Location types
export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

// Agent (field salesman)
export interface Agent {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'idle' | 'offline';
  geoHierarchy: GeoHierarchy;
  currentLocation: Location;
  locationHistory: Location[];
  activeSince: number;
  totalActiveTime: number;
  currentGeofence?: string;
  assignedDealers: string[];
  targetMonthly: number;
  achievedMonthly: number;
  dealersAcquired: number;
  dealersTarget: number;
}

// Dealer
export interface Dealer {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  type: 'active' | 'prospect' | 'inactive';
  geoHierarchy: GeoHierarchy;
  location: { lat: number; lng: number };
  assignedAgentId: string;
  monthlyOrder: number;
  lastOrderDate: number;
}

// Competition Dealer
export interface CompetitionDealer {
  id: string;
  name: string;
  brand: string;
  location: { lat: number; lng: number };
  geoHierarchy: GeoHierarchy;
  estimatedVolume: number;
}

// Order
export interface Order {
  id: string;
  agentId: string;
  dealerId: string;
  amount: number;
  quantity: number;
  product: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: number;
}

// Target
export interface SalesTarget {
  id: string;
  agentId: string;
  targetType: 'sales' | 'dealer_acquisition' | 'visits';
  period: 'daily' | 'weekly' | 'monthly';
  target: number;
  achieved: number;
  updatedAt: number;
}

// Geofence types
export interface Geofence {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number;
  employees: string[];
  color?: string;
}

// Activity types
export interface Activity {
  id: string;
  employeeId: string;
  type: 'entry' | 'exit' | 'duration_update' | 'order' | 'dealer_visit';
  geofenceId?: string;
  timestamp: number;
  duration?: number;
  description?: string;
}

// Alert types
export interface Alert {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'geofence_entry' | 'geofence_exit' | 'offline' | 'target_achieved' | 'new_dealer';
  geofenceName?: string;
  timestamp: number;
  read: boolean;
  message?: string;
}

// KPI Summary
export interface KPISummary {
  totalAgents: number;
  activeAgents: number;
  totalDealers: number;
  activeDealers: number;
  newDealersThisMonth: number;
  totalSalesThisMonth: number;
  salesTarget: number;
  averageOrderValue: number;
  competitionDealers: number;
}

// Analytics types (kept for compatibility)
export interface AnalyticsMetrics {
  totalActiveEmployees: number;
  totalEmployees: number;
  employeesPerGeofence: Record<string, number>;
  averageActiveTime: number;
  totalZonesVisited: number;
  skuDistribution: Record<string, number>;
}

// Backward compat alias
export type Employee = Agent;
