enum TaskStatus {
  rejalashtirilgan,
  jarayonda,
  bajarildi,
  bekorQilindi,
}

enum TaskPriority {
  yuqori,
  orta,
  past,
}

class RecommendedVehicle {
  final String vehicleId;
  final String vehicleCode;
  final int score;
  final String reason;

  const RecommendedVehicle({
    required this.vehicleId,
    required this.vehicleCode,
    required this.score,
    required this.reason,
  });
}

class Task {
  final String id;
  final String title;
  final String type;
  final TaskPriority priority;
  final String region;
  final String district;
  final String scheduledStart;
  final String scheduledEnd;
  final TaskStatus status;
  final String? assignedVehicle;
  final String? assignedVehicleCode;
  final List<RecommendedVehicle> recommendedVehicles;
  final String description;
  final String createdAt;
  final double? lat;
  final double? lng;

  const Task({
    required this.id,
    required this.title,
    required this.type,
    required this.priority,
    required this.region,
    required this.district,
    required this.scheduledStart,
    required this.scheduledEnd,
    required this.status,
    this.assignedVehicle,
    this.assignedVehicleCode,
    required this.recommendedVehicles,
    required this.description,
    required this.createdAt,
    this.lat,
    this.lng,
  });

  String get statusLabel {
    switch (status) {
      case TaskStatus.rejalashtirilgan:
        return 'Rejalashtirilgan';
      case TaskStatus.jarayonda:
        return 'Jarayonda';
      case TaskStatus.bajarildi:
        return 'Bajarildi';
      case TaskStatus.bekorQilindi:
        return 'Bekor qilindi';
    }
  }

  String get priorityLabel {
    switch (priority) {
      case TaskPriority.yuqori:
        return 'Yuqori';
      case TaskPriority.orta:
        return "O'rta";
      case TaskPriority.past:
        return 'Past';
    }
  }
}
