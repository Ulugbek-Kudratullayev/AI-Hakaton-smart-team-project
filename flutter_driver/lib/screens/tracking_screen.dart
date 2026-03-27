import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import 'setup_screen.dart';

class TrackingScreen extends StatefulWidget {
  final String serverUrl;
  final String vehicleCode;
  final String vehicleType;
  final String driverName;

  const TrackingScreen({
    super.key,
    required this.serverUrl,
    required this.vehicleCode,
    required this.vehicleType,
    required this.driverName,
  });

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  late final ApiService _api;
  final _locationService = LocationService();
  final _mapController = MapController();

  bool _isTracking = false;
  bool _isRegistering = false;
  int? _vehicleId;
  String _status = 'Tayyor';
  String? _error;
  int _updateCount = 0;
  bool _followMode = true;
  DateTime? _startTime;

  // Location data
  LocationData? _currentLocation;
  final List<ll.LatLng> _trail = [];

  StreamSubscription<LocationData>? _locationSub;
  Timer? _sendTimer;

  static const _typeEmoji = {
    'service_car': '🚗',
    'tractor': '🚜',
    'utility_truck': '🚛',
    'municipal_vehicle': '🚐',
    'water_tanker': '💧',
    'loader': '🏗️',
  };

  @override
  void initState() {
    super.initState();
    _api = ApiService(widget.serverUrl);
    _startTracking();
  }

  Future<void> _startTracking() async {
    setState(() {
      _isRegistering = true;
      _error = null;
      _status = 'GPS ruxsat tekshirilmoqda...';
    });

    // Check GPS permission
    final hasPermission = await _locationService.checkPermission();
    if (!hasPermission) {
      setState(() {
        _isRegistering = false;
        _error = 'GPS ruxsati berilmagan. Iltimos, sozlamalarda ruxsat bering.';
        _status = 'Xato';
      });
      return;
    }

    setState(() => _status = 'GPS kuzatuv boshlanmoqda...');

    // Start GPS tracking
    await _locationService.startTracking();

    // Listen for location updates
    _locationSub = _locationService.locationStream.listen((data) {
      setState(() => _currentLocation = data);

      // Add to trail
      _trail.add(ll.LatLng(data.lat, data.lng));
      if (_trail.length > 500) _trail.removeAt(0);

      // Follow on map
      if (_followMode) {
        _mapController.move(ll.LatLng(data.lat, data.lng), _mapController.camera.zoom);
      }
    });

    // Wait for first fix
    setState(() => _status = 'GPS signal kutilmoqda...');
    await _waitForLocation();

    if (_currentLocation == null) {
      setState(() {
        _isRegistering = false;
        _error = 'GPS signal topilmadi';
        _status = 'Xato';
      });
      return;
    }

    // Register with server
    setState(() => _status = 'Serverga ulanmoqda...');
    try {
      final result = await _api.registerMobile(
        internalCode: widget.vehicleCode,
        vehicleType: widget.vehicleType,
        driverName: widget.driverName,
        lat: _currentLocation!.lat,
        lng: _currentLocation!.lng,
      );
      _vehicleId = result['vehicle_id'] as int;
      setState(() {
        _isTracking = true;
        _isRegistering = false;
        _status = "Kuzatuv faol";
        _startTime = DateTime.now();
      });

      // Start sending GPS data every 3 seconds
      _sendTimer = Timer.periodic(const Duration(seconds: 3), (_) => _sendGPS());
    } catch (e) {
      setState(() {
        _isRegistering = false;
        _error = 'Serverga ulanib bo\'lmadi: $e';
        _status = 'Xato';
      });
    }
  }

  Future<void> _waitForLocation() async {
    for (int i = 0; i < 20; i++) {
      if (_currentLocation != null) return;
      await Future.delayed(const Duration(milliseconds: 500));
    }
  }

  Future<void> _sendGPS() async {
    if (_currentLocation == null || _vehicleId == null) return;

    try {
      await _api.sendGPS(
        vehicleId: _vehicleId!,
        lat: _currentLocation!.lat,
        lng: _currentLocation!.lng,
        speedKmh: _currentLocation!.speedKmh,
        heading: _currentLocation!.heading,
      );
      setState(() {
        _updateCount++;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Yuborish xatosi');
    }
  }

  Future<void> _stopTracking() async {
    _sendTimer?.cancel();
    _locationService.stopTracking();
    _locationSub?.cancel();

    if (_vehicleId != null) {
      try {
        await _api.disconnect(_vehicleId!);
      } catch (_) {}
    }

    setState(() {
      _isTracking = false;
      _status = "To'xtatildi";
      _vehicleId = null;
    });
  }

  void _goBack() async {
    await _stopTracking();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const SetupScreen()),
    );
  }

