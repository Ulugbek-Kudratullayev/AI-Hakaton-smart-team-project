import 'dart:convert';
import 'package:http/http.dart' as http;

class LiveVehiclePosition {
  final int vehicleId;
  final String internalCode;
  final String vehicleType;
  final double lat;
  final double lng;
  final double speedKmh;
  final double heading;
  final String status;
  final double fuelLevel;
  final double odometer;
  final bool isRealGps;

  LiveVehiclePosition({
    required this.vehicleId,
    required this.internalCode,
    required this.vehicleType,
    required this.lat,
    required this.lng,
    required this.speedKmh,
    required this.heading,
    required this.status,
    required this.fuelLevel,
    required this.odometer,
    required this.isRealGps,
  });

  factory LiveVehiclePosition.fromJson(Map<String, dynamic> json) {
    return LiveVehiclePosition(
      vehicleId: json['vehicle_id'] as int,
      internalCode: json['internal_code'] as String,
      vehicleType: json['vehicle_type'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      speedKmh: (json['speed_kmh'] as num).toDouble(),
      heading: (json['heading'] as num).toDouble(),
      status: json['status'] as String,
      fuelLevel: (json['fuel_level'] as num).toDouble(),
      odometer: (json['odometer'] as num).toDouble(),
      isRealGps: json['is_real_gps'] as bool? ?? false,
    );
  }

  String get typeEmoji {
    switch (vehicleType) {
      case 'tractor':
        return '🚜';
      case 'utility_truck':
        return '🚛';
      case 'service_car':
        return '🚗';
      case 'municipal_vehicle':
        return '🚐';
      case 'water_tanker':
        return '💧';
      case 'loader':
        return '🏗️';
      default:
        return '🚗';
    }
  }
}

class MonitorApiService {
  final String baseUrl;

  MonitorApiService(this.baseUrl);

  Future<List<LiveVehiclePosition>> fetchPositions() async {
    final response = await http
        .get(Uri.parse('$baseUrl/api/v1/simulation/positions'))
        .timeout(const Duration(seconds: 5));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((j) => LiveVehiclePosition.fromJson(j)).toList();
    }
    throw Exception('Failed to fetch positions: ${response.statusCode}');
  }

  Future<bool> testConnection() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/api/v1/simulation/status'))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
