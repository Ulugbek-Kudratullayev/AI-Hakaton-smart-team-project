enum AlertSeverity {
  yuqori,
  orta,
  past,
}

enum AlertStatus {
  yangi,
  korildi,
  halQilindi,
}

class Alert {
  final String id;
  final String type;
  final AlertSeverity severity;
  final String vehicleId;
  final String vehicleCode;
  final String message;
  final String createdAt;
  final AlertStatus status;
  final String details;

  const Alert({
    required this.id,
    required this.type,
    required this.severity,
    required this.vehicleId,
    required this.vehicleCode,
    required this.message,
    required this.createdAt,
    required this.status,
    required this.details,
  });

  String get severityLabel {
    switch (severity) {
      case AlertSeverity.yuqori:
        return 'Yuqori';
      case AlertSeverity.orta:
        return "O'rta";
      case AlertSeverity.past:
        return 'Past';
    }
  }

  String get typeLabel {
    switch (type) {
      case 'yoqilgi_anomaliya':
        return "Yoqilg'i anomaliyasi";
      case 'ortiqcha_kutish':
        return 'Ortiqcha kutish';
      case 'texnik_xizmat':
        return 'Texnik xizmat';
      case 'tezlik_buzilishi':
        return 'Tezlik buzilishi';
      case 'marshrut_buzilishi':
        return 'Marshrut buzilishi';
      default:
        return type;
    }
  }
}
