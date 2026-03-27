import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/alert.dart';
import '../theme/app_theme.dart';
import 'vehicle_detail_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transport Nazorati'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => _showAlerts(context),
              ),
              if (kpiData.anomalyAlerts > 0)
                Positioned(
                  right: 8, top: 8,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${kpiData.anomalyAlerts}',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Cards
            Row(
              children: [
                _buildKPI('Jami', '${kpiData.totalVehicles}', Icons.directions_car, AppColors.primary),
                const SizedBox(width: 8),
                _buildKPI('Faol', '${kpiData.activeVehicles}', Icons.check_circle, AppColors.success),
                const SizedBox(width: 8),
                _buildKPI('Kutish', '${kpiData.idleVehicles}', Icons.pause_circle, AppColors.warning),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildKPI("Ta'mirda", '${kpiData.inService}', Icons.build, AppColors.danger),
                const SizedBox(width: 8),
                _buildKPI('Samarad.', '${kpiData.averageEfficiency}%', Icons.trending_up, AppColors.info),
                const SizedBox(width: 8),
                _buildKPI('Ogohlant.', '${kpiData.anomalyAlerts}', Icons.warning_amber, AppColors.danger),
              ],
            ),
            const SizedBox(height: 16),

            // Active alerts
            if (alerts.where((a) => a.status == AlertStatus.yangi).isNotEmpty) ...[
              Row(
                children: [
                  const Icon(Icons.warning_amber, color: AppColors.danger, size: 18),
                  const SizedBox(width: 6),
                  const Text(
                    'Faol ogohlantirishlar',
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () => _showAlerts(context),
                    child: const Text("Barchasi", style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ...alerts.where((a) => a.status == AlertStatus.yangi).take(3).map((a) => Card(
                child: ListTile(
                  dense: true,
                  leading: CircleAvatar(
                    radius: 16,
                    backgroundColor: getSeverityColor(a.severity.name).withValues(alpha: 0.15),
                    child: Icon(Icons.warning, size: 16, color: getSeverityColor(a.severity.name)),
                  ),
                  title: Text(a.message, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12)),
                  subtitle: Text(a.vehicleCode, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: getSeverityColor(a.severity.name).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      a.severityLabel,
                      style: TextStyle(color: getSeverityColor(a.severity.name), fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              )),
              const SizedBox(height: 16),
            ],

            // Vehicle list header
            Row(
              children: [
                const Icon(Icons.directions_car, color: AppColors.primary, size: 18),
                const SizedBox(width: 6),
                const Text(
                  'Transport vositalari',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  '${vehicles.length} ta',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Vehicle list
            ...vehicles.map((v) => Card(
              child: ListTile(
                leading: Container(
                  width: 42, height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.bgCardLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: getStatusColor(v.status.name), width: 1.5),
                  ),
                  child: Center(child: Text(v.typeEmoji, style: const TextStyle(fontSize: 20))),
                ),
                title: Row(
                  children: [
                    Text(
                      v.internalCode,
                      style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: getStatusColor(v.status.name).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        v.statusLabel,
                        style: TextStyle(color: getStatusColor(v.status.name), fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                subtitle: Text(
                  '${v.assignedDriver} • ${v.typeLabel}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.local_gas_station,
                          size: 12,
                          color: v.fuelLevel > 50 ? AppColors.success : v.fuelLevel > 20 ? AppColors.warning : AppColors.danger,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          '${v.fuelLevel}%',
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${v.efficiencyScore}% sam.',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                    ),
                  ],
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => VehicleDetailScreen(vehicle: v)),
                  );
                },
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildKPI(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          child: Column(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 6),
              Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }

  void _showAlerts(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
                  ),
                  const SizedBox(height: 12),
                  const Row(
                    children: [
                      Icon(Icons.warning_amber, color: AppColors.danger, size: 20),
                      SizedBox(width: 8),
                      Text('Barcha ogohlantirishlar', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.border),
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                itemCount: alerts.length,
                itemBuilder: (context, index) {
                  final a = alerts[index];
                  return ListTile(
                    leading: CircleAvatar(
                      radius: 18,
                      backgroundColor: getSeverityColor(a.severity.name).withValues(alpha: 0.15),
                      child: Icon(Icons.warning, size: 18, color: getSeverityColor(a.severity.name)),
                    ),
                    title: Text(a.message, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                    subtitle: Text(
                      '${a.vehicleCode} • ${a.typeLabel}',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: getSeverityColor(a.severity.name).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        a.severityLabel,
                        style: TextStyle(color: getSeverityColor(a.severity.name), fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
