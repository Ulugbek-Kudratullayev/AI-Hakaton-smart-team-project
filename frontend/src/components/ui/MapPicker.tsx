'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapPickerMode = 'polyline' | 'polygon';

interface MapPickerProps {
  points: [number, number][];
  onChange: (points: [number, number][]) => void;
  color: string;
  mode: MapPickerMode;
  height?: number;
}

export default function MapPicker({ points, onChange, color, mode, height = 400 }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const pointsRef = useRef(points);
  const onChangeRef = useRef(onChange);
  pointsRef.current = points;
  onChangeRef.current = onChange;

  // Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.384, 71.789],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 });
    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20 });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
    googleHybrid.addTo(map);
    L.control.layers({ 'Google Gibrid': googleHybrid, 'Google Xarita': googleRoads, 'OSM': osm }, {}, { position: 'topright' }).addTo(map);

    overlayRef.current = L.layerGroup().addTo(map);

    // Click handler — add point
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newPoints: [number, number][] = [...pointsRef.current, [e.latlng.lat, e.latlng.lng]];
      onChangeRef.current(newPoints);
    });

    // Fit to existing points
    if (pointsRef.current.length > 0) {
      map.fitBounds(L.latLngBounds(pointsRef.current), { padding: [40, 40], maxZoom: 16 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-draw overlay when points or color change
  useEffect(() => {
    const group = overlayRef.current;
    if (!group) return;
    group.clearLayers();

    if (points.length === 0) return;

    // Draw shape
    if (mode === 'polygon' && points.length >= 3) {
      group.addLayer(L.polygon(points, {
        color, weight: 3, opacity: 0.8,
        fillColor: color, fillOpacity: 0.2,
      }));
    } else if (points.length >= 2) {
      group.addLayer(L.polyline(points, { color, weight: 4, opacity: 0.8 }));
    }

    // Draw markers
    points.forEach((p, i) => {
      const isFirst = i === 0;
      const isLast = i === points.length - 1;
      const marker = L.circleMarker(p, {
        radius: isFirst || isLast ? 8 : 6,
        color: '#fff',
        weight: 2,
        fillColor: isFirst ? '#10b981' : isLast ? '#ef4444' : color,
        fillOpacity: 1,
      });
      marker.bindTooltip(
        `<b>#${i + 1}</b><br/>${p[0].toFixed(5)}, ${p[1].toFixed(5)}<br/><span style="color:#94a3b8;font-size:10px">Sichqonchaning o'ng tugmasini bosib o'chiring</span>`,
        { direction: 'top' }
      );
      // Right-click to remove point
      marker.on('contextmenu', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        const newPoints = pointsRef.current.filter((_, idx) => idx !== i);
        onChangeRef.current(newPoints);
      });
      group.addLayer(marker);
    });

    // Dashed lines connecting points for polyline
    if (mode === 'polyline' && points.length >= 2) {
      for (let i = 0; i < points.length - 1; i++) {
        const arrow = L.polyline([points[i], points[i + 1]], {
          color, weight: 2, opacity: 0.5, dashArray: '6,4',
        });
        group.addLayer(arrow);
      }
    }
  }, [points, color, mode]);

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div ref={containerRef} style={{ height, width: '100%' }} />
      {/* Help overlay */}
      <div style={{
        position: 'absolute', top: 10, left: 50, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '6px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 11, color: '#475569',
        display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none',
      }}>
        <span style={{ fontWeight: 600, color: '#4f46e5' }}>
          {mode === 'polygon' ? 'Hudud' : 'Marshrut'}:
        </span>
        Xaritaga bosib nuqta qo&apos;shing
        <span style={{ color: '#94a3b8' }}>|</span>
        O&apos;ng tugma — nuqtani o&apos;chirish
        <span style={{ color: '#94a3b8' }}>|</span>
        <span style={{ fontWeight: 600 }}>{points.length} nuqta</span>
      </div>
      {/* Point count badge */}
      {points.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 1000,
          background: color, borderRadius: 8, padding: '4px 10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 11, color: '#fff', fontWeight: 600,
        }}>
          {points.length} nuqta
          {mode === 'polygon' && points.length < 3 && (
            <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.8 }}>
              (kamida 3 ta kerak)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
