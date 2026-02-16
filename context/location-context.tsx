'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Agent, Dealer, CompetitionDealer, Order, SalesTarget, Geofence, Alert, Activity } from '@/lib/types';
import {
  mockAgents, mockDealers, mockCompetitionDealers, mockOrders, mockTargets,
  mockGeofences, LOCATION_UPDATE_INTERVAL, GEOFENCE_CHECK_INTERVAL
} from '@/lib/mock-data';
import { getEmployeeGeofences } from '@/lib/geofence-detector';

interface LocationContextType {
  agents: Agent[];
  dealers: Dealer[];
  competitionDealers: CompetitionDealer[];
  orders: Order[];
  targets: SalesTarget[];
  geofences: Geofence[];
  alerts: Alert[];
  activities: Activity[];
  selectedZone: string;
  showCompetition: boolean;
  // backward compat
  employees: Agent[];
  selectedSKUs: string[];
  updateEmployeeLocation: (id: string, lat: number, lng: number) => void;
  updateGeofences: (geofences: Geofence[]) => void;
  addGeofence: (geofence: Geofence) => void;
  toggleSKUFilter: (sku: string) => void;
  clearAlerts: () => void;
  getActiveEmployees: () => Agent[];
  getFilteredEmployees: () => Agent[];
  getMetrics: () => { activeCount: number; totalCount: number; averageActiveTime: number };
  setSelectedZone: (zone: string) => void;
  toggleCompetition: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

type LocationAction =
  | { type: 'UPDATE_AGENT_LOCATION'; payload: { id: string; lat: number; lng: number } }
  | { type: 'SET_GEOFENCES'; payload: Geofence[] }
  | { type: 'ADD_GEOFENCE'; payload: Geofence }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_AGENT_STATUS'; payload: { id: string; status: 'active' | 'idle' | 'offline' } }
  | { type: 'UPDATE_GEOFENCE_EMPLOYEES'; payload: { geofenceId: string; employees: string[] } }
  | { type: 'SET_SELECTED_ZONE'; payload: string }
  | { type: 'TOGGLE_COMPETITION' };

interface LocationState {
  agents: Agent[];
  dealers: Dealer[];
  competitionDealers: CompetitionDealer[];
  orders: Order[];
  targets: SalesTarget[];
  geofences: Geofence[];
  alerts: Alert[];
  activities: Activity[];
  selectedZone: string;
  showCompetition: boolean;
}

const initialState: LocationState = {
  agents: mockAgents,
  dealers: mockDealers,
  competitionDealers: mockCompetitionDealers,
  orders: mockOrders,
  targets: mockTargets,
  geofences: mockGeofences,
  alerts: [],
  activities: [],
  selectedZone: 'all',
  showCompetition: false,
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'UPDATE_AGENT_LOCATION': {
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.payload.id
            ? {
              ...agent,
              currentLocation: { lat: action.payload.lat, lng: action.payload.lng, timestamp: Date.now() },
              locationHistory: [
                ...agent.locationHistory.slice(-49),
                { lat: action.payload.lat, lng: action.payload.lng, timestamp: Date.now() },
              ],
              status: 'active' as const,
              activeSince: agent.activeSince || Date.now(),
            }
            : agent
        ),
      };
    }
    case 'SET_GEOFENCES':
      return { ...state, geofences: action.payload };
    case 'ADD_GEOFENCE':
      return { ...state, geofences: [...state.geofences, action.payload] };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 50) };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 100) };
    case 'UPDATE_AGENT_STATUS':
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a
        ),
      };
    case 'UPDATE_GEOFENCE_EMPLOYEES':
      return {
        ...state,
        geofences: state.geofences.map((g) =>
          g.id === action.payload.geofenceId ? { ...g, employees: action.payload.employees } : g
        ),
      };
    case 'SET_SELECTED_ZONE':
      return { ...state, selectedZone: action.payload };
    case 'TOGGLE_COMPETITION':
      return { ...state, showCompetition: !state.showCompetition };
    default:
      return state;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      state.agents.forEach((agent) => {
        if (agent.status !== 'offline') {
          const lat = agent.currentLocation.lat + (Math.random() - 0.5) * 0.005;
          const lng = agent.currentLocation.lng + (Math.random() - 0.5) * 0.005;
          dispatch({ type: 'UPDATE_AGENT_LOCATION', payload: { id: agent.id, lat, lng } });
        }
      });
    }, LOCATION_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [state.agents]);

  // Check geofences
  useEffect(() => {
    const interval = setInterval(() => {
      state.agents.forEach((agent) => {
        if (agent.status !== 'offline') {
          const previousGeofence = agent.currentGeofence;
          const currentGeofences = getEmployeeGeofences(
            agent.currentLocation.lat, agent.currentLocation.lng, state.geofences
          );
          const currentGeofence = currentGeofences[0] || undefined;

          if (!previousGeofence && currentGeofence) {
            const geofenceName = state.geofences.find((g) => g.id === currentGeofence)?.name || 'Unknown';
            dispatch({
              type: 'ADD_ALERT',
              payload: {
                id: `alert-${Date.now()}-${agent.id}`, employeeId: agent.id, employeeName: agent.name,
                type: 'geofence_entry', geofenceName, timestamp: Date.now(), read: false,
              },
            });
            dispatch({
              type: 'ADD_ACTIVITY',
              payload: {
                id: `activity-${Date.now()}-${agent.id}`, employeeId: agent.id,
                type: 'entry', geofenceId: currentGeofence, timestamp: Date.now(),
              },
            });
          }

          if (previousGeofence && !currentGeofence) {
            const geofenceName = state.geofences.find((g) => g.id === previousGeofence)?.name || 'Unknown';
            dispatch({
              type: 'ADD_ALERT',
              payload: {
                id: `alert-${Date.now()}-${agent.id}`, employeeId: agent.id, employeeName: agent.name,
                type: 'geofence_exit', geofenceName, timestamp: Date.now(), read: false,
              },
            });
            dispatch({
              type: 'ADD_ACTIVITY',
              payload: {
                id: `activity-${Date.now()}-${agent.id}`, employeeId: agent.id,
                type: 'exit', geofenceId: previousGeofence, timestamp: Date.now(),
              },
            });
          }

          state.geofences.forEach((geo) => {
            const hasAgent = geo.employees.includes(agent.id);
            const shouldHave = currentGeofences.includes(geo.id);
            if (shouldHave && !hasAgent) {
              dispatch({ type: 'UPDATE_GEOFENCE_EMPLOYEES', payload: { geofenceId: geo.id, employees: [...geo.employees, agent.id] } });
            } else if (!shouldHave && hasAgent) {
              dispatch({ type: 'UPDATE_GEOFENCE_EMPLOYEES', payload: { geofenceId: geo.id, employees: geo.employees.filter((id) => id !== agent.id) } });
            }
          });
        }
      });
    }, GEOFENCE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [state.agents, state.geofences]);

  // Simulate offline status
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAgent = state.agents[Math.floor(Math.random() * state.agents.length)];
      if (randomAgent && Math.random() > 0.85) {
        dispatch({
          type: 'UPDATE_AGENT_STATUS',
          payload: { id: randomAgent.id, status: randomAgent.status === 'offline' ? 'active' : 'offline' },
        });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [state.agents]);

  const value: LocationContextType = {
    agents: state.agents,
    dealers: state.dealers,
    competitionDealers: state.competitionDealers,
    orders: state.orders,
    targets: state.targets,
    geofences: state.geofences,
    alerts: state.alerts,
    activities: state.activities,
    selectedZone: state.selectedZone,
    showCompetition: state.showCompetition,
    // backward compat
    employees: state.agents,
    selectedSKUs: [],
    updateEmployeeLocation: (id, lat, lng) => dispatch({ type: 'UPDATE_AGENT_LOCATION', payload: { id, lat, lng } }),
    updateGeofences: (geofences) => dispatch({ type: 'SET_GEOFENCES', payload: geofences }),
    addGeofence: (geofence) => dispatch({ type: 'ADD_GEOFENCE', payload: geofence }),
    toggleSKUFilter: () => { },
    clearAlerts: () => dispatch({ type: 'CLEAR_ALERTS' }),
    getActiveEmployees: () => state.agents.filter((a) => a.status === 'active'),
    getFilteredEmployees: () => state.agents,
    getMetrics: () => {
      const active = state.agents.filter((a) => a.status === 'active');
      return {
        activeCount: active.length,
        totalCount: state.agents.length,
        averageActiveTime: active.length > 0 ? active.reduce((s, a) => s + a.totalActiveTime, 0) / active.length : 0,
      };
    },
    setSelectedZone: (zone) => dispatch({ type: 'SET_SELECTED_ZONE', payload: zone }),
    toggleCompetition: () => dispatch({ type: 'TOGGLE_COMPETITION' }),
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
}
