import 'dart:math';
import '../models/vehicle.dart';
import '../models/task.dart';
import '../models/alert.dart';

const _departments = [
  "Qishloq xo'jaligi bo'limi",
  "Kommunal xo'jalik bo'limi",
  "Yo'l-transport bo'limi",
  "Ekologiya bo'limi",
  "Qurilish bo'limi",
];

const _drivers = [
  'Abdullayev Jasur', 'Karimov Behruz', 'Toshmatov Sardor', 'Nazarov Dilshod',
  'Umarov Sherzod', 'Rahimov Otabek', 'Xasanov Jamshid', 'Aliyev Nodir',
  'Sultonov Firdavs', 'Mirzayev Alisher', 'Ergashev Bobur', 'Xolmatov Aziz',
  'Raxmatullayev Sarvarbek', 'Yusupov Temur', 'Qodirov Anvar', "Tursunov Ulug'bek",
  'Muminov Ilhom', 'Saidov Farrux', 'Ismoilov Bahrom', 'Hakimov Rustam',
  'Ruziyev Doston', 'Boymatov Sanjar', 'Normatov Zafar', 'Ashrapov Eldor',
  'Qosimov Muzaffar',
];

const _vehicleModels = <VehicleType, List<String>>{
  VehicleType.traktor: ['MX U Profi', 'Belarus 82.1', 'John Deere 6B', 'Case IH Farmall', 'Claas Arion 420'],
  VehicleType.yukMashinasi: ['ISUZU NPR', 'MAN TGS', 'KamAZ 65115', 'Howo A7', 'Shacman X3000'],
  VehicleType.xizmatAvtomobili: ['Chevrolet Cobalt', 'Chevrolet Lacetti', 'Hyundai Accent', 'Kia Rio', 'Chevrolet Tracker'],
  VehicleType.avtobus: ['Isuzu SAZ', 'Yutong ZK6116H', 'PAZ 32054', 'SAZ NP37', 'Ankai HFF6110'],
  VehicleType.ekskovator: ['JCB 3CX', 'Cat 320', 'Komatsu PC200', 'Hyundai HX220', 'Volvo EC210'],
  VehicleType.sugorishMashinasi: ['KamAZ Suv', 'ZIL Sugorish', 'MAZ Suv tashish', 'GAZ Suv', 'Howo Suv'],
};

const _vehicleTypes = <({VehicleType type, String prefix})>[
  (type: VehicleType.traktor, prefix: 'TR'),
  (type: VehicleType.yukMashinasi, prefix: 'YM'),
  (type: VehicleType.xizmatAvtomobili, prefix: 'XA'),
  (type: VehicleType.avtobus, prefix: 'AV'),
  (type: VehicleType.ekskovator, prefix: 'EK'),
  (type: VehicleType.sugorishMashinasi, prefix: 'SM'),
];

const _statuses = [
  VehicleStatus.faol, VehicleStatus.faol, VehicleStatus.faol,
  VehicleStatus.kutish, VehicleStatus.tamirda,
  VehicleStatus.yolda, VehicleStatus.yolda,
];

double _seededRandom(int seed) {
  final x = sin(seed * 9301 + 49297) * 233280;
  return x - x.floorToDouble();
}

final List<Vehicle> vehicles = List.generate(25, (i) {
  final vType = _vehicleTypes[i % _vehicleTypes.length];
  final models = _vehicleModels[vType.type]!;
  double r(int offset) => _seededRandom(i * 100 + offset);

  return Vehicle(
    id: 'v-${(i + 1).toString().padLeft(3, '0')}',
    internalCode: '${vType.prefix}-${(i + 1).toString().padLeft(3, '0')}',
    plateNumber: '01 ${(100 + i).toString().substring(0, 3)} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 5) % 26))}${String.fromCharCode(65 + ((i + 10) % 26))}',
    type: vType.type,
    department: _departments[i % _departments.length],
    status: _statuses[i % _statuses.length],
    assignedDriver: _drivers[i % _drivers.length],
    currentLocation: LatLng(
      41.3 + (r(1) - 0.5) * 0.3,
      69.25 + (r(2) - 0.5) * 0.4,
    ),
    odometer: (15000 + r(3) * 120000).floor(),
    efficiencyScore: (55 + r(4) * 45).floor(),
    maintenanceRisk: (r(5) * 100).floor(),
    anomalyCount: (r(6) * 8).floor(),
    fuelLevel: (15 + r(7) * 85).floor(),
    lastService: '2026-0${1 + (r(8) * 2).floor()}-${(10 + (r(9) * 18).floor()).toString().padLeft(2, '0')}',
    nextService: '2026-0${3 + (r(10) * 2).floor()}-${(1 + (r(11) * 28).floor()).toString().padLeft(2, '0')}',
    year: 2018 + (r(12) * 7).floor(),
    model: models[i % models.length],
  );
});

