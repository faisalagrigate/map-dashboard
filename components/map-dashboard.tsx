'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from '@/context/location-context';
import { Loader } from '@googlemaps/js-api-loader';

const RAJSHAHI_CENTER = { lat: 24.3745, lng: 88.6042 };

export function MapDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const agentMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const dealerMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const competitionMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const geofenceCirclesRef = useRef<Map<string, { circle: google.maps.Circle; label: google.maps.marker.AdvancedMarkerElement }>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { agents, dealers, competitionDealers, geofences, showCompetition } = useLocation();

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Api",apiKey)
    if (!apiKey) {
      setLoadError('Google Maps API key is not set.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['marker'],
    });

    loader
      .importLibrary('maps')
      .then(() => {
        if (!mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
          center: RAJSHAHI_CENTER,
          zoom: 13,
          mapId: 'astha-feeds-dashboard',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });
        mapInstanceRef.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setLoadError('Failed to load Google Maps. Please check your API key.');
      });

    return () => {
      agentMarkersRef.current.forEach((m) => (m.map = null));
      agentMarkersRef.current.clear();
      dealerMarkersRef.current.forEach((m) => (m.map = null));
      dealerMarkersRef.current.clear();
      competitionMarkersRef.current.forEach((m) => (m.map = null));
      competitionMarkersRef.current.clear();
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current.clear();
      geofenceCirclesRef.current.forEach((item) => {
        item.circle.setMap(null);
        item.label.map = null;
      });
      geofenceCirclesRef.current.clear();
      mapInstanceRef.current = null;
    };
  }, []);

  const createAgentPin = useCallback((name: string, status: string) => {
    const colors: Record<string, string> = {
      active: '#16a34a',
      idle: '#ca8a04',
      offline: '#6b7280',
    };
    const bg = colors[status] || '#6b7280';
    const el = document.createElement('div');
    el.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:30px;height:30px;border-radius:50%;
      background:${bg};border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
      transition:transform 0.2s;
    `;
    el.innerHTML = `<span style="color:white;font-weight:700;font-size:11px;">${name.charAt(0)}</span>`;
    el.onmouseenter = () => { el.style.transform = 'scale(1.2)'; };
    el.onmouseleave = () => { el.style.transform = 'scale(1)'; };
    return el;
  }, []);

  const createDealerPin = useCallback((type: string) => {
    const colors: Record<string, string> = {
      active: '#2563eb',
      prospect: '#ca8a04',
      inactive: '#9ca3af',
    };
    const bg = colors[type] || '#9ca3af';
    const el = document.createElement('div');
    el.style.cssText = `
      width:14px;height:14px;border-radius:3px;transform:rotate(45deg);
      background:${bg};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.2);cursor:pointer;
    `;
    return el;
  }, []);

  const createCompetitionPin = useCallback(() => {
    const el = document.createElement('div');
    el.style.cssText = `
      width:14px;height:14px;border-radius:50%;
      background:#dc2626;border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.25);cursor:pointer;
      position:relative;
    `;
    // Add X inside
    el.innerHTML = `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:8px;font-weight:800;">x</span>`;
    return el;
  }, []);

  // Agent markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    agents.forEach((agent) => {
      const id = `agent-${agent.id}`;
      const pos = { lat: agent.currentLocation.lat, lng: agent.currentLocation.lng };

      if (!agentMarkersRef.current.has(id)) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map, position: pos,
          content: createAgentPin(agent.name, agent.status),
          title: agent.name,
          zIndex: 100,
        });
        const info = new google.maps.InfoWindow({
          content: `
            <div style="padding:8px;font-size:12px;max-width:200px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${agent.name}</div>
              <div style="color:#666;margin-bottom:2px;">${agent.geoHierarchy.area}, ${agent.geoHierarchy.region}</div>
              <div style="color:#666;margin-bottom:2px;">Status: <strong>${agent.status}</strong></div>
              <div style="color:#666;">Dealers: ${agent.assignedDealers.length} | Target: ${Math.round((agent.achievedMonthly / agent.targetMonthly) * 100)}%</div>
            </div>
          `,
        });
        marker.addListener('click', () => info.open({ anchor: marker, map }));
        agentMarkersRef.current.set(id, marker);
      } else {
        const marker = agentMarkersRef.current.get(id)!;
        marker.position = pos;
        marker.content = createAgentPin(agent.name, agent.status);
      }

      // Polylines for trails
      if (agent.locationHistory.length > 1) {
        const polyId = `trail-${agent.id}`;
        const path = agent.locationHistory.map((l) => ({ lat: l.lat, lng: l.lng }));
        const color = agent.status === 'active' ? '#16a34a' : agent.status === 'idle' ? '#ca8a04' : '#6b7280';

        if (!polylinesRef.current.has(polyId)) {
          const polyline = new google.maps.Polyline({
            path, geodesic: true, strokeColor: color,
            strokeOpacity: 0.5, strokeWeight: 2, map,
          });
          polylinesRef.current.set(polyId, polyline);
        } else {
          const poly = polylinesRef.current.get(polyId)!;
          poly.setPath(path);
          poly.setOptions({ strokeColor: color });
        }
      }
    });

    // Cleanup removed agents
    const agentIds = new Set(agents.map((a) => `agent-${a.id}`));
    agentMarkersRef.current.forEach((m, k) => {
      if (!agentIds.has(k)) { m.map = null; agentMarkersRef.current.delete(k); }
    });
  }, [agents, mapLoaded, createAgentPin]);

  // Dealer markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    dealers.forEach((dealer) => {
      const id = `dealer-${dealer.id}`;

      if (!dealerMarkersRef.current.has(id)) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map, position: dealer.location,
          content: createDealerPin(dealer.type),
          title: dealer.name,
          zIndex: 50,
        });
        const info = new google.maps.InfoWindow({
          content: `
            <div style="padding:8px;font-size:12px;max-width:200px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${dealer.name}</div>
              <div style="color:#666;margin-bottom:2px;">Owner: ${dealer.ownerName}</div>
              <div style="color:#666;margin-bottom:2px;">Type: <strong>${dealer.type}</strong></div>
              <div style="color:#666;">Monthly: INR ${dealer.monthlyOrder.toLocaleString()}</div>
            </div>
          `,
        });
        marker.addListener('click', () => info.open({ anchor: marker, map }));
        dealerMarkersRef.current.set(id, marker);
      }
    });
  }, [dealers, mapLoaded, createDealerPin]);

  // Competition markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (showCompetition) {
      competitionDealers.forEach((comp) => {
        const id = `comp-${comp.id}`;
        if (!competitionMarkersRef.current.has(id)) {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map, position: comp.location,
            content: createCompetitionPin(),
            title: `${comp.name} (${comp.brand})`,
            zIndex: 30,
          });
          const info = new google.maps.InfoWindow({
            content: `
              <div style="padding:8px;font-size:12px;max-width:200px;">
                <div style="font-weight:700;font-size:13px;color:#dc2626;margin-bottom:4px;">${comp.name}</div>
                <div style="color:#666;margin-bottom:2px;">Brand: <strong>${comp.brand}</strong></div>
                <div style="color:#666;">Est. Volume: INR ${comp.estimatedVolume.toLocaleString()}</div>
              </div>
            `,
          });
          marker.addListener('click', () => info.open({ anchor: marker, map }));
          competitionMarkersRef.current.set(id, marker);
        }
      });
    } else {
      competitionMarkersRef.current.forEach((m) => (m.map = null));
      competitionMarkersRef.current.clear();
    }
  }, [competitionDealers, showCompetition, mapLoaded, createCompetitionPin]);

  // Geofence circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    geofences.forEach((geo) => {
      const id = `circle-${geo.id}`;
      if (!geofenceCirclesRef.current.has(id)) {
        const circle = new google.maps.Circle({
          strokeColor: geo.color || '#16a34a', strokeOpacity: 0.5, strokeWeight: 2,
          fillColor: geo.color || '#16a34a', fillOpacity: 0.08,
          map, center: geo.coordinates, radius: geo.radius,
        });
        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
          font-size:10px;font-weight:700;color:#1e293b;
          background:white;padding:2px 6px;border-radius:3px;
          box-shadow:0 1px 4px rgba(0,0,0,0.15);white-space:nowrap;
        `;
        labelEl.textContent = geo.name;
        const label = new google.maps.marker.AdvancedMarkerElement({
          map, position: geo.coordinates, content: labelEl, zIndex: 10,
        });
        geofenceCirclesRef.current.set(id, { circle, label });
      }
    });
  }, [geofences, mapLoaded]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <div ref={mapRef} className="w-full h-full absolute inset-0" />

      {/* Map Legend */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-3 z-10 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
              <span className="text-xs text-muted-foreground">Agent (Active)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500 border-2 border-card" />
              <span className="text-xs text-muted-foreground">Agent (Idle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm rotate-45 bg-blue-500 border border-card" />
              <span className="text-xs text-muted-foreground">Our Dealer</span>
            </div>
            {showCompetition && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-card" />
                <span className="text-xs text-destructive font-medium">Competition</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!mapLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading Map...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="text-center">
            <p className="text-sm text-destructive font-medium">{loadError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
