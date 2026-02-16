import { Agent, Dealer, CompetitionDealer, Order, SalesTarget, Geofence } from './types';

// Rajshahi center - Astha Feeds operates in Rajshahi Division, Bangladesh
const RAJSHAHI_CENTER = { lat: 24.3745, lng: 88.6042 };

// Geographic hierarchy data (Bangladesh: Division > District > Upazila)
export const GEO_ZONES = [
  { zone: 'Rajshahi Division', regions: ['Rajshahi', 'Natore', 'Naogaon'] },
  { zone: 'Rangpur Division', regions: ['Rangpur', 'Dinajpur', 'Bogura'] },
  { zone: 'Khulna Division', regions: ['Khulna', 'Jessore', 'Kushtia'] },
];

// Deterministic agent locations around Rajshahi
const AGENT_LOCATIONS = [
  { lat: RAJSHAHI_CENTER.lat + 0.015, lng: RAJSHAHI_CENTER.lng + 0.012 },
  { lat: RAJSHAHI_CENTER.lat - 0.010, lng: RAJSHAHI_CENTER.lng + 0.028 },
  { lat: RAJSHAHI_CENTER.lat + 0.008, lng: RAJSHAHI_CENTER.lng - 0.018 },
  { lat: RAJSHAHI_CENTER.lat - 0.022, lng: RAJSHAHI_CENTER.lng + 0.015 },
  { lat: RAJSHAHI_CENTER.lat + 0.025, lng: RAJSHAHI_CENTER.lng - 0.008 },
  { lat: RAJSHAHI_CENTER.lat - 0.005, lng: RAJSHAHI_CENTER.lng + 0.035 },
  { lat: RAJSHAHI_CENTER.lat + 0.018, lng: RAJSHAHI_CENTER.lng + 0.022 },
  { lat: RAJSHAHI_CENTER.lat - 0.015, lng: RAJSHAHI_CENTER.lng - 0.010 },
];

