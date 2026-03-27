import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  String _baseUrl;

  ApiService(this._baseUrl);

  void updateBaseUrl(String url) {
    _baseUrl = url;
  }

  String get baseUrl => _baseUrl;

  Future<Map<String, dynamic>> registerMobile({
    required String internalCode,
    required String vehicleType,
    required String driverName,
    required double lat,
    required double lng,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/v1/simulation/register-mobile'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'internal_code': internalCode,
        'vehicle_type': vehicleType,
        'driver_name': driverName,
        'lat': lat,
        'lng': lng,
      }),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Register failed: ${response.statusCode} ${response.body}');
  }

  Future<Map<String, dynamic>> sendGPS({
    required int vehicleId,
    required double lat,
    required double lng,
    double? speedKmh,
    double? heading,
    double? fuelLevel,
  }) async {
    final body = <String, dynamic>{
      'vehicle_id': vehicleId,
      'lat': lat,
      'lng': lng,
    };
    if (speedKmh != null) body['speed_kmh'] = speedKmh;
    if (heading != null) body['heading'] = heading;
    if (fuelLevel != null) body['fuel_level'] = fuelLevel;

    final response = await http.post(
      Uri.parse('$_baseUrl/api/v1/simulation/mobile-gps'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('GPS update failed: ${response.statusCode}');
  }

  Future<void> disconnect(int vehicleId) async {
    await http.post(
      Uri.parse('$_baseUrl/api/v1/simulation/disconnect-mobile'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'vehicle_id': vehicleId}),
    );
  }

  Future<bool> testConnection() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl/api/v1/simulation/status'))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
