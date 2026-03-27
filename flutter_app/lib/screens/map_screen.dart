import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import '../data/mock_data.dart';
import '../data/map_data.dart';
import '../models/vehicle.dart';
import '../models/task.dart' as t;
import '../theme/app_theme.dart';
import 'vehicle_detail_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();

  VehicleType? _selectedType;
  VehicleStatus? _selectedStatus;
  bool _showRoutes = true;
  bool _showZones = true;
  bool _showTasks = true;
  String? _selectedVehicleId;
  bool _showVehicleList = false;

  List<Vehicle> get _filteredVehicles {
    return vehicles.where((v) {
      if (_selectedType != null && v.type != _selectedType) return false;
      if (_selectedStatus != null && v.status != _selectedStatus) return false;
      return true;
    }).toList();
  }

  void _selectVehicle(Vehicle v) {
    setState(() {
      _selectedVehicleId = v.id;
      _showVehicleList = false;
    });
    _mapController.move(
      ll.LatLng(v.currentLocation.lat, v.currentLocation.lng), 12);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const ll.LatLng(41.3, 69.25),
              initialZoom: 9,
              onTap: (_, __) {
                setState(() {
                  _selectedVehicleId = null;
                  _showVehicleList = false;
                });
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'uz.hokimiyat.transport_map',
              ),
              // Service zones
              if (_showZones)
                PolygonLayer(
                  polygons: serviceZones.map((zone) {
                    return Polygon(
                      points: zone.polygon
                          .map((p) => ll.LatLng(p[0], p[1]))
                          .toList(),
                      color: Color(zone.colorValue).withValues(alpha: 0.15),
                      borderColor: Color(zone.colorValue).withValues(alpha: 0.6),
                      borderStrokeWidth: 2,
                      label: '${zone.vehicleCode}\n${zone.zoneName}',
                      labelStyle: TextStyle(
                        color: Color(zone.colorValue),
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    );
                  }).toList(),
                ),
              // Routes
              if (_showRoutes)
                PolylineLayer(
                  polylines: wasteRoutes.map((route) {
                    return Polyline(
                      points: route.waypoints
                          .map((p) => ll.LatLng(p[0], p[1]))
                          .toList(),
                      color: Color(route.colorValue),
                      strokeWidth: 3,
                    );
                  }).toList(),
                ),
              // Task markers
              if (_showTasks)
                MarkerLayer(
                  markers: tasks
                      .where((t) => t.lat != null && t.lng != null)
                      .map((task) {
                    final color = task.priority == t.TaskPriority.yuqori
                        ? AppColors.danger
                        : task.priority == t.TaskPriority.orta
                            ? AppColors.warning
                            : AppColors.info;
                    return Marker(
                      point: ll.LatLng(task.lat!, task.lng!),
                      width: 28,
                      height: 28,
                      child: GestureDetector(
                        onTap: () => _showTaskInfo(task),
                        child: Container(
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.white, width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: color.withValues(alpha: 0.5),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: const Icon(Icons.flag, color: Colors.white, size: 16),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              // Vehicle-to-task lines
              PolylineLayer(
                polylines: tasks
                    .where((task) =>
                        task.assignedVehicle != null &&
                        task.lat != null &&
                        task.lng != null)
                    .map((task) {
                  final vehicle = vehicles.firstWhere(
                    (v) => v.id == task.assignedVehicle,
                    orElse: () => vehicles.first,
                  );
                  return Polyline(
                    points: [
                      ll.LatLng(vehicle.currentLocation.lat,
                          vehicle.currentLocation.lng),
                      ll.LatLng(task.lat!, task.lng!),
                    ],
                    color: AppColors.primary.withValues(alpha: 0.4),
                    strokeWidth: 1.5,
                    pattern: const StrokePattern.dotted(),
                  );
                }).toList(),
              ),
              // Vehicle markers
              MarkerLayer(
                markers: _filteredVehicles.map((v) {
                  final isSelected = v.id == _selectedVehicleId;
                  final statusColor = getStatusColor(v.status.name);
                  return Marker(
                    point: ll.LatLng(
                        v.currentLocation.lat, v.currentLocation.lng),
                    width: isSelected ? 52 : 42,
                    height: isSelected ? 52 : 42,
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedVehicleId = v.id);
                        _showVehiclePopup(v);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppColors.primary : statusColor,
                            width: isSelected ? 3 : 2,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.6),
                                    blurRadius: 12,
                                    spreadRadius: 2,
                                  ),
                                ]
                              : [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                  ),
                                ],
                        ),
                        child: Center(
                          child: Text(
                            v.typeEmoji,
                            style: TextStyle(fontSize: isSelected ? 22 : 18),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Top bar with filters
          SafeArea(
            child: Column(
              children: [
                _buildTopBar(),
                _buildFilterChips(),
              ],
            ),
          ),

          // Toggle buttons (bottom-left)
          Positioned(
            left: 12,
            bottom: 24,
            child: Column(
              children: [
                _buildToggleButton(
                  icon: Icons.route,
                  label: 'Marshrut',
                  active: _showRoutes,
                  onTap: () => setState(() => _showRoutes = !_showRoutes),
                ),
                const SizedBox(height: 8),
                _buildToggleButton(
                  icon: Icons.layers,
                  label: 'Zonalar',
                  active: _showZones,
                  onTap: () => setState(() => _showZones = !_showZones),
                ),
                const SizedBox(height: 8),
                _buildToggleButton(
                  icon: Icons.flag,
                  label: 'Vazifalar',
                  active: _showTasks,
                  onTap: () => setState(() => _showTasks = !_showTasks),
                ),
              ],
            ),
          ),

          // Vehicle count badge (bottom-right)
          Positioned(
            right: 12,
            bottom: 24,
            child: GestureDetector(
              onTap: () => setState(() => _showVehicleList = !_showVehicleList),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.directions_car, color: AppColors.primary, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      '${_filteredVehicles.length} ta',
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      _showVehicleList ? Icons.expand_more : Icons.expand_less,
                      color: AppColors.textSecondary,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Vehicle list panel
          if (_showVehicleList)
            Positioned(
              right: 12,
              bottom: 70,
              child: Container(
                width: 280,
                height: 400,
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.4),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          const Icon(Icons.list, color: AppColors.primary, size: 18),
                          const SizedBox(width: 8),
                          const Text(
                            'Transport vositalari',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => setState(() => _showVehicleList = false),
                            child: const Icon(Icons.close, color: AppColors.textSecondary, size: 18),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        itemCount: _filteredVehicles.length,
                        itemBuilder: (context, index) {
                          final v = _filteredVehicles[index];
                          final isSelected = v.id == _selectedVehicleId;
                          return ListTile(
                            dense: true,
                            selected: isSelected,
                            selectedTileColor: AppColors.primary.withValues(alpha: 0.1),
                            leading: Text(v.typeEmoji, style: const TextStyle(fontSize: 20)),
                            title: Text(
                              v.internalCode,
                              style: TextStyle(
                                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            subtitle: Text(
                              '${v.assignedDriver} • ${v.statusLabel}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                            ),
                            trailing: Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: getStatusColor(v.status.name),
                              ),
                            ),
                            onTap: () => _selectVehicle(v),
                          );
                        },
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

  Widget _buildTopBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.map, color: AppColors.primary, size: 22),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Transport Haritasi',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  '${vehicles.where((v) => v.status == VehicleStatus.faol || v.status == VehicleStatus.yolda).length} faol',
                  style: const TextStyle(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(top: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: [
          _buildTypeChip('Barchasi', null),
          _buildTypeChip('Traktor', VehicleType.traktor),
          _buildTypeChip('Yuk mash.', VehicleType.yukMashinasi),
          _buildTypeChip('Xizmat avto', VehicleType.xizmatAvtomobili),
          _buildTypeChip('Avtobus', VehicleType.avtobus),
          _buildTypeChip('Ekskovator', VehicleType.ekskovator),
          _buildTypeChip("Sug'orish", VehicleType.sugorishMashinasi),
          const SizedBox(width: 12),
          _buildStatusChip('Faol', VehicleStatus.faol),
          _buildStatusChip('Kutish', VehicleStatus.kutish),
          _buildStatusChip("Yo'lda", VehicleStatus.yolda),
          _buildStatusChip("Ta'mirda", VehicleStatus.tamirda),
        ],
      ),
    );
  }

  Widget _buildTypeChip(String label, VehicleType? type) {
    final selected = _selectedType == type;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label, style: TextStyle(fontSize: 11, color: selected ? Colors.white : AppColors.textSecondary)),
        selected: selected,
        onSelected: (_) => setState(() => _selectedType = selected ? null : type),
        backgroundColor: AppColors.bgCard.withValues(alpha: 0.9),
        selectedColor: AppColors.primary,
        checkmarkColor: Colors.white,
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  Widget _buildStatusChip(String label, VehicleStatus status) {
    final selected = _selectedStatus == status;
    final color = getStatusColor(status.name);
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 7, height: 7,
              decoration: BoxDecoration(shape: BoxShape.circle, color: color),
            ),
            const SizedBox(width: 5),
            Text(label, style: TextStyle(fontSize: 11, color: selected ? Colors.white : AppColors.textSecondary)),
          ],
        ),
        selected: selected,
        onSelected: (_) => setState(() => _selectedStatus = selected ? null : status),
        backgroundColor: AppColors.bgCard.withValues(alpha: 0.9),
        selectedColor: color.withValues(alpha: 0.6),
        showCheckmark: false,
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  Widget _buildToggleButton({
    required IconData icon,
    required String label,
    required bool active,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary.withValues(alpha: 0.2) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 4),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: active ? AppColors.primary : AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVehiclePopup(Vehicle v) {
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
            Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.bgCardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: getStatusColor(v.status.name), width: 2),
                  ),
                  child: Center(child: Text(v.typeEmoji, style: const TextStyle(fontSize: 26))),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${v.internalCode} • ${v.plateNumber}',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${v.typeLabel} • ${v.model}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: getStatusColor(v.status.name).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    v.statusLabel,
                    style: TextStyle(
                      color: getStatusColor(v.status.name),
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
                _buildInfoItem(Icons.person, v.assignedDriver),
                const SizedBox(width: 16),
                _buildInfoItem(Icons.local_gas_station, '${v.fuelLevel}%'),
                const SizedBox(width: 16),
                _buildInfoItem(Icons.speed, '${v.efficiencyScore}%'),
              ],
            ),
            const SizedBox(height: 16),
            // Fuel bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Yoqilg'i", style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    Text('${v.fuelLevel}%', style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: v.fuelLevel / 100,
                    backgroundColor: AppColors.bgCardLight,
                    valueColor: AlwaysStoppedAnimation(
                      v.fuelLevel > 50 ? AppColors.success : v.fuelLevel > 20 ? AppColors.warning : AppColors.danger,
                    ),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => VehicleDetailScreen(vehicle: v)),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text("Batafsil ko'rish"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
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
            Flexible(
              child: Text(
                text,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTaskInfo(t.Task task) {
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.flag, color: getPriorityColor(task.priority.name)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    task.title,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: getPriorityColor(task.priority.name).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    task.priorityLabel,
                    style: TextStyle(
                      color: getPriorityColor(task.priority.name),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(task.description, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text('${task.region}, ${task.district}',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
            if (task.assignedVehicleCode != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.directions_car, size: 14, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text('Biriktirilgan: ${task.assignedVehicleCode}',
                      style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.schedule, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text('Holat: ${task.statusLabel}',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