export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'Rahim Uddin',
    phone: '+880-1712345678',
    status: 'active',
    geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Boalia' },
    currentLocation: { ...AGENT_LOCATIONS[0], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 5400,
    assignedDealers: ['dealer1', 'dealer2', 'dealer3'],
    targetMonthly: 500000,
    achievedMonthly: 385000,
    dealersAcquired: 3,
    dealersTarget: 5,
  },
  {
    id: 'agent2',
    name: 'Kamal Hossain',
    phone: '+880-1712345679',
    status: 'active',
    geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Shah Makhdum' },
    currentLocation: { ...AGENT_LOCATIONS[1], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 7200,
    assignedDealers: ['dealer4', 'dealer5'],
    targetMonthly: 400000,
    achievedMonthly: 420000,
    dealersAcquired: 4,
    dealersTarget: 4,
  },
  {
    id: 'agent3',
    name: 'Jamal Ahmed',
    phone: '+880-1712345680',
    status: 'active',
    geoHierarchy: { zone: 'Rajshahi Division', region: 'Natore', area: 'Natore Sadar' },
    currentLocation: { ...AGENT_LOCATIONS[2], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 3600,
    assignedDealers: ['dealer6', 'dealer7'],
    targetMonthly: 450000,
    achievedMonthly: 210000,
    dealersAcquired: 1,
    dealersTarget: 3,
  },
  {
    id: 'agent4',
    name: 'Fatema Begum',
    phone: '+880-1712345681',
    status: 'idle',
    geoHierarchy: { zone: 'Rangpur Division', region: 'Bogura', area: 'Bogura Sadar' },
    currentLocation: { ...AGENT_LOCATIONS[3], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 2400,
    assignedDealers: ['dealer8'],
    targetMonthly: 350000,
    achievedMonthly: 180000,
    dealersAcquired: 2,
    dealersTarget: 4,
  },
  {
    id: 'agent5',
    name: 'Mizanur Rahman',
    phone: '+880-1712345682',
    status: 'offline',
    geoHierarchy: { zone: 'Khulna Division', region: 'Kushtia', area: 'Kushtia Sadar' },
    currentLocation: { ...AGENT_LOCATIONS[4], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 1800,
    assignedDealers: ['dealer9', 'dealer10'],
    targetMonthly: 300000,
    achievedMonthly: 95000,
    dealersAcquired: 0,
    dealersTarget: 3,
  },
  {
    id: 'agent6',
    name: 'Nasrin Akter',
    phone: '+880-1712345683',
    status: 'active',
    geoHierarchy: { zone: 'Rangpur Division', region: 'Dinajpur', area: 'Dinajpur Sadar' },
    currentLocation: { ...AGENT_LOCATIONS[5], timestamp: 0 },
    locationHistory: [],
    activeSince: 0,
    totalActiveTime: 6000,
    assignedDealers: ['dealer11', 'dealer12', 'dealer13'],
    targetMonthly: 550000,
    achievedMonthly: 480000,
    dealersAcquired: 5,
    dealersTarget: 5,
  },
];

export const mockDealers: Dealer[] = [
  { id: 'dealer1', name: 'Barind Feed Store', ownerName: 'Abdul Karim', phone: '+880-17101', type: 'active', geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Boalia' }, location: { lat: 24.385, lng: 88.610 }, assignedAgentId: 'agent1', monthlyOrder: 120000, lastOrderDate: 0 },
  { id: 'dealer2', name: 'Padma Agro', ownerName: 'Shafiqul Islam', phone: '+880-17102', type: 'active', geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Boalia' }, location: { lat: 24.380, lng: 88.620 }, assignedAgentId: 'agent1', monthlyOrder: 95000, lastOrderDate: 0 },
  { id: 'dealer3', name: 'Silk City Feed Centre', ownerName: 'Halima Khatun', phone: '+880-17103', type: 'prospect', geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Boalia' }, location: { lat: 24.390, lng: 88.598 }, assignedAgentId: 'agent1', monthlyOrder: 0, lastOrderDate: 0 },
  { id: 'dealer4', name: 'Shaheb Bazar Feed', ownerName: 'Mozammel Haque', phone: '+880-17104', type: 'active', geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Shah Makhdum' }, location: { lat: 24.365, lng: 88.630 }, assignedAgentId: 'agent2', monthlyOrder: 200000, lastOrderDate: 0 },
  { id: 'dealer5', name: 'Noor Feed Mart', ownerName: 'Noor Mohammad', phone: '+880-17105', type: 'active', geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Shah Makhdum' }, location: { lat: 24.362, lng: 88.633 }, assignedAgentId: 'agent2', monthlyOrder: 175000, lastOrderDate: 0 },
  { id: 'dealer6', name: 'Natore Feed Hub', ownerName: 'Alamgir Kabir', phone: '+880-17106', type: 'active', geoHierarchy: { zone: 'Rajshahi Division', region: 'Natore', area: 'Natore Sadar' }, location: { lat: 24.382, lng: 88.588 }, assignedAgentId: 'agent3', monthlyOrder: 150000, lastOrderDate: 0 },
  { id: 'dealer7', name: 'Chalan Beel Agro', ownerName: 'Rafiqul Islam', phone: '+880-17107', type: 'prospect', geoHierarchy: { zone: 'Rajshahi Division', region: 'Natore', area: 'Natore Sadar' }, location: { lat: 24.386, lng: 88.585 }, assignedAgentId: 'agent3', monthlyOrder: 0, lastOrderDate: 0 },
  { id: 'dealer8', name: 'Bogura Agro Centre', ownerName: 'Tariqul Alam', phone: '+880-17108', type: 'active', geoHierarchy: { zone: 'Rangpur Division', region: 'Bogura', area: 'Bogura Sadar' }, location: { lat: 24.353, lng: 88.618 }, assignedAgentId: 'agent4', monthlyOrder: 130000, lastOrderDate: 0 },
  { id: 'dealer9', name: 'Kushtia Feed Hub', ownerName: 'Habibur Rahman', phone: '+880-17109', type: 'active', geoHierarchy: { zone: 'Khulna Division', region: 'Kushtia', area: 'Kushtia Sadar' }, location: { lat: 24.400, lng: 88.598 }, assignedAgentId: 'agent5', monthlyOrder: 80000, lastOrderDate: 0 },
  { id: 'dealer10', name: 'Lalon Feed Store', ownerName: 'Shahidul Islam', phone: '+880-17110', type: 'inactive', geoHierarchy: { zone: 'Khulna Division', region: 'Kushtia', area: 'Kushtia Sadar' }, location: { lat: 24.403, lng: 88.596 }, assignedAgentId: 'agent5', monthlyOrder: 0, lastOrderDate: 0 },
  { id: 'dealer11', name: 'Dinajpur Feed Store', ownerName: 'Anwar Hossain', phone: '+880-17111', type: 'active', geoHierarchy: { zone: 'Rangpur Division', region: 'Dinajpur', area: 'Dinajpur Sadar' }, location: { lat: 24.370, lng: 88.638 }, assignedAgentId: 'agent6', monthlyOrder: 190000, lastOrderDate: 0 },
  { id: 'dealer12', name: 'Kantajew Agro', ownerName: 'Delwar Hossain', phone: '+880-17112', type: 'active', geoHierarchy: { zone: 'Rangpur Division', region: 'Dinajpur', area: 'Dinajpur Sadar' }, location: { lat: 24.373, lng: 88.641 }, assignedAgentId: 'agent6', monthlyOrder: 160000, lastOrderDate: 0 },
  { id: 'dealer13', name: 'Uttarbanga Feed', ownerName: 'Ruhul Amin', phone: '+880-17113', type: 'prospect', geoHierarchy: { zone: 'Rangpur Division', region: 'Dinajpur', area: 'Dinajpur Sadar' }, location: { lat: 24.367, lng: 88.644 }, assignedAgentId: 'agent6', monthlyOrder: 0, lastOrderDate: 0 },
];

export const mockCompetitionDealers: CompetitionDealer[] = [
  { id: 'comp1', name: 'ACI Feed Point', brand: 'ACI Godrej', location: { lat: 24.382, lng: 88.615 }, geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Boalia' }, estimatedVolume: 300000 },
  { id: 'comp2', name: 'Quality Feed Dealer', brand: 'Quality Feeds', location: { lat: 24.370, lng: 88.625 }, geoHierarchy: { zone: 'Rajshahi Division', region: 'Rajshahi', area: 'Shah Makhdum' }, estimatedVolume: 250000 },
  { id: 'comp3', name: 'Kazi Farms Outlet', brand: 'Kazi Farms', location: { lat: 24.393, lng: 88.592 }, geoHierarchy: { zone: 'Rajshahi Division', region: 'Natore', area: 'Natore Sadar' }, estimatedVolume: 180000 },
  { id: 'comp4', name: 'Nourish Poultry Feed', brand: 'Nourish', location: { lat: 24.357, lng: 88.613 }, geoHierarchy: { zone: 'Rangpur Division', region: 'Bogura', area: 'Bogura Sadar' }, estimatedVolume: 200000 },
  { id: 'comp5', name: 'Aftab Feed Shop', brand: 'Aftab Bahumukhi', location: { lat: 24.405, lng: 88.600 }, geoHierarchy: { zone: 'Khulna Division', region: 'Kushtia', area: 'Kushtia Sadar' }, estimatedVolume: 220000 },
];

export const mockOrders: Order[] = [
  { id: 'order1', agentId: 'agent1', dealerId: 'dealer1', amount: 45000, quantity: 50, product: 'Layer Feed Premium', status: 'delivered', createdAt: 0 },
  { id: 'order2', agentId: 'agent1', dealerId: 'dealer2', amount: 32000, quantity: 35, product: 'Broiler Starter', status: 'confirmed', createdAt: 0 },
  { id: 'order3', agentId: 'agent2', dealerId: 'dealer4', amount: 68000, quantity: 75, product: 'Cattle Feed Gold', status: 'delivered', createdAt: 0 },
  { id: 'order4', agentId: 'agent2', dealerId: 'dealer5', amount: 54000, quantity: 60, product: 'Layer Feed Premium', status: 'pending', createdAt: 0 },
  { id: 'order5', agentId: 'agent6', dealerId: 'dealer11', amount: 72000, quantity: 80, product: 'Fish Feed Special', status: 'delivered', createdAt: 0 },
  { id: 'order6', agentId: 'agent6', dealerId: 'dealer12', amount: 41000, quantity: 45, product: 'Broiler Finisher', status: 'confirmed', createdAt: 0 },
  { id: 'order7', agentId: 'agent3', dealerId: 'dealer6', amount: 58000, quantity: 65, product: 'Cattle Feed Gold', status: 'delivered', createdAt: 0 },
  { id: 'order8', agentId: 'agent4', dealerId: 'dealer8', amount: 36000, quantity: 40, product: 'Layer Feed Premium', status: 'pending', createdAt: 0 },
];

export const mockTargets: SalesTarget[] = [
  { id: 'target1', agentId: 'agent1', targetType: 'sales', period: 'monthly', target: 500000, achieved: 385000, updatedAt: 0 },
  { id: 'target2', agentId: 'agent2', targetType: 'sales', period: 'monthly', target: 400000, achieved: 420000, updatedAt: 0 },
  { id: 'target3', agentId: 'agent3', targetType: 'sales', period: 'monthly', target: 450000, achieved: 210000, updatedAt: 0 },
  { id: 'target4', agentId: 'agent4', targetType: 'sales', period: 'monthly', target: 350000, achieved: 180000, updatedAt: 0 },
  { id: 'target5', agentId: 'agent5', targetType: 'sales', period: 'monthly', target: 300000, achieved: 95000, updatedAt: 0 },
  { id: 'target6', agentId: 'agent6', targetType: 'sales', period: 'monthly', target: 550000, achieved: 480000, updatedAt: 0 },
  { id: 'target7', agentId: 'agent1', targetType: 'dealer_acquisition', period: 'monthly', target: 5, achieved: 3, updatedAt: 0 },
  { id: 'target8', agentId: 'agent2', targetType: 'dealer_acquisition', period: 'monthly', target: 4, achieved: 4, updatedAt: 0 },
  { id: 'target9', agentId: 'agent6', targetType: 'dealer_acquisition', period: 'monthly', target: 5, achieved: 5, updatedAt: 0 },
];

// Backward compat
export const mockEmployees = mockAgents;

export const mockGeofences: Geofence[] = [
  { id: 'geo1', name: 'Boalia Market', coordinates: { lat: 24.3780, lng: 88.6100 }, radius: 800, employees: [], color: '#16a34a' },
  { id: 'geo2', name: 'Shaheb Bazar', coordinates: { lat: 24.3650, lng: 88.6280 }, radius: 600, employees: [], color: '#ca8a04' },
  { id: 'geo3', name: 'Rajshahi Court Area', coordinates: { lat: 24.3700, lng: 88.5950 }, radius: 700, employees: [], color: '#2563eb' },
  { id: 'geo4', name: 'Padma Garden', coordinates: { lat: 24.3820, lng: 88.6200 }, radius: 500, employees: [], color: '#dc2626' },
];

export const GEOFENCE_CHECK_INTERVAL = 5000;
export const LOCATION_UPDATE_INTERVAL = 7000;

// Products list
export const PRODUCTS = [
  'Layer Feed Premium',
  'Broiler Starter',
  'Broiler Finisher',
  'Cattle Feed Gold',
  'Fish Feed Special',
  'Pre-Starter Crumbs',
];

// Helper to format currency (BDT - Bangladeshi Taka)
export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
}
