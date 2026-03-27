class LatLng {
  final double lat;
  final double lng;
  const LatLng(this.lat, this.lng);
}

enum VehicleType {
  traktor,
  yukMashinasi,
  xizmatAvtomobili,
  avtobus,
  ekskovator,
  sugorishMashinasi,
}

enum VehicleStatus {
  faol,
  kutish,
  tamirda,
  yolda,
  nomalum,
}

class Vehicle {
  final String id;
  final String internalCode;
  final String plateNumber;
  final VehicleType type;
  final String department;
  final VehicleStatus status;
  final String assignedDriver;
  final LatLng currentLocation;
  final int odometer;
  final int efficiencyScore;
  final int maintenanceRisk;
  final int anomalyCount;
  final int fuelLevel;
  final String lastService;
  final String nextService;
  final int year;
  final String model;

  const Vehicle({
    required this.id,
    required this.internalCode,
    required this.plateNumber,
    required this.type,
    required this.department,
    required this.status,
    required this.assignedDriver,
    required this.currentLocation,
    required this.odometer,
    required this.efficiencyScore,
    required this.maintenanceRisk,
    required this.anomalyCount,
    required this.fuelLevel,
    required this.lastService,
    required this.nextService,
    required this.year,
    required this.model,
  });

  String get typeLabel {
    switch (type) {
      case VehicleType.traktor:
        return 'Traktor';
      case VehicleType.yukMashinasi:
        return 'Yuk mashinasi';
      case VehicleType.xizmatAvtomobili:
        return 'Xizmat avtomobili';
      case VehicleType.avtobus:
        return 'Avtobus';
      case VehicleType.ekskovator:
        return 'Ekskovator';
      case VehicleType.sugorishMashinasi:
        return "Sug'orish mashinasi";
    }
  }

  String get statusLabel {
    switch (status) {
      case VehicleStatus.faol:
        return 'Faol';
      case VehicleStatus.kutish:
        return 'Kutish';
      case VehicleStatus.tamirda:
        return "Ta'mirda";
      case VehicleStatus.yolda:
        return "Yo'lda";
      case VehicleStatus.nomalum:
        return "Noma'lum";
    }
  }

  String get typeEmoji {
    switch (type) {
      case VehicleType.traktor:
        return '🚜';
      case VehicleType.yukMashinasi:
        return '🚛';
      case VehicleType.xizmatAvtomobili:
        return '🚗';
      case VehicleType.avtobus:
        return '🚌';
      case VehicleType.ekskovator:
        return '🏗️';
      case VehicleType.sugorishMashinasi:
        return '💧';
    }
  }
}
