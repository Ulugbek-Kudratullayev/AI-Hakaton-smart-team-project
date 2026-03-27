import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  final _mapController = MapController();
  final _serverController = TextEditingController(text: 'http://192.168.1.100:8000');

  MonitorApiService? _api;
  List<LiveVehiclePosition> _positions = [];
  bool _connected = false;
  bool _connecting = false;
  String? _error;
  Timer? _pollTimer;

  @override
  void dispose() {
    _pollTimer?.cancel();
    _serverController.dispose();
    super.dispose();
  }

  Future<void> _connect() async {
    setState(() {
      _connecting = true;
      _error = null;
    });

    _api = MonitorApiService(_serverController.text.trim());
    final ok = await _api!.testConnection();

    if (ok) {
      await _fetchPositions();
      _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) => _fetchPositions());
      setState(() {
        _connected = true;
        _connecting = false;
      });
    } else {
      setState(() {
        _connecting = false;
        _error = 'Serverga ulanib bo\'lmadi';
      });
    }
  }

  void _disconnect() {
    _pollTimer?.cancel();
    setState(() {
      _connected = false;
      _positions = [];
      _api = null;
    });
  }

  Future<void> _fetchPositions() async {
    if (_api == null) return;
    try {
      final positions = await _api!.fetchPositions();
      setState(() {
        _positions = positions;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Ma\'lumot olishda xato');
    }
  }

  @override
  Widget build(BuildContext context) {
    final realGps = _positions.where((p) => p.isRealGps).toList();
    final simulated = _positions.where((p) => !p.isRealGps).toList();

    return Scaffold(
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const ll.LatLng(41.3, 69.25),
              initialZoom: 10,
              onTap: (_, __) {},
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'uz.hokimiyat.transport_map',
              ),
              // Simulated vehicle markers
              MarkerLayer(
                markers: simulated.map((v) {
                  final isActive = v.status == 'active';
                  return Marker(
                    point: ll.LatLng(v.lat, v.lng),
                    width: 36,
                    height: 36,
                    child: GestureDetector(
                      onTap: () => _showVehicleInfo(v),
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isActive ? AppColors.success : AppColors.textSecondary,
                            width: 2,
                          ),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 4)],
                        ),
                        child: Center(child: Text(v.typeEmoji, style: const TextStyle(fontSize: 16))),
                      ),
                    ),
                  );
                }).toList(),
              ),
              // REAL GPS markers (highlighted)
              MarkerLayer(
                markers: realGps.map((v) {
                  return Marker(
                    point: ll.LatLng(v.lat, v.lng),
                    width: 52,
                    height: 52,
                    child: GestureDetector(
                      onTap: () => _showVehicleInfo(v),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Pulse ring
                          Container(
                            width: 52, height: 52,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary.withValues(alpha: 0.1),
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                            ),
                          ),
                          Container(
                            width: 38, height: 38,
                            decoration: BoxDecoration(
                              color: AppColors.bgCard,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.primary, width: 3),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.5),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(v.typeEmoji, style: const TextStyle(fontSize: 18)),
                            ),
                          ),
                          // "LIVE" badge
                          Positioned(
                            top: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: AppColors.danger,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'LIVE',
                                style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Top bar
          SafeArea(
            child: Container(
              margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.bgCard.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: _connected
                  ? Row(
                      children: [
                        const Icon(Icons.cell_tower, color: AppColors.success, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('Live Harita', style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                              Text(
                                '${_positions.length} ta transport (${realGps.length} ta real GPS)',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        if (realGps.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.danger)),
                                const SizedBox(width: 4),
                                Text('${realGps.length} LIVE', style: const TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: _disconnect,
                          child: const Icon(Icons.close, color: AppColors.textSecondary, size: 20),
                        ),
                      ],
                    )
                  : Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _serverController,
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'Server URL',
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              isDense: true,
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 36,
                          child: ElevatedButton(
                            onPressed: _connecting ? null : _connect,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                            ),
                            child: _connecting
                                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Ulanish', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          // Error
          if (_error != null)
            Positioned(
              top: 80,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ),

          // Vehicle list
          if (_connected && realGps.isNotEmpty)
            Positioned(
              left: 12,
              bottom: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: realGps.map((v) {
                  return GestureDetector(
                    onTap: () {
                      _mapController.move(ll.LatLng(v.lat, v.lng), 15);
                      _showVehicleInfo(v);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.primary),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 6)],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(v.typeEmoji, style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(v.internalCode, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600)),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                    decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(3)),
                                    child: const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w700)),
                                  ),
                                ],
                              ),
                              Text(
                                '${v.speedKmh.toStringAsFixed(0)} km/s',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  void _showVehicleInfo(LiveVehiclePosition v) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.bgCardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: v.isRealGps ? AppColors.primary : AppColors.success,
                      width: 2,
                    ),
                  ),
                  child: Center(child: Text(v.typeEmoji, style: const TextStyle(fontSize: 26))),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(v.internalCode, style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                          if (v.isRealGps) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(4)),
                              child: const Text('LIVE GPS', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ],
                      ),
                      Text(v.vehicleType, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: (v.status == 'active' ? AppColors.success : AppColors.warning).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    v.status == 'active' ? 'Faol' : v.status,
                    style: TextStyle(
                      color: v.status == 'active' ? AppColors.success : AppColors.warning,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _infoChip(Icons.speed, '${v.speedKmh.toStringAsFixed(1)} km/s'),
                const SizedBox(width: 12),
                _infoChip(Icons.local_gas_station, '${v.fuelLevel.toStringAsFixed(0)}%'),
                const SizedBox(width: 12),
                _infoChip(Icons.straighten, '${v.odometer.toStringAsFixed(1)} km'),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${v.lat.toStringAsFixed(6)}, ${v.lng.toStringAsFixed(6)}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.bgCardLight.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: AppColors.textSecondary),
            const SizedBox(width: 5),
            Text(text, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
