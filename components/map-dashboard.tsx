'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from '@/context/location-context';
import { Loader } from '@googlemaps/js-api-loader';
declare const google: any;

const BANGLADESH_CENTER = { lat: 23.685, lng: 90.3563 };
const BANGLADESH_BOUNDS = {
  north: 26.65,
  south: 20.75,
  west: 88.0,
  east: 92.7,
};

export function MapDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const agentMarkersRef = useRef<Map<string, any>>(new Map());
  const dealerMarkersRef = useRef<Map<string, any>>(new Map());
  const competitionMarkersRef = useRef<Map<string, any>>(new Map());
  const polylinesRef = useRef<Map<string, any>>(new Map());
  const geofenceCirclesRef = useRef<Map<string, { circle: any; label: any }>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { agents, dealers, competitionDealers, geofences, showCompetition, selectedAgentId } = useLocation();
  const directionsRendererRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Api", apiKey)
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

        const isMobile =
          typeof window !== 'undefined'
            ? window.matchMedia('(max-width: 640px)').matches
            : false;

        const map = new google.maps.Map(mapRef.current, {
          center: BANGLADESH_CENTER,
          zoom: 7,
          mapId: 'astha-feeds-dashboard',
          disableDefaultUI: isMobile,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          restriction: { latLngBounds: BANGLADESH_BOUNDS, strictBounds: true },
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
      width:34px;height:34px;border-radius:50%;
      background:${status === 'active' ? 'transparent' : bg};border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
      transition:transform 0.2s;overflow:hidden;
    `;
    const fallbackLetter = () => {
      el.style.background = bg;
      el.innerHTML = `<span style="color:white;font-weight:700;font-size:11px;">${name.charAt(0)}</span>`;
    };
    if (status === 'active') {
      const src = process.env.NEXT_PUBLIC_ASTA_GIF_URL || '/astha.gif';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Astha';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      img.onerror = () => fallbackLetter();
      img.onload = () => {
        // Keep transparent background when GIF loads
        el.innerHTML = '';
        el.appendChild(img);
      };
      // In case it never loads, show letter initially then replace on load
      fallbackLetter();
      el.appendChild(img);
    } else {
      fallbackLetter();
    }
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

    const renderMiniMap = (
      info: google.maps.InfoWindow,
      elementId: string,
      segment: { from: { lat: number; lng: number }; to: { lat: number; lng: number } }
    ) => {
      info.addListener('domready', () => {
        const container = document.getElementById(elementId);
        if (!container) return;

        const miniMap = new google.maps.Map(container, {
          center: {
            lat: (segment.from.lat + segment.to.lat) / 2,
            lng: (segment.from.lng + segment.to.lng) / 2,
          },
          zoom: 16,
          disableDefaultUI: true,
          gestureHandling: 'none',
        });

        new google.maps.Polyline({
          path: [
            { lat: segment.from.lat, lng: segment.from.lng },
            { lat: segment.to.lat, lng: segment.to.lng },
          ],
          map: miniMap,
          geodesic: true,
          strokeColor: '#f97316',
          strokeOpacity: 0.9,
          strokeWeight: 3,
        });

        new google.maps.Marker({
          map: miniMap,
          position: { lat: segment.from.lat, lng: segment.from.lng },
        });
        new google.maps.Marker({
          map: miniMap,
          position: { lat: segment.to.lat, lng: segment.to.lng },
        });
      });
    };

    agents.forEach((agent) => {
      const id = `agent-${agent.id}`;
      const pos = { lat: agent.currentLocation.lat, lng: agent.currentLocation.lng };

      const history = agent.locationHistory || [];
      let movementHtml = '';
      let lastSegment: { from: { lat: number; lng: number }; to: { lat: number; lng: number } } | null =
        null;

      if (history.length > 1) {
        const from = history[history.length - 2];
        const to = history[history.length - 1];
        lastSegment = { from, to };
        movementHtml = `
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb;">
            <div style="font-size:12px;font-weight:600;color:#111827;margin-bottom:8px;">
              Last movement (point to point)
            </div>
            <div id="agent-mini-map-${id}" style="width:800px;height:390px;border-radius:10px;overflow:hidden;margin-bottom:8px;background:#e5e7eb;"></div>
            <div style="font-size:12px;color:#4b5563;line-height:1.5;">
              <strong>From:</strong> ${from.lat.toFixed(4)}, ${from.lng.toFixed(4)}<br/>
              <strong>To:</strong> ${to.lat.toFixed(4)}, ${to.lng.toFixed(4)}
            </div>
          </div>
        `;
      }

      if (!agentMarkersRef.current.has(id)) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: pos,
          content: createAgentPin(agent.name, agent.status),
          title: agent.name,
          zIndex: 100,
        });
        const info = new google.maps.InfoWindow({
          content: `
            <div style="padding:10px;font-size:12px;max-width:820px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${agent.name}</div>
              <div style="color:#666;margin-bottom:2px;">${agent.geoHierarchy.area}, ${agent.geoHierarchy.region}</div>
              <div style="color:#666;margin-bottom:2px;">Status: <strong>${agent.status}</strong></div>
              <div style="color:#666;">Dealers: ${agent.assignedDealers.length} | Target: ${Math.round(
                (agent.achievedMonthly / agent.targetMonthly) * 100
              )}%</div>
              ${movementHtml}
            </div>
          `,
        });

        if (lastSegment) {
          renderMiniMap(info, `agent-mini-map-${id}`, lastSegment);
        }

        agentInfoWindowsRef.current.set(id, info);

        marker.addListener('click', () => info.open({ anchor: marker, map }));
        if (!infoWindowRef.current) infoWindowRef.current = info;
        agentMarkersRef.current.set(id, marker);
      } else {
        const marker = agentMarkersRef.current.get(id)!;
        marker.position = pos;
        marker.content = createAgentPin(agent.name, agent.status);

        const existingInfo = agentInfoWindowsRef.current.get(id);
        if (existingInfo) {
          existingInfo.setContent(`
            <div style="padding:10px;font-size:12px;max-width:820px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${agent.name}</div>
              <div style="color:#666;margin-bottom:2px;">${agent.geoHierarchy.area}, ${agent.geoHierarchy.region}</div>
              <div style="color:#666;margin-bottom:2px;">Status: <strong>${agent.status}</strong></div>
              <div style="color:#666;">Dealers: ${agent.assignedDealers.length} | Target: ${Math.round(
                (agent.achievedMonthly / agent.targetMonthly) * 100
              )}%</div>
              ${movementHtml}
            </div>
          `);

          if (lastSegment) {
            renderMiniMap(existingInfo, `agent-mini-map-${id}`, lastSegment);
          }
        }
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

  // Focus selected agent and show route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !selectedAgentId) return;
    const agent = agents.find((a) => a.id === selectedAgentId);
    if (!agent || agent.status !== 'active') return;
    const marker = agentMarkersRef.current.get(`agent-${agent.id}`);
    const origin = agent.locationHistory[0] || agent.currentLocation;
    const destination = agent.currentLocation;

    map.panTo({ lat: destination.lat, lng: destination.lng });
    map.setZoom(11);

    const directionsService = new google.maps.DirectionsService();
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#10b981', strokeOpacity: 0.9, strokeWeight: 4 },
    });
    directionsRendererRef.current = renderer;
    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === 'OK' && result) {
          renderer.setDirections(result);
          const content = `
            <div style="padding:8px;font-size:12px;max-width:240px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:6px;">${agent.name}</div>
              <div style="margin-bottom:4px;color:#374151;">
                From: <strong>${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}</strong>
              </div>
              <div style="color:#374151;">
                To: <strong>${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}</strong>
              </div>
            </div>
          `;
          const info = infoWindowRef.current || new google.maps.InfoWindow();
          info.setContent(content);
          infoWindowRef.current = info;
          if (marker) info.open({ anchor: marker, map });
        }
      }
    );
  }, [selectedAgentId, agents, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[280px] md:min-h-[400px]">
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
