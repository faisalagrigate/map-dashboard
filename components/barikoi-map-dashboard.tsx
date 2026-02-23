'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/context/location-context';

const BANGLADESH_CENTER = [90.3563, 23.685] as [number, number];
const BANGLADESH_BOUNDS = [
    [88.0, 20.75],
    [92.7, 26.65]
];

export function BarikoiMapDashboard() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const geofenceLayersRef = useRef<string[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const { agents, dealers, competitionDealers, geofences, showCompetition, selectedAgentId } = useLocation();

    // Initialize MapLibre GL
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;
        if (!apiKey) {
            console.warn('NEXT_PUBLIC_BARIKOI_API_KEY is not set. Map might not load properly.');
        }

        const loadMap = async () => {
            try {
                if (!(window as any).maplibregl) {
                    const link = document.createElement('link');
                    link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);

                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
                    script.async = true;
                    document.head.appendChild(script);

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to load MapLibre GL JS'));
                    });
                }

                const maplibregl = (window as any).maplibregl;

                const styleUrl = apiKey
                    ? `https://map.barikoi.com/styles/osm-liberty/style.json?key=${apiKey}`
                    : 'https://demotiles.maplibre.org/style.json';

                const map = new maplibregl.Map({
                    container: mapContainerRef.current,
                    style: styleUrl,
                    center: BANGLADESH_CENTER,
                    zoom: 7,
                    maxBounds: BANGLADESH_BOUNDS,
                    attributionControl: false,
                });

                map.addControl(new maplibregl.NavigationControl(), 'top-right');
                map.addControl(new maplibregl.AttributionControl({ customAttribution: '© Barikoi' }));

                map.on('load', () => {
                    mapInstanceRef.current = map;
                    setMapLoaded(true);
                });

                map.on('error', (e: any) => {
                    console.error('Map error:', e);
                    if (e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
                        setLoadError('Invalid or missing Barikoi API key.');
                    }
                });
            } catch (err) {
                console.error('Failed to initialize map:', err);
                setLoadError('Failed to load map infrastructure.');
            }
        };

        loadMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Helper: create a styled marker element
    const createMarkerElement = (color: string, size = 22, label?: string): HTMLDivElement => {
        const el = document.createElement('div');
        el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 2.5px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: white;
        `;
        if (label) el.textContent = label;
        return el;
    };

    // Render markers: agents, dealers, competition dealers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !(window as any).maplibregl) return;

        const maplibregl = (window as any).maplibregl;

        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Agents
        agents.forEach((agent) => {
            const color = agent.status === 'active' ? '#16a34a' : agent.status === 'idle' ? '#f59e0b' : '#6b7280';
            const el = createMarkerElement(color, 22);
            el.title = agent.name;

            const popup = new maplibregl.Popup({ offset: 28, closeButton: false }).setHTML(`
                <div style="font-family:sans-serif;padding:4px 2px">
                    <strong style="font-size:13px">${agent.name}</strong><br/>
                    <span style="font-size:11px;color:#555">Status: ${agent.status}</span>
                </div>
            `);

            const marker = new maplibregl.Marker(el)
                .setLngLat([agent.currentLocation.lng, agent.currentLocation.lat])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        });

        // Dealers
        dealers.forEach((dealer) => {
            const el = createMarkerElement('#2563eb', 18, 'D');
            el.title = dealer.name;

            const popup = new maplibregl.Popup({ offset: 28, closeButton: false }).setHTML(`
                <div style="font-family:sans-serif;padding:4px 2px">
                    <strong style="font-size:13px">${dealer.name}</strong><br/>
                    <span style="font-size:11px;color:#555">Dealer</span>
                </div>
            `);

            const marker = new maplibregl.Marker(el)
                .setLngLat([dealer.location.lng, dealer.location.lat])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        });

        // Competition dealers (conditional)
        if (showCompetition) {
            competitionDealers.forEach((dealer) => {
                const el = createMarkerElement('#dc2626', 18, 'C');
                el.title = dealer.name;

                const popup = new maplibregl.Popup({ offset: 28, closeButton: false }).setHTML(`
                    <div style="font-family:sans-serif;padding:4px 2px">
                        <strong style="font-size:13px">${dealer.name}</strong><br/>
                        <span style="font-size:11px;color:#dc2626">Competition</span>
                    </div>
                `);

                const marker = new maplibregl.Marker(el)
                    .setLngLat([dealer.location.lng, dealer.location.lat])
                    .setPopup(popup)
                    .addTo(map);

                markersRef.current.push(marker);
            });
        }
    }, [agents, dealers, competitionDealers, showCompetition, mapLoaded]);

    // Render geofences as GeoJSON fill + outline layers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded) return;

        // Remove old geofence layers and sources
        geofenceLayersRef.current.forEach((id) => {
            if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`);
            if (map.getLayer(`${id}-outline`)) map.removeLayer(`${id}-outline`);
            if (map.getSource(id)) map.removeSource(id);
        });
        geofenceLayersRef.current = [];

        geofences.forEach((geofence) => {
            const sourceId = `geofence-${geofence.id}`;

            // Build GeoJSON polygon from geofence coordinates
            // Assumes geofence.coordinates is an array of {lat, lng} or a GeoJSON polygon
            let coordinates: number[][][] = [];

            if (geofence.coordinates && Array.isArray(geofence.coordinates)) {
                // Handle both [{lat,lng}] and [[lng,lat]] formats
                const first = geofence.coordinates[0];
                if (first && typeof first === 'object' && 'lat' in first) {
                    coordinates = [
                        [
                            ...geofence.coordinates.map((c: any) => [c.lng, c.lat]),
                            [geofence.coordinates[0].lng, geofence.coordinates[0].lat], // close ring
                        ],
                    ];
                } else if (Array.isArray(first)) {
                    coordinates = [geofence.coordinates as number[][]];
                }
            } else if (geofence.geometry) {
                // Already GeoJSON geometry
                coordinates = geofence.geometry.coordinates;
            }

            if (coordinates.length === 0) return;

            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates },
                    properties: { name: geofence.name },
                },
            });

            map.addLayer({
                id: `${sourceId}-fill`,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': geofence.color ?? '#6366f1',
                    'fill-opacity': 0.15,
                },
            });

            map.addLayer({
                id: `${sourceId}-outline`,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': geofence.color ?? '#6366f1',
                    'line-width': 2,
                    'line-dasharray': [3, 2],
                },
            });

            geofenceLayersRef.current.push(sourceId);
        });
    }, [geofences, mapLoaded]);

    // Focus selected agent
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !selectedAgentId) return;

        const agent = agents.find((a) => a.id === selectedAgentId);
        if (!agent) return;

        map.flyTo({
            center: [agent.currentLocation.lng, agent.currentLocation.lat],
            zoom: 13,
            essential: true,
        });

        // Open the selected agent's popup
        const markerIndex = agents.indexOf(agent);
        const marker = markersRef.current[markerIndex];
        if (marker) marker.togglePopup();
    }, [selectedAgentId, agents, mapLoaded]);

    return (
        <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

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
                            <div className="h-3 w-3 rounded-full bg-gray-500 border-2 border-card" />
                            <span className="text-xs text-muted-foreground">Agent (Offline)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-600 border-2 border-card flex items-center justify-center">
                                <span className="text-[7px] font-bold text-white leading-none">D</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Dealer</span>
                        </div>
                        {showCompetition && (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-600 border-2 border-card flex items-center justify-center">
                                    <span className="text-[7px] font-bold text-white leading-none">C</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Competition</span>
                            </div>
                        )}
                        {geofences.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-5 rounded-sm border-2 border-indigo-500 bg-indigo-500/20" />
                                <span className="text-xs text-muted-foreground">Geofence</span>
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
                        <p className="text-sm text-muted-foreground">Loading Barikoi Map...</p>
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