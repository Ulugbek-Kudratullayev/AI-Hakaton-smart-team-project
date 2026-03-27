// Fergana city routes (extracted from real OpenStreetMap road data) and service zones

import ferganaRoutesJson from './ferganaRoutes.json';

export interface VehicleRoute {
  vehicleId: string;
  vehicleCode: string;
  routeName: string;
  color: string;
  waypoints: [number, number][];
}

export interface ServiceZone {
  vehicleId: string;
  vehicleCode: string;
  zoneName: string;
  color: string;
  polygon: [number, number][];
}

// Real road routes from OSM data
export const wasteRoutes: VehicleRoute[] = ferganaRoutesJson.map(r => ({
  ...r,
  waypoints: r.waypoints as [number, number][],
}));

// Service zones — Fergana city districts
export const serviceZones: ServiceZone[] = [
  {
    vehicleId: 'v-002',
    vehicleCode: 'YM-002',
    zoneName: 'Markaz tumani',
    color: '#ef4444',
    polygon: [
      [40.388, 71.776], [40.388, 71.800], [40.382, 71.800], [40.382, 71.776],
    ],
  },
  {
    vehicleId: 'v-008',
    vehicleCode: 'YM-008',
    zoneName: 'Shimoliy turar-joy',
    color: '#f97316',
    polygon: [
      [40.400, 71.755], [40.400, 71.820], [40.390, 71.820], [40.390, 71.755],
    ],
  },
  {
    vehicleId: 'v-014',
    vehicleCode: 'YM-014',
    zoneName: 'Sharqiy tuman',
    color: '#8b5cf6',
    polygon: [
      [40.396, 71.800], [40.396, 71.822], [40.370, 71.822], [40.370, 71.800],
    ],
  },
  {
    vehicleId: 'v-020',
    vehicleCode: 'YM-020',
    zoneName: 'G\'arbiy tuman',
    color: '#0ea5e9',
    polygon: [
      [40.396, 71.748], [40.396, 71.776], [40.370, 71.776], [40.370, 71.748],
    ],
  },
  {
    vehicleId: 'v-022',
    vehicleCode: 'YM-022',
    zoneName: 'Janubiy sanoat hududi',
    color: '#10b981',
    polygon: [
      [40.370, 71.755], [40.370, 71.820], [40.358, 71.820], [40.358, 71.755],
    ],
  },
  {
    vehicleId: 'v-001',
    vehicleCode: 'TR-001',
    zoneName: 'Shimoliy-sharq — qishloq xo\'jaligi',
    color: '#4f46e5',
    polygon: [
      [40.394, 71.804], [40.400, 71.822], [40.396, 71.822], [40.390, 71.810],
    ],
  },
  {
    vehicleId: 'v-004',
    vehicleCode: 'AV-004',
    zoneName: 'Markaz — maktab marshruti',
    color: '#f59e0b',
    polygon: [
      [40.386, 71.782], [40.390, 71.796], [40.384, 71.796], [40.380, 71.782],
    ],
  },
  {
    vehicleId: 'v-003',
    vehicleCode: 'XA-003',
    zoneName: 'Markaz — xizmat hududi',
    color: '#10b981',
    polygon: [
      [40.382, 71.780], [40.388, 71.796], [40.384, 71.800], [40.380, 71.786],
    ],
  },
];
