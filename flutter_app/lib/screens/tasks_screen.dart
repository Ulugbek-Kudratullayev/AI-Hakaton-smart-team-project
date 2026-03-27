import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final active = tasks.where((t) => t.status == TaskStatus.jarayonda).toList();
    final planned = tasks.where((t) => t.status == TaskStatus.rejalashtirilgan).toList();
    final completed = tasks.where((t) => t.status == TaskStatus.bajarildi).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vazifalar'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary row
            Row(
              children: [
                _buildSummary('Jarayonda', '${active.length}', AppColors.warning),
                const SizedBox(width: 8),
                _buildSummary('Rejada', '${planned.length}', AppColors.info),
                const SizedBox(width: 8),
                _buildSummary('Bajarildi', '${completed.length}', AppColors.success),
              ],
            ),
            const SizedBox(height: 16),

            if (active.isNotEmpty) ...[
              _buildSectionHeader('Jarayonda', AppColors.warning),
              const SizedBox(height: 8),
              ...active.map((t) => _buildTaskCard(context, t)),
              const SizedBox(height: 16),
            ],
            if (planned.isNotEmpty) ...[
              _buildSectionHeader('Rejalashtirilgan', AppColors.info),
              const SizedBox(height: 8),
              ...planned.map((t) => _buildTaskCard(context, t)),
              const SizedBox(height: 16),
            ],
            if (completed.isNotEmpty) ...[
              _buildSectionHeader('Bajarildi', AppColors.success),
              const SizedBox(height: 8),
              ...completed.map((t) => _buildTaskCard(context, t)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummary(String label, String value, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Row(
      children: [
        Container(width: 4, height: 18, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildTaskCard(BuildContext context, Task t) {
    final priorityColor = getPriorityColor(t.priority.name);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showTaskDetail(context, t),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: priorityColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      t.priorityLabel,
                      style: TextStyle(color: priorityColor, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.bgCardLight,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(t.type, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  ),
                  const Spacer(),
                  if (t.assignedVehicleCode != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        t.assignedVehicleCode!,
                        style: const TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(t.title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 13, color: AppColors.textSecondary),
                  const SizedBox(width: 3),
                  Text('${t.region}, ${t.district}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showTaskDetail(BuildContext context, Task t) {
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
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            Text(t.title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(t.description, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 16),
            _detailRow(Icons.location_on, '${t.region}, ${t.district}'),
            _detailRow(Icons.schedule, '${t.scheduledStart.substring(11, 16)} - ${t.scheduledEnd.substring(11, 16)}'),
            if (t.assignedVehicleCode != null)
              _detailRow(Icons.directions_car, 'Biriktirilgan: ${t.assignedVehicleCode}'),
            const SizedBox(height: 16),
            if (t.recommendedVehicles.isNotEmpty) ...[
              const Text('Tavsiya etilgan transport:', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              const SizedBox(height: 8),
              ...t.recommendedVehicles.map((rv) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${rv.score}',
                          style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(rv.vehicleCode, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                          Text(rv.reason, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
        ],
      ),
    );
  }
}