final List<Task> tasks = [
  Task(
    id: 't-001', title: "Bug'doy dalasini haydash", type: "Qishloq xo'jalik",
    priority: TaskPriority.yuqori, region: 'Toshkent viloyati', district: 'Chirchiq tumani',
    scheduledStart: '2026-03-27T08:00:00', scheduledEnd: '2026-03-27T17:00:00',
    status: TaskStatus.rejalashtirilgan, assignedVehicle: 'v-001', assignedVehicleCode: 'TR-001',
    description: "50 gektar bug'doy dalasini haydash kerak", createdAt: '2026-03-25T10:00:00',
    lat: 41.47, lng: 69.58,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-001', vehicleCode: 'TR-001', score: 95, reason: 'Eng yaqin joylashuv, yuqori samaradorlik'),
      RecommendedVehicle(vehicleId: 'v-007', vehicleCode: 'TR-007', score: 88, reason: 'Yaxshi texnik holat, tajribali haydovchi'),
      RecommendedVehicle(vehicleId: 'v-013', vehicleCode: 'TR-013', score: 82, reason: "Bo'sh holat, o'rtacha samaradorlik"),
    ],
  ),
  Task(
    id: 't-002', title: "Ko'cha tozalash xizmati", type: 'Kommunal',
    priority: TaskPriority.orta, region: 'Toshkent viloyati', district: 'Zangiota tumani',
    scheduledStart: '2026-03-27T06:00:00', scheduledEnd: '2026-03-27T12:00:00',
    status: TaskStatus.jarayonda, assignedVehicle: 'v-002', assignedVehicleCode: 'YM-002',
    description: "Asosiy ko'chalarni tozalash va chiqindilarni olib ketish", createdAt: '2026-03-25T09:00:00',
    lat: 41.25, lng: 69.18,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-002', vehicleCode: 'YM-002', score: 92, reason: 'Tegishli tur, yaqin hudud'),
      RecommendedVehicle(vehicleId: 'v-008', vehicleCode: 'YM-008', score: 85, reason: 'Zaxira variant, yaxshi holat'),
      RecommendedVehicle(vehicleId: 'v-014', vehicleCode: 'YM-014', score: 78, reason: "Mavjud, o'rtacha masofa"),
    ],
  ),
  Task(
    id: 't-003', title: "Yo'l ta'mirlash ishlari", type: 'Qurilish',
    priority: TaskPriority.yuqori, region: 'Samarqand viloyati', district: 'Urgut tumani',
    scheduledStart: '2026-03-28T07:00:00', scheduledEnd: '2026-03-28T18:00:00',
    status: TaskStatus.rejalashtirilgan, assignedVehicle: null, assignedVehicleCode: null,
    description: "Urgut tumanidagi 5 km yo'l qoplamasi ta'mirlash", createdAt: '2026-03-25T14:00:00',
    lat: 39.35, lng: 67.10,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-005', vehicleCode: 'EK-005', score: 90, reason: 'Ekskovator turi mos, yaqin'),
      RecommendedVehicle(vehicleId: 'v-011', vehicleCode: 'EK-011', score: 84, reason: "Yaxshi ishlash ko'rsatkichi"),
      RecommendedVehicle(vehicleId: 'v-017', vehicleCode: 'EK-017', score: 76, reason: 'Mavjud, kutish holatida'),
    ],
  ),
  Task(
    id: 't-004', title: 'Sugorish tizimini tekshirish', type: "Qishloq xo'jalik",
    priority: TaskPriority.orta, region: "Farg'ona viloyati", district: 'Quva tumani',
    scheduledStart: '2026-03-27T09:00:00', scheduledEnd: '2026-03-27T15:00:00',
    status: TaskStatus.bajarildi, assignedVehicle: 'v-006', assignedVehicleCode: 'SM-006',
    description: "Sugorish kanallarini tekshirish va ta'mirlash", createdAt: '2026-03-24T11:00:00',
    lat: 40.53, lng: 70.98,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-006', vehicleCode: 'SM-006', score: 94, reason: "Sug'orish mashinasi, eng mos"),
      RecommendedVehicle(vehicleId: 'v-012', vehicleCode: 'SM-012', score: 87, reason: 'Zaxira variant'),
      RecommendedVehicle(vehicleId: 'v-018', vehicleCode: 'SM-018', score: 80, reason: 'Mavjud, yaxshi holat'),
    ],
  ),
  Task(
    id: 't-005', title: 'Maktab marshruti', type: 'Transport',
    priority: TaskPriority.yuqori, region: 'Toshkent viloyati', district: 'Qibray tumani',
    scheduledStart: '2026-03-27T07:00:00', scheduledEnd: '2026-03-27T08:30:00',
    status: TaskStatus.jarayonda, assignedVehicle: 'v-004', assignedVehicleCode: 'AV-004',
    description: "O'quvchilarni maktabga yetkazish marshruti", createdAt: '2026-03-26T06:00:00',
    lat: 41.36, lng: 69.40,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-004', vehicleCode: 'AV-004', score: 96, reason: 'Avtobus turi, eng mos marshrut'),
      RecommendedVehicle(vehicleId: 'v-010', vehicleCode: 'AV-010', score: 89, reason: 'Zaxira avtobus, yaxshi holat'),
      RecommendedVehicle(vehicleId: 'v-016', vehicleCode: 'AV-016', score: 81, reason: "Mavjud, o'rtacha holat"),
    ],
  ),
  Task(
    id: 't-006', title: 'Paxta terimiga tayyorgarlik', type: "Qishloq xo'jalik",
    priority: TaskPriority.past, region: 'Buxoro viloyati', district: "G'ijduvon tumani",
    scheduledStart: '2026-03-29T08:00:00', scheduledEnd: '2026-03-29T16:00:00',
    status: TaskStatus.rejalashtirilgan, assignedVehicle: null, assignedVehicleCode: null,
    description: 'Dalalarni paxta terimi uchun tayyorlash', createdAt: '2026-03-25T16:00:00',
    lat: 39.82, lng: 64.42,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-019', vehicleCode: 'TR-019', score: 91, reason: "Eng yaqin traktor, bo'sh"),
      RecommendedVehicle(vehicleId: 'v-025', vehicleCode: 'TR-025', score: 85, reason: 'Yaxshi samaradorlik'),
      RecommendedVehicle(vehicleId: 'v-001', vehicleCode: 'TR-001', score: 72, reason: "Mavjud, lekin band bo'lishi mumkin"),
    ],
  ),
  Task(
    id: 't-007', title: 'Kommunal avariya chiqish', type: 'Kommunal',
    priority: TaskPriority.yuqori, region: 'Andijon viloyati', district: 'Asaka tumani',
    scheduledStart: '2026-03-26T14:00:00', scheduledEnd: '2026-03-26T18:00:00',
    status: TaskStatus.jarayonda, assignedVehicle: 'v-003', assignedVehicleCode: 'XA-003',
    description: "Suv quvuri portlashi, tezkor ta'mirlash", createdAt: '2026-03-26T13:30:00',
    lat: 40.63, lng: 71.72,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-003', vehicleCode: 'XA-003', score: 93, reason: 'Eng yaqin xizmat avtomobili'),
      RecommendedVehicle(vehicleId: 'v-009', vehicleCode: 'XA-009', score: 86, reason: 'Zaxira, yaxshi holat'),
      RecommendedVehicle(vehicleId: 'v-015', vehicleCode: 'XA-015', score: 79, reason: 'Mavjud variant'),
    ],
  ),
  Task(
    id: 't-008', title: 'Ekologik monitoring', type: 'Ekologiya',
    priority: TaskPriority.orta, region: 'Samarqand viloyati', district: 'Jomboy tumani',
    scheduledStart: '2026-03-28T09:00:00', scheduledEnd: '2026-03-28T14:00:00',
    status: TaskStatus.rejalashtirilgan, assignedVehicle: null, assignedVehicleCode: null,
    description: 'Hududdagi ekologik holatni tekshirish va hisobot', createdAt: '2026-03-26T10:00:00',
    lat: 39.72, lng: 67.22,
    recommendedVehicles: [
      RecommendedVehicle(vehicleId: 'v-003', vehicleCode: 'XA-003', score: 88, reason: 'Xizmat avtomobili, qulay'),
      RecommendedVehicle(vehicleId: 'v-009', vehicleCode: 'XA-009', score: 82, reason: "Yaxshi yoqilg'i samaradorligi"),
      RecommendedVehicle(vehicleId: 'v-021', vehicleCode: 'XA-021', score: 75, reason: 'Mavjud, yaqin hudud'),
    ],
  ),
];

