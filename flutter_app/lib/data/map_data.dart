class VehicleRoute {
  final String vehicleId;
  final String vehicleCode;
  final String routeName;
  final int colorValue;
  final List<List<double>> waypoints;

  const VehicleRoute({
    required this.vehicleId,
    required this.vehicleCode,
    required this.routeName,
    required this.colorValue,
    required this.waypoints,
  });
}

class ServiceZone {
  final String vehicleId;
  final String vehicleCode;
  final String zoneName;
  final int colorValue;
  final List<List<double>> polygon;

  const ServiceZone({
    required this.vehicleId,
    required this.vehicleCode,
    required this.zoneName,
    required this.colorValue,
    required this.polygon,
  });
}

final List<VehicleRoute> wasteRoutes = [
  VehicleRoute(
    vehicleId: 'v-002', vehicleCode: 'YM-002',
    routeName: 'Zangiota — Markaziy marshrut', colorValue: 0xFFef4444,
    waypoints: [
      [41.258, 69.170], [41.262, 69.185], [41.268, 69.200], [41.275, 69.210],
      [41.280, 69.225], [41.285, 69.240], [41.290, 69.248], [41.295, 69.255],
      [41.298, 69.262], [41.302, 69.268], [41.308, 69.275], [41.312, 69.280],
      [41.318, 69.285], [41.322, 69.290],
    ],
  ),
  VehicleRoute(
    vehicleId: 'v-008', vehicleCode: 'YM-008',
    routeName: 'Sergeli — Janubiy marshrut', colorValue: 0xFFf97316,
    waypoints: [
      [41.220, 69.220], [41.225, 69.228], [41.232, 69.235], [41.238, 69.240],
      [41.242, 69.248], [41.248, 69.255], [41.255, 69.258], [41.260, 69.265],
      [41.265, 69.270], [41.270, 69.278], [41.275, 69.285], [41.280, 69.290],
    ],
  ),
  VehicleRoute(
    vehicleId: 'v-014', vehicleCode: 'YM-014',
    routeName: 'Chirchiq — Shimoliy marshrut', colorValue: 0xFF8b5cf6,
    waypoints: [
      [41.460, 69.560], [41.455, 69.548], [41.448, 69.535], [41.440, 69.522],
      [41.432, 69.510], [41.425, 69.498], [41.418, 69.485], [41.410, 69.472],
      [41.402, 69.460], [41.395, 69.448], [41.388, 69.435], [41.380, 69.422],
      [41.372, 69.410], [41.365, 69.398], [41.358, 69.385],
    ],
  ),
  VehicleRoute(
    vehicleId: 'v-020', vehicleCode: 'YM-020',
    routeName: "Olmaliq — G'arbiy marshrut", colorValue: 0xFF0ea5e9,
    waypoints: [
      [41.340, 69.100], [41.338, 69.115], [41.335, 69.130], [41.330, 69.148],
      [41.325, 69.162], [41.320, 69.178], [41.318, 69.192], [41.315, 69.208],
      [41.310, 69.222], [41.308, 69.235], [41.305, 69.250],
    ],
  ),
  VehicleRoute(
    vehicleId: 'v-022', vehicleCode: 'YM-022',
    routeName: 'Bektemir — Sharqiy marshrut', colorValue: 0xFF10b981,
    waypoints: [
      [41.285, 69.340], [41.288, 69.328], [41.292, 69.315], [41.296, 69.302],
      [41.300, 69.290], [41.305, 69.278], [41.310, 69.268], [41.315, 69.258],
      [41.318, 69.248], [41.322, 69.238], [41.325, 69.228],
    ],
  ),
];

final List<ServiceZone> serviceZones = [
  ServiceZone(
    vehicleId: 'v-002', vehicleCode: 'YM-002',
    zoneName: 'Zangiota tumani', colorValue: 0xFFef4444,
    polygon: [
      [41.240, 69.150], [41.250, 69.200], [41.280, 69.220], [41.310, 69.240],
      [41.330, 69.300], [41.320, 69.310], [41.290, 69.295], [41.260, 69.270],
      [41.240, 69.230], [41.230, 69.180],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-008', vehicleCode: 'YM-008',
    zoneName: 'Sergeli tumani', colorValue: 0xFFf97316,
    polygon: [
      [41.200, 69.200], [41.210, 69.240], [41.230, 69.260], [41.260, 69.285],
      [41.280, 69.300], [41.270, 69.310], [41.240, 69.290], [41.220, 69.265],
      [41.205, 69.240], [41.195, 69.215],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-014', vehicleCode: 'YM-014',
    zoneName: 'Chirchiq tumani', colorValue: 0xFF8b5cf6,
    polygon: [
      [41.480, 69.580], [41.470, 69.550], [41.450, 69.520], [41.420, 69.470],
      [41.390, 69.430], [41.360, 69.380], [41.350, 69.400], [41.375, 69.445],
      [41.405, 69.490], [41.435, 69.535], [41.465, 69.570],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-020', vehicleCode: 'YM-020',
    zoneName: 'Olmaliq tumani', colorValue: 0xFF0ea5e9,
    polygon: [
      [41.355, 69.080], [41.350, 69.120], [41.345, 69.155], [41.335, 69.190],
      [41.320, 69.230], [41.305, 69.265], [41.295, 69.255], [41.310, 69.218],
      [41.325, 69.175], [41.335, 69.140], [41.345, 69.100],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-022', vehicleCode: 'YM-022',
    zoneName: 'Bektemir tumani', colorValue: 0xFF10b981,
    polygon: [
      [41.270, 69.355], [41.280, 69.340], [41.295, 69.310], [41.310, 69.275],
      [41.330, 69.245], [41.335, 69.260], [41.320, 69.290], [41.305, 69.320],
      [41.290, 69.345], [41.278, 69.360],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-001', vehicleCode: 'TR-001',
    zoneName: "Chirchiq — qishloq xo'jaligi", colorValue: 0xFF4f46e5,
    polygon: [
      [41.440, 69.540], [41.460, 69.560], [41.480, 69.600], [41.500, 69.620],
      [41.490, 69.640], [41.470, 69.615], [41.450, 69.580], [41.435, 69.555],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-004', vehicleCode: 'AV-004',
    zoneName: 'Qibray — maktab marshruti', colorValue: 0xFFf59e0b,
    polygon: [
      [41.340, 69.370], [41.355, 69.390], [41.370, 69.420], [41.380, 69.445],
      [41.370, 69.455], [41.355, 69.430], [41.340, 69.400], [41.332, 69.380],
    ],
  ),
  ServiceZone(
    vehicleId: 'v-003', vehicleCode: 'XA-003',
    zoneName: 'Toshkent markazi — xizmat hududi', colorValue: 0xFF10b981,
    polygon: [
      [41.290, 69.240], [41.310, 69.260], [41.325, 69.290], [41.335, 69.310],
      [41.320, 69.320], [41.305, 69.300], [41.290, 69.270], [41.282, 69.250],
    ],
  ),
];
