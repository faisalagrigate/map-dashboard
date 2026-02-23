'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    districts, upazilas, bazars, rtDealers, rtSRs,
    getUpazilasForDistrict, getBazarsForUpazila, getBazarsForDistrict,
    getDealersForDistrict, getDealersForUpazila, getDealersForBazar,
    type RTDealer, type RTBazar, type RTSR,
} from '@/lib/retail-trace-data';

const BANGLADESH_CENTER = [89.0, 24.6] as [number, number];

// ─── Barikoi API helpers ──────────────────────────────────────
const BARIKOI_API_KEY = process.env.NEXT_PUBLIC_BARIKOI_API_KEY || process.env.NEXT_PUBLIC_BARIKOI_MAPS_API_KEY || '';

async function reverseGeocode(lat: number, lng: number) {
    try {
        const res = await fetch(
            `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&division=true&area=true&sub_district=true&thana=true`
        );
        const data = await res.json();
        if (data.status === 200 && data.place) {
            return {
                address: data.place.address || '',
                area: data.place.area || '',
                city: data.place.city || '',
                district: data.place.district || '',
                division: data.place.division || '',
                sub_district: data.place.sub_district || '',
                thana: data.place.thana || '',
            };
        }
    } catch (e) { console.warn('Reverse geocode failed:', e); }
    return null;
}

interface RetailTraceMapProps {
    selectedDistrict: string;
    selectedUpazila: string;
    selectedBazar: string;
    flyToDealer: string | null;
    selectedSR: string | null;
    onDealerCountUpdate?: (count: number) => void;
    onSRSelect?: (srId: string | null) => void;
}