final List<Alert> alerts = [
  Alert(
    id: 'a-001', type: 'yoqilgi_anomaliya', severity: AlertSeverity.yuqori,
    vehicleId: 'v-002', vehicleCode: 'YM-002',
    message: "Yoqilg'i sarfi me'yoridan 40% oshgan",
    createdAt: '2026-03-26T15:30:00', status: AlertStatus.yangi,
    details: "So'nggi 3 soat ichida yoqilg'i sarfi keskin oshgan.",
  ),
  Alert(
    id: 'a-002', type: 'texnik_xizmat', severity: AlertSeverity.yuqori,
    vehicleId: 'v-007', vehicleCode: 'TR-007',
    message: "Texnik xizmat muddati 5 kun oldin o'tgan",
    createdAt: '2026-03-26T09:00:00', status: AlertStatus.yangi,
    details: "Moy almashtirish va filtr tozalash muddati o'tib ketgan.",
  ),
  Alert(
    id: 'a-003', type: 'ortiqcha_kutish', severity: AlertSeverity.orta,
    vehicleId: 'v-015', vehicleCode: 'XA-015',
    message: 'Avtomobil 4 soatdan ortiq harakatsiz',
    createdAt: '2026-03-26T14:00:00', status: AlertStatus.korildi,
    details: "Dvigatel yoqilgan holda kutish vaqti me'yordan oshgan.",
  ),
  Alert(
    id: 'a-004', type: 'tezlik_buzilishi', severity: AlertSeverity.yuqori,
    vehicleId: 'v-004', vehicleCode: 'AV-004',
    message: 'Tezlik chegarasidan oshish (95 km/s)',
    createdAt: '2026-03-26T11:20:00', status: AlertStatus.yangi,
    details: "Avtobus 60 km/s tezlik chegarasidan oshib ketgan.",
  ),
  Alert(
    id: 'a-005', type: 'yoqilgi_anomaliya', severity: AlertSeverity.orta,
    vehicleId: 'v-010', vehicleCode: 'AV-010',
    message: "Yoqilg'i darajasi kutilmagan tarzda kamaydi",
    createdAt: '2026-03-26T08:45:00', status: AlertStatus.korildi,
    details: "Yoqilg'i darajasi 30 daqiqa ichida 25% kamaygan.",
  ),
  Alert(
    id: 'a-006', type: 'marshrut_buzilishi', severity: AlertSeverity.past,
    vehicleId: 'v-003', vehicleCode: 'XA-003',
    message: 'Belgilangan marshrutdan chetga chiqish',
    createdAt: '2026-03-26T13:15:00', status: AlertStatus.halQilindi,
    details: 'Avtomobil belgilangan marshrutdan 3 km chetga chiqgan.',
  ),
  Alert(
    id: 'a-007', type: 'texnik_xizmat', severity: AlertSeverity.orta,
    vehicleId: 'v-019', vehicleCode: 'TR-019',
    message: 'Shina bosimi past',
    createdAt: '2026-03-26T07:30:00', status: AlertStatus.yangi,
    details: "Old chap shina bosimi me'yordan 30% past.",
  ),
  Alert(
    id: 'a-008', type: 'ortiqcha_kutish', severity: AlertSeverity.past,
    vehicleId: 'v-022', vehicleCode: 'YM-022',
    message: 'Yuk mashinasi 2 soat kutish holatida',
    createdAt: '2026-03-26T16:00:00', status: AlertStatus.yangi,
    details: 'Yuk mashinasi belgilangan manzilda 2 soatdan ortiq kutib turgan.',
  ),
  Alert(
    id: 'a-009', type: 'yoqilgi_anomaliya', severity: AlertSeverity.yuqori,
    vehicleId: 'v-014', vehicleCode: 'YM-014',
    message: "G'ayritabiiy yoqilg'i to'ldirish hajmi",
    createdAt: '2026-03-25T18:20:00', status: AlertStatus.korildi,
    details: "Yoqilg'i to'ldirish hajmi bak sig'imidan 20% ko'p ko'rsatilgan.",
  ),
  Alert(
    id: 'a-010', type: 'tezlik_buzilishi', severity: AlertSeverity.orta,
    vehicleId: 'v-008', vehicleCode: 'YM-008',
    message: 'Tezlik chegarasidan oshish (78 km/s)',
    createdAt: '2026-03-25T16:45:00', status: AlertStatus.halQilindi,
    details: 'Yuk mashinasi shahar ichida tezlik chegarasidan oshgan.',
  ),
];

class KPIData {
  final int totalVehicles;
  final int activeVehicles;
  final int idleVehicles;
  final int inService;
  final int averageEfficiency;
  final int anomalyAlerts;

  const KPIData({
    required this.totalVehicles,
    required this.activeVehicles,
    required this.idleVehicles,
    required this.inService,
    required this.averageEfficiency,
    required this.anomalyAlerts,
  });
}

final kpiData = KPIData(
  totalVehicles: 25,
  activeVehicles: 14,
  idleVehicles: 4,
  inService: 3,
  averageEfficiency: 78,
  anomalyAlerts: alerts.where((a) => a.status == AlertStatus.yangi).length,
);
