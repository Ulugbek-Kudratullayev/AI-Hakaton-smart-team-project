import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../data/mock_data.dart';
import '../theme/app_theme.dart';

class VehicleDetailScreen extends StatelessWidget {
  final Vehicle vehicle;
  const VehicleDetailScreen({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    final v = vehicle;
    final vehicleAlerts = alerts.where((a) => a.vehicleId == v.id).toList();
    final vehicleTasks = tasks.where((t) => t.assignedVehicle == v.id).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('${v.internalCode} - ${v.plateNumber}'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: getStatusColor(v.status.name).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              v.statusLabel,
              style: TextStyle(
                color: getStatusColor(v.status.name),
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.bgCardLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: getStatusColor(v.status.name), width: 2),
                      ),
                      child: Center(child: Text(v.typeEmoji, style: const TextStyle(fontSize: 32))),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            v.typeLabel,
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text('${v.model} • ${v.year}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text(v.department, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // KPI row
            Row(
              children: [
                _buildKPICard('Samaradorlik', '${v.efficiencyScore}%', Icons.trending_up,
                    v.efficiencyScore >= 70 ? AppColors.success : AppColors.warning),
                const SizedBox(width: 10),
                _buildKPICard("Yoqilg'i", '${v.fuelLevel}%', Icons.local_gas_station,
                    v.fuelLevel > 50 ? AppColors.success : v.fuelLevel > 20 ? AppColors.warning : AppColors.danger),
                const SizedBox(width: 10),
                _buildKPICard("Ta'mir xavfi", '${v.maintenanceRisk}%', Icons.warning_amber,
                    v.maintenanceRisk < 40 ? AppColors.success : v.maintenanceRisk < 70 ? AppColors.warning : AppColors.danger),
              ],
            ),
            const SizedBox(height: 12),

            // Fuel bar
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Yoqilg'i darajasi", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                        Text('${v.fuelLevel}%', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 18)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: v.fuelLevel / 100,
                        backgroundColor: AppColors.bgCardLight,
                        valueColor: AlwaysStoppedAnimation(
                          v.fuelLevel > 50 ? AppColors.success : v.fuelLevel > 20 ? AppColors.warning : AppColors.danger,
                        ),
                        minHeight: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Driver info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Haydovchi', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                          child: const Icon(Icons.person, color: AppColors.primary),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(v.assignedDriver, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                              const Text('Biriktirilgan haydovchi', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Details grid
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Texnik ma'lumotlar", style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 12),
                    _buildDetailRow('Odometr', '${_formatNumber(v.odometer)} km'),
                    _buildDetailRow('Anomaliyalar', '${v.anomalyCount} ta'),
                    _buildDetailRow("So'nggi texnik xizmat", v.lastService),
                    _buildDetailRow('Keyingi texnik xizmat', v.nextService),
                    _buildDetailRow('Joylashuv', '${v.currentLocation.lat.toStringAsFixed(4)}, ${v.currentLocation.lng.toStringAsFixed(4)}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Alerts
            if (vehicleAlerts.isNotEmpty) ...[
              const Text('Ogohlantirishlar', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              ...vehicleAlerts.map((a) => Card(
                    child: ListTile(
                      leading: Icon(
                        Icons.warning_amber,
                        color: getSeverityColor(a.severity.name),
                      ),
                      title: Text(a.message, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                      subtitle: Text(a.typeLabel, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: getSeverityColor(a.severity.name).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          a.severityLabel,
                          style: TextStyle(color: getSeverityColor(a.severity.name), fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  )),
              const SizedBox(height: 12),
            ],

            // Tasks
            if (vehicleTasks.isNotEmpty) ...[
              const Text('Vazifalar', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              ...vehicleTasks.map((t) => Card(
                    child: ListTile(
                      leading: Icon(
                        Icons.task_alt,
                        color: getPriorityColor(t.priority.name),
                      ),
                      title: Text(t.title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                      subtitle: Text('${t.region} • ${t.statusLabel}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: getPriorityColor(t.priority.name).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          t.priorityLabel,
                          style: TextStyle(color: getPriorityColor(t.priority.name), fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  )),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildKPICard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 6),
              Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          Text(value, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _formatNumber(int num) {
    final str = num.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) buffer.write(' ');
      buffer.write(str[i]);
    }
    return buffer.toString();
  }
}