export function RetailTraceMap({
    selectedDistrict,
    selectedUpazila,
    selectedBazar,
    flyToDealer,
    selectedSR,
    onDealerCountUpdate,
    onSRSelect,
}: RetailTraceMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const bazarMarkersRef = useRef<any[]>([]);
    const srMarkersRef = useRef<any[]>([]);
    const routeLayerRef = useRef<string | null>(null);
    const animationRef = useRef<number | null>(null);
    const srAnimMarkerRef = useRef<any>(null);
    const trailCoordsRef = useRef<[number, number][]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [animating, setAnimating] = useState(false);
    const [animProgress, setAnimProgress] = useState('');

    // Initialize MapLibre GL
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

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

                const styleUrl = BARIKOI_API_KEY
                    ? `https://map.barikoi.com/styles/osm-liberty/style.json?key=${BARIKOI_API_KEY}`
                    : 'https://demotiles.maplibre.org/style.json';

                const map = new maplibregl.Map({
                    container: mapContainerRef.current,
                    style: styleUrl,
                    center: BANGLADESH_CENTER,
                    zoom: 7.5,
                    attributionControl: false,
                });

                map.addControl(new maplibregl.NavigationControl(), 'top-right');
                map.addControl(new maplibregl.AttributionControl({ customAttribution: '© Barikoi | Retail TRACE' }));

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
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // ─── Marker helpers ───────────────────────────────────────
    const dealerColors: Record<string, string> = {
        active: '#16a34a', prospect: '#2563eb', inactive: '#6b7280', declining: '#f59e0b',
    };
    const dealerLabels: Record<string, string> = {
        active: 'A', prospect: 'P', inactive: 'I', declining: '↓',
    };

    const createDealerMarker = useCallback((dealer: RTDealer): HTMLDivElement => {
        const color = dealerColors[dealer.type] || '#6b7280';
        const label = dealerLabels[dealer.type] || '?';
        const el = document.createElement('div');
        el.style.cssText = `
            width: 20px; height: 20px; background: ${color};
            border: 2px solid white; border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35); cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; font-weight: 700; color: white;
            transition: transform 0.15s;
        `;
        el.textContent = label;
        el.onmouseenter = () => { el.style.transform = 'scale(1.4)'; el.style.zIndex = '10'; };
        el.onmouseleave = () => { el.style.transform = 'scale(1)'; el.style.zIndex = '1'; };
        return el;
    }, []);

    const createBazarMarker = useCallback((bazar: RTBazar): HTMLDivElement => {
        const typeColors: Record<string, string> = {
            poultry: '#dc2626', fish: '#0891b2', mixed: '#7c3aed', general: '#ea580c',
        };
        const color = typeColors[bazar.type] || '#ea580c';
        const el = document.createElement('div');
        el.style.cssText = `
            width: 28px; height: 28px; background: ${color};
            border: 2.5px solid white; border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; transition: transform 0.15s;
        `;
        el.textContent = '🏪';
        el.onmouseenter = () => { el.style.transform = 'scale(1.3)'; };
        el.onmouseleave = () => { el.style.transform = 'scale(1)'; };
        return el;
    }, []);

    // SR marker — MAP POINTER style (pin shape)
    const createSRPointerMarker = useCallback((sr: RTSR, isSelected: boolean): HTMLDivElement => {
        const statusColor = sr.status === 'active' ? '#16a34a' : sr.status === 'idle' ? '#f59e0b' : '#6b7280';
        const el = document.createElement('div');
        el.style.cssText = `
            width: 36px; height: 46px; cursor: pointer; position: relative;
            transition: transform 0.2s; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
            ${isSelected ? 'transform: scale(1.3); z-index: 100;' : ''}
        `;
        // SVG map pin
        el.innerHTML = `
            <svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 28 18 28s18-15.4 18-28C36 8.06 27.94 0 18 0z" fill="${statusColor}"/>
                <circle cx="18" cy="17" r="10" fill="white"/>
                <text x="18" y="21" text-anchor="middle" font-size="12" font-weight="800" fill="${statusColor}">${sr.designation === 'DSR' ? 'D' : 'S'}</text>
                ${isSelected ? '<circle cx="18" cy="17" r="14" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4 2"><animateTransform attributeName="transform" type="rotate" from="0 18 17" to="360 18 17" dur="3s" repeatCount="indefinite"/></circle>' : ''}
            </svg>
        `;
        el.onmouseenter = () => { if (!isSelected) el.style.transform = 'scale(1.2)'; };
        el.onmouseleave = () => { if (!isSelected) el.style.transform = 'scale(1)'; };
        return el;
    }, []);

    // Animated SR marker for route animation (walking person icon)
    const createAnimatedSRMarker = useCallback((): HTMLDivElement => {
        const el = document.createElement('div');
        el.style.cssText = `
            width: 40px; height: 50px; position: relative;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
            z-index: 200; transition: none;
        `;
        el.innerHTML = `
            <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
                <path d="M20 0C9 0 0 9 0 20c0 14 20 30 20 30s20-16 20-30C40 9 31 0 20 0z" fill="#6366f1"/>
                <circle cx="20" cy="18" r="11" fill="white"/>
                <text x="20" y="23" text-anchor="middle" font-size="16" fill="#6366f1">🚶</text>
                <circle cx="20" cy="18" r="16" fill="none" stroke="#6366f1" stroke-width="2" opacity="0.5">
                    <animate attributeName="r" from="14" to="22" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
        return el;
    }, []);

    const fmtBDT = (n: number) => {
        if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
        return `৳${n}`;
    };

    // ─── Clear route and animation ────────────────────────────
    const clearRoute = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (srAnimMarkerRef.current) {
            srAnimMarkerRef.current.remove();
            srAnimMarkerRef.current = null;
        }

        // Remove route line
        if (routeLayerRef.current) {
            if (map.getLayer(`${routeLayerRef.current}-line`)) map.removeLayer(`${routeLayerRef.current}-line`);
            if (map.getLayer(`${routeLayerRef.current}-trail`)) map.removeLayer(`${routeLayerRef.current}-trail`);
            if (map.getSource(routeLayerRef.current)) map.removeSource(routeLayerRef.current);
            if (map.getSource(`${routeLayerRef.current}-trail`)) map.removeSource(`${routeLayerRef.current}-trail`);
            routeLayerRef.current = null;
        }

        trailCoordsRef.current = [];
        setAnimating(false);
        setAnimProgress('');
    }, []);

    // ─── Animate SR along route ───────────────────────────────
    const animateSRRoute = useCallback(async (sr: RTSR, dealerStops: RTDealer[]) => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !(window as any).maplibregl) return;
        const maplibregl = (window as any).maplibregl;

        clearRoute();
        setAnimating(true);

        // Build waypoints: SR start → dealer1 → dealer2 → ...
        const waypoints: [number, number][] = [
            [sr.location.lng, sr.location.lat],
            ...dealerStops.map(d => [d.location.lng, d.location.lat] as [number, number]),
        ];

        // Build a straight-line route (connect waypoints)
        // We could use Barikoi Route API here, but for reliability we'll use straight lines
        // interpolated with intermediate points for smooth animation
        const routeCoords: [number, number][] = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const [lng1, lat1] = waypoints[i];
            const [lng2, lat2] = waypoints[i + 1];
            const steps = 60; // smooth interpolation
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                routeCoords.push([
                    lng1 + (lng2 - lng1) * t,
                    lat1 + (lat2 - lat1) * t,
                ]);
            }
        }

        // Add route line (full planned route — dashed)
        const sourceId = `sr-route-${Date.now()}`;
        routeLayerRef.current = sourceId;

        map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: routeCoords },
                properties: {},
            },
        });

        map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': '#6366f1',
                'line-width': 3,
                'line-dasharray': [4, 3],
                'line-opacity': 0.5,
            },
        });

        // Trail source (animated visited path — solid bright line)
        map.addSource(`${sourceId}-trail`, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [routeCoords[0]] },
                properties: {},
            },
        });

        map.addLayer({
            id: `${sourceId}-trail`,
            type: 'line',
            source: `${sourceId}-trail`,
            paint: {
                'line-color': '#6366f1',
                'line-width': 4,
                'line-opacity': 0.9,
            },
        });

        // Fit map to route
        const allLngs = routeCoords.map(c => c[0]);
        const allLats = routeCoords.map(c => c[1]);
        map.fitBounds(
            [[Math.min(...allLngs), Math.min(...allLats)], [Math.max(...allLngs), Math.max(...allLats)]],
            { padding: 80, maxZoom: 14, duration: 1000 }
        );

        // Create animated SR marker
        const animEl = createAnimatedSRMarker();
        const animMarker = new maplibregl.Marker({ element: animEl, anchor: 'bottom' })
            .setLngLat(routeCoords[0])
            .addTo(map);
        srAnimMarkerRef.current = animMarker;

        // Animate frame by frame
        let currentIdx = 0;
        const totalFrames = routeCoords.length;
        const stopsAtFrames = waypoints.map((_, i) => i * 60); // frame index where each stop is
        let nextStopIdx = 1; // next dealer stop index

        const animateFrame = () => {
            if (currentIdx >= totalFrames) {
                setAnimating(false);
                setAnimProgress(`✅ Route complete — ${dealerStops.length} dealers visited`);
                return;
            }

            const coord = routeCoords[currentIdx];
            animMarker.setLngLat(coord);

            // Update trail
            trailCoordsRef.current.push(coord);
            const trailSource = map.getSource(`${sourceId}-trail`);
            if (trailSource) {
                trailSource.setData({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: [...trailCoordsRef.current] },
                    properties: {},
                });
            }

            // Check if we reached a dealer stop
            if (nextStopIdx < stopsAtFrames.length && currentIdx >= stopsAtFrames[nextStopIdx]) {
                const dealer = dealerStops[nextStopIdx - 1];
                if (dealer) {
                    setAnimProgress(`📍 Visiting: ${dealer.name} (${nextStopIdx}/${dealerStops.length})`);
                }
                nextStopIdx++;
            }

            currentIdx++;
            animationRef.current = requestAnimationFrame(animateFrame);
        };

        setAnimProgress(`🚶 ${sr.name} starting route — ${dealerStops.length} stops`);

        // Small delay before starting
        await new Promise(r => setTimeout(r, 1200));
        animateFrame();
    }, [mapLoaded, clearRoute, createAnimatedSRMarker]);

    // ─── Render markers ───────────────────────────────────────
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !(window as any).maplibregl) return;
        const maplibregl = (window as any).maplibregl;

        // Clear old markers (keep route animation if running)
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        bazarMarkersRef.current.forEach(m => m.remove());
        bazarMarkersRef.current = [];
        srMarkersRef.current.forEach(m => m.remove());
        srMarkersRef.current = [];

        // Filter dealers
        let filteredDealers = rtDealers;
        if (selectedBazar && selectedBazar !== 'all') {
            filteredDealers = getDealersForBazar(selectedBazar);
        } else if (selectedUpazila && selectedUpazila !== 'all') {
            filteredDealers = getDealersForUpazila(selectedUpazila);
        } else if (selectedDistrict && selectedDistrict !== 'all') {
            filteredDealers = getDealersForDistrict(selectedDistrict);
        }

        onDealerCountUpdate?.(filteredDealers.length);

        // Filter bazars
        let filteredBazars = bazars;
        if (selectedUpazila && selectedUpazila !== 'all') {
            filteredBazars = getBazarsForUpazila(selectedUpazila);
        } else if (selectedDistrict && selectedDistrict !== 'all') {
            filteredBazars = getBazarsForDistrict(selectedDistrict);
        }

        // Filter SRs
        let filteredSRs = rtSRs;
        if (selectedDistrict && selectedDistrict !== 'all') {
            filteredSRs = rtSRs.filter(s => s.districtId === selectedDistrict);
        }

        // Add dealer markers
        filteredDealers.forEach(dealer => {
            const el = createDealerMarker(dealer);
            const bazarName = bazars.find(b => b.id === dealer.bazarId)?.name || 'Unknown';
            const distName = districts.find(d => d.id === dealer.districtId)?.name || '';
            const upazilaName = upazilas.find(u => u.id === dealer.upazilaId)?.name || '';

            const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '280px' }).setHTML(`
                <div style="font-family:'Inter',sans-serif;padding:6px 2px">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dealerColors[dealer.type]}"></span>
                        <strong style="font-size:13px;color:#1e293b">${dealer.name}</strong>
                    </div>
                    <div style="font-size:11px;color:#64748b;line-height:1.6">
                        <div>👤 <b>${dealer.ownerName}</b></div>
                        <div>📍 ${bazarName}, ${upazilaName}</div>
                        <div>🏢 ${distName}</div>
                        <div>📞 ${dealer.phone}</div>
                        ${dealer.monthlyOrder > 0 ? `<div>💰 Monthly: <b>${fmtBDT(dealer.monthlyOrder)}</b></div>` : ''}
                        ${dealer.products.length > 0 ? `<div>📦 ${dealer.products.join(', ')}</div>` : ''}
                        <div>📅 Last Visit: ${dealer.lastVisit}</div>
                        <div>👷 SR: ${dealer.assignedSR}</div>
                        <div style="margin-top:4px">
                            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;color:white;background:${dealerColors[dealer.type]}">${dealer.type.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            `);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([dealer.location.lng, dealer.location.lat])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        });

        // Add bazar markers
        filteredBazars.forEach(bazar => {
            const el = createBazarMarker(bazar);
            const upazilaName = upazilas.find(u => u.id === bazar.upazilaId)?.name || '';
            const distName = districts.find(d => d.id === bazar.districtId)?.name || '';
            const dealerCount = rtDealers.filter(d => d.bazarId === bazar.id).length;
            const typeLabel: Record<string, string> = {
                poultry: '🐔 Poultry Market', fish: '🐟 Fish Market', mixed: '🔀 Mixed Market', general: '🏬 General Market',
            };

            const popup = new maplibregl.Popup({ offset: 24, closeButton: true, maxWidth: '240px' }).setHTML(`
                <div style="font-family:'Inter',sans-serif;padding:6px 2px">
                    <strong style="font-size:14px;color:#1e293b">${bazar.name}</strong>
                    <div style="font-size:11px;color:#64748b;line-height:1.8;margin-top:4px">
                        <div>${typeLabel[bazar.type] || bazar.type}</div>
                        <div>📍 ${upazilaName}, ${distName}</div>
                        <div>🏪 <b>${dealerCount}</b> dealers in this bazar</div>
                    </div>
                </div>
            `);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([bazar.location.lng, bazar.location.lat])
                .setPopup(popup)
                .addTo(map);

            bazarMarkersRef.current.push(marker);
        });

        // Add SR pointer markers
        filteredSRs.forEach(sr => {
            const isSelected = selectedSR === sr.id;
            const el = createSRPointerMarker(sr, isSelected);
            const distName = districts.find(d => d.id === sr.districtId)?.name || '';

            // On click → select SR, reverse geocode, show popup with location info
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                onSRSelect?.(sr.id);

                // Reverse geocode the SR's current location
                const geoInfo = await reverseGeocode(sr.location.lat, sr.location.lng);

                const locationHtml = geoInfo
                    ? `<div style="margin-top:4px;padding:6px;background:#f1f5f9;border-radius:6px;font-size:10px;line-height:1.6">
                        <div><b>📍 From Barikoi:</b></div>
                        ${geoInfo.address ? `<div>${geoInfo.address}</div>` : ''}
                        ${geoInfo.district ? `<div>District: <b>${geoInfo.district}</b></div>` : ''}
                        ${geoInfo.sub_district ? `<div>Upazila: <b>${geoInfo.sub_district}</b></div>` : ''}
                        ${geoInfo.thana ? `<div>Thana: <b>${geoInfo.thana}</b></div>` : ''}
                        ${geoInfo.area ? `<div>Area: <b>${geoInfo.area}</b></div>` : ''}
                        ${geoInfo.division ? `<div>Division: <b>${geoInfo.division}</b></div>` : ''}
                       </div>`
                    : `<div style="margin-top:4px;font-size:10px;color:#94a3b8">(Reverse geocode unavailable)</div>`;

                const popup = new maplibregl.Popup({ offset: [0, -40], closeButton: true, maxWidth: '280px' })
                    .setLngLat([sr.location.lng, sr.location.lat])
                    .setHTML(`
                        <div style="font-family:'Inter',sans-serif;padding:6px 2px">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${sr.status === 'active' ? '#16a34a' : sr.status === 'idle' ? '#f59e0b' : '#6b7280'}"></span>
                                <strong style="font-size:14px;color:#1e293b">${sr.name}</strong>
                            </div>
                            <div style="font-size:11px;color:#64748b;line-height:1.6">
                                <div>🏷️ ${sr.designation} — ${distName}</div>
                                <div>📱 ${sr.phone}</div>
                                <div>🏪 ${sr.dealerCount} dealers assigned</div>
                                <div>💰 Sales: ${fmtBDT(sr.monthlySales)} / ${fmtBDT(sr.target)}</div>
                                <div style="margin-top:4px">
                                    <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;color:white;background:${sr.status === 'active' ? '#16a34a' : sr.status === 'idle' ? '#f59e0b' : '#6b7280'}">${sr.status.toUpperCase()}</span>
                                </div>
                            </div>
                            ${locationHtml}
                        </div>
                    `)
                    .addTo(map);
            });

            const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([sr.location.lng, sr.location.lat])
                .addTo(map);

            srMarkersRef.current.push(marker);
        });

        // Fit bounds if district selected
        if (selectedDistrict && selectedDistrict !== 'all') {
            const allPoints = [
                ...filteredDealers.map(d => d.location),
                ...filteredBazars.map(b => b.location),
                ...filteredSRs.map(s => s.location),
            ];
            if (allPoints.length > 0) {
                const bounds = allPoints.reduce(
                    (b, p) => {
                        b[0][0] = Math.min(b[0][0], p.lng);
                        b[0][1] = Math.min(b[0][1], p.lat);
                        b[1][0] = Math.max(b[1][0], p.lng);
                        b[1][1] = Math.max(b[1][1], p.lat);
                        return b;
                    },
                    [[Infinity, Infinity], [-Infinity, -Infinity]] as [[number, number], [number, number]]
                );
                map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
            }
        }
    }, [selectedDistrict, selectedUpazila, selectedBazar, selectedSR, mapLoaded,
        createDealerMarker, createBazarMarker, createSRPointerMarker, onDealerCountUpdate, onSRSelect]);

    // ─── Fly to dealer (smooth, no jump) ──────────────────────
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !flyToDealer) return;

        const dealer = rtDealers.find(d => d.id === flyToDealer);
        if (!dealer) return;

        map.flyTo({
            center: [dealer.location.lng, dealer.location.lat],
            zoom: 15,
            speed: 0.8,
            curve: 1.5,
            essential: true,
        });

        // Open popup after animation
        setTimeout(() => {
            const idx = markersRef.current.findIndex((_, i) => {
                const lngLat = markersRef.current[i]?.getLngLat?.();
                if (!lngLat) return false;
                return Math.abs(lngLat.lng - dealer.location.lng) < 0.0001 &&
                    Math.abs(lngLat.lat - dealer.location.lat) < 0.0001;
            });
            if (idx >= 0) markersRef.current[idx]?.togglePopup();
        }, 1500);
    }, [flyToDealer, mapLoaded]);

    // ─── Start SR route animation when SR is selected ─────────
    useEffect(() => {
        if (!selectedSR || !mapLoaded) {
            clearRoute();
            return;
        }

        const sr = rtSRs.find(s => s.id === selectedSR);
        if (!sr) return;

        // Get dealers assigned to this SR (same district, pick 4-6)
        const srDealers = rtDealers.filter(d => d.districtId === sr.districtId && d.type === 'active');
        const stops = srDealers.slice(0, Math.min(6, srDealers.length));

        if (stops.length > 0) {
            animateSRRoute(sr, stops);
        }
    }, [selectedSR, mapLoaded, animateSRRoute, clearRoute]);

    return (
        <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

            {/* Animation Status Bar */}
            {animProgress && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-indigo-600/95 backdrop-blur text-white px-4 py-2 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2">
                    {animating && (
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    )}
                    <span>{animProgress}</span>
                    {animating && (
                        <button
                            onClick={clearRoute}
                            className="ml-2 text-white/70 hover:text-white text-[10px] underline"
                        >
                            Stop
                        </button>
                    )}
                </div>
            )}

            {/* Legend */}
            {mapLoaded && (
                <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl border border-border p-3 z-10 shadow-xl" style={{ minWidth: '175px' }}>
                    <p className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider mb-2">Map Legend</p>
                    <div className="space-y-1">
                        <p className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">Dealers</p>
                        {[['Active', 'bg-emerald-600'], ['Prospect', 'bg-blue-600'], ['Declining', 'bg-amber-500'], ['Inactive', 'bg-gray-500']].map(([l, c]) => (
                            <div key={l} className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${c} border border-card`} />
                                <span className="text-[10px] text-muted-foreground">{l}</span>
                            </div>
                        ))}
                        <p className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider mt-1.5">Bazars</p>
                        {[['Poultry', '🐔', 'bg-red-600'], ['Fish', '🐟', 'bg-cyan-600'], ['Mixed', '🔀', 'bg-violet-600'], ['General', '🏬', 'bg-orange-500']].map(([l, e, c]) => (
                            <div key={l} className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded ${c} border border-card flex items-center justify-center text-[7px]`}>{e}</div>
                                <span className="text-[10px] text-muted-foreground">{l}</span>
                            </div>
                        ))}
                        <p className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider mt-1.5">Field Agents</p>
                        <div className="flex items-center gap-2">
                            <div className="text-[14px]">📍</div>
                            <span className="text-[10px] text-muted-foreground">SR (click to trace route)</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {!mapLoaded && !loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Loading Retail TRACE Map...</p>
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