  String _formatDuration(Duration d) {
    final h = d.inHours.toString().padLeft(2, '0');
    final m = (d.inMinutes % 60).toString().padLeft(2, '0');
    final s = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  void dispose() {
    _sendTimer?.cancel();
    _locationSub?.cancel();
    _locationService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final elapsed = _startTime != null ? DateTime.now().difference(_startTime!) : Duration.zero;

    return Scaffold(
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation != null
                  ? ll.LatLng(_currentLocation!.lat, _currentLocation!.lng)
                  : const ll.LatLng(41.3, 69.25),
              initialZoom: 15,
              onPositionChanged: (pos, hasGesture) {
                if (hasGesture) setState(() => _followMode = false);
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'uz.hokimiyat.driver_app',
              ),
              // Trail
              if (_trail.length > 1)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _trail,
                      color: AppColors.primary,
                      strokeWidth: 4,
                    ),
                  ],
                ),
              // Current position marker
              if (_currentLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: ll.LatLng(_currentLocation!.lat, _currentLocation!.lng),
                      width: 56,
                      height: 56,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Accuracy ring
                          Container(
                            width: 56, height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary.withValues(alpha: 0.15),
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 1),
                            ),
                          ),
                          // Vehicle icon
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.bgCard,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: _isTracking ? AppColors.success : AppColors.warning,
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: (_isTracking ? AppColors.success : AppColors.warning).withValues(alpha: 0.5),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                _typeEmoji[widget.vehicleType] ?? '🚗',
                                style: const TextStyle(fontSize: 20),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
            ],
          ),

          // Top info bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgCard.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: _goBack,
                      child: const Icon(Icons.arrow_back, color: AppColors.textSecondary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${_typeEmoji[widget.vehicleType] ?? "🚗"} ${widget.vehicleCode}',
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      widget.driverName,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                    const Spacer(),
                    // Status indicator
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: (_isTracking ? AppColors.success : _error != null ? AppColors.danger : AppColors.warning).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7, height: 7,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _isTracking ? AppColors.success : _error != null ? AppColors.danger : AppColors.warning,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            _status,
                            style: TextStyle(
                              color: _isTracking ? AppColors.success : _error != null ? AppColors.danger : AppColors.warning,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Follow me button
          if (!_followMode && _currentLocation != null)
            Positioned(
              right: 12,
              bottom: 220,
              child: FloatingActionButton.small(
                onPressed: () {
                  setState(() => _followMode = true);
                  _mapController.move(
                    ll.LatLng(_currentLocation!.lat, _currentLocation!.lng),
                    _mapController.camera.zoom,
                  );
                },
                backgroundColor: AppColors.bgCard,
                child: const Icon(Icons.my_location, color: AppColors.primary),
              ),
            ),

          // Error banner
          if (_error != null)
            Positioned(
              top: 100,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(color: Colors.white, fontSize: 12))),
                    GestureDetector(
                      onTap: () => setState(() => _error = null),
                      child: const Icon(Icons.close, color: Colors.white, size: 16),
                    ),
                  ],
                ),
              ),
            ),

          // Loading overlay
          if (_isRegistering)
            Container(
              color: AppColors.bgDark.withValues(alpha: 0.7),
              child: Center(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(color: AppColors.primary),
                        const SizedBox(height: 16),
                        Text(_status, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // Bottom stats panel
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                border: Border.all(color: AppColors.border),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 8),
                      width: 40, height: 4,
                      decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  // Stats row
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                    child: Row(
                      children: [
                        _buildStat(
                          Icons.speed,
                          '${_currentLocation?.speedKmh.toStringAsFixed(1) ?? "0.0"} km/s',
                          'Tezlik',
                          AppColors.primary,
                        ),
                        _buildStat(
                          Icons.straighten,
                          '${_locationService.totalDistanceKm.toStringAsFixed(2)} km',
                          'Masofa',
                          AppColors.info,
                        ),
                        _buildStat(
                          Icons.timer,
                          _formatDuration(elapsed),
                          'Vaqt',
                          AppColors.warning,
                        ),
                        _buildStat(
                          Icons.cell_tower,
                          '$_updateCount',
                          'Yuborildi',
                          AppColors.success,
                        ),
                      ],
                    ),
                  ),
                  // Coordinates
                  if (_currentLocation != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentLocation!.lat.toStringAsFixed(6)}, ${_currentLocation!.lng.toStringAsFixed(6)}',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontFamily: 'monospace'),
                          ),
                          const Spacer(),
                          const Icon(Icons.gps_fixed, size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentLocation!.accuracy.toStringAsFixed(0)}m',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 12),
                  // Control buttons
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isTracking ? _stopTracking : _startTracking,
                            icon: Icon(_isTracking ? Icons.stop : Icons.play_arrow, size: 20),
                            label: Text(_isTracking ? "To'xtatish" : 'Boshlash'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isTracking ? AppColors.danger : AppColors.success,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: () {
                              _locationService.resetDistance();
                              setState(() {
                                _updateCount = 0;
                                _startTime = DateTime.now();
                                _trail.clear();
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.bgCardLight,
                              foregroundColor: AppColors.textPrimary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Icon(Icons.refresh, size: 20),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
        ],
      ),
    );
  }
}
