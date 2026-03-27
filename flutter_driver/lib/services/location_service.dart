import 'dart:async';
import 'dart:math';
import 'package:geolocator/geolocator.dart';

class LocationData {
  final double lat;
  final double lng;
  final double speed; // m/s
  final double heading;
  final double accuracy;
  final DateTime timestamp;

  const LocationData({
    required this.lat,
    required this.lng,
    required this.speed,
    required this.heading,
    required this.accuracy,
    required this.timestamp,
  });

  double get speedKmh => speed * 3.6;
}

class LocationService {
  StreamSubscription<Position>? _subscription;
  final _controller = StreamController<LocationData>.broadcast();
  LocationData? _lastLocation;
  double _totalDistanceKm = 0;

  Stream<LocationData> get locationStream => _controller.stream;
  LocationData? get lastLocation => _lastLocation;
  double get totalDistanceKm => _totalDistanceKm;

  Future<bool> checkPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    if (permission == LocationPermission.deniedForever) return false;
    return true;
  }

  Future<void> startTracking() async {
    _totalDistanceKm = 0;
    _lastLocation = null;

    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // meters
    );

    _subscription = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((position) {
      final data = LocationData(
        lat: position.latitude,
        lng: position.longitude,
        speed: max(0, position.speed),
        heading: position.heading,
        accuracy: position.accuracy,
        timestamp: position.timestamp,
      );

      if (_lastLocation != null) {
        final dist = Geolocator.distanceBetween(
          _lastLocation!.lat, _lastLocation!.lng,
          data.lat, data.lng,
        );
        _totalDistanceKm += dist / 1000;
      }

      _lastLocation = data;
      _controller.add(data);
    });
  }

  void stopTracking() {
    _subscription?.cancel();
    _subscription = null;
  }

  void resetDistance() {
    _totalDistanceKm = 0;
  }

  void dispose() {
    stopTracking();
    _controller.close();
  }
}
