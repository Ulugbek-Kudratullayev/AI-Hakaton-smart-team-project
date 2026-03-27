import { Vehicle, Task, Alert, Maintenance, ActivityLog, KPIData } from '@/types';

const departments = [
  'Qishloq xo\'jaligi bo\'limi',
  'Kommunal xo\'jalik bo\'limi',
  'Yo\'l-transport bo\'limi',
  'Ekologiya bo\'limi',
  'Qurilish bo\'limi',
];

const drivers = [
  'Abdullayev Jasur', 'Karimov Behruz', 'Toshmatov Sardor', 'Nazarov Dilshod',
  'Umarov Sherzod', 'Rahimov Otabek', 'Xasanov Jamshid', 'Aliyev Nodir',
  'Sultonov Firdavs', 'Mirzayev Alisher', 'Ergashev Bobur', 'Xolmatov Aziz',
  'Raxmatullayev Sarvarbek', 'Yusupov Temur', 'Qodirov Anvar', 'Tursunov Ulug\'bek',
  'Muminov Ilhom', 'Saidov Farrux', 'Ismoilov Bahrom', 'Hakimov Rustam',
  'Ruziyev Doston', 'Boymatov Sanjar', 'Normatov Zafar', 'Ashrapov Eldor',
  'Qosimov Muzaffar',
];

const vehicleModels: Record<string, string[]> = {
  traktor: ['MX U Profi', 'Belarus 82.1', 'John Deere 6B', 'Case IH Farmall', 'Claas Arion 420'],
  yuk_mashinasi: ['ISUZU NPR', 'MAN TGS', 'KamAZ 65115', 'Howo A7', 'Shacman X3000'],
  xizmat_avtomobili: ['Chevrolet Cobalt', 'Chevrolet Lacetti', 'Hyundai Accent', 'Kia Rio', 'Chevrolet Tracker'],
  avtobus: ['Isuzu SAZ', 'Yutong ZK6116H', 'PAZ 32054', 'SAZ NP37', 'Ankai HFF6110'],
  ekskovator: ['JCB 3CX', 'Cat 320', 'Komatsu PC200', 'Hyundai HX220', 'Volvo EC210'],
  "sug'orish_mashinasi": ['KamAZ Suv', 'ZIL Sugorish', 'MAZ Suv tashish', 'GAZ Suv', 'Howo Suv'],
};

const regions = ['Farg\'ona'];
const districts: Record<string, string[]> = {
  'Farg\'ona': ['Markaz', 'Shimoliy tuman', 'Janubiy tuman', 'Sharqiy tuman', 'G\'arbiy tuman', 'Shimoliy-sharq', 'Janubiy-g\'arb'],
};

const vehicleTypes: Array<{ type: Vehicle['type']; prefix: string }> = [
  { type: 'traktor', prefix: 'TR' },
  { type: 'yuk_mashinasi', prefix: 'YM' },
  { type: 'xizmat_avtomobili', prefix: 'XA' },
  { type: 'avtobus', prefix: 'AV' },
  { type: 'ekskovator', prefix: 'EK' },
  { type: "sug'orish_mashinasi", prefix: 'SM' },
];

const statuses: Vehicle['status'][] = ['faol', 'faol', 'faol', 'kutish', 'ta\'mirda', 'yo\'lda', 'yo\'lda'];

// Center around Farg'ona shahri
const baseLat = 40.384;
const baseLng = 71.789;

// Deterministic pseudo-random for consistent SSR/client rendering
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const vehicles: Vehicle[] = Array.from({ length: 25 }, (_, i) => {
  const vType = vehicleTypes[i % vehicleTypes.length];
  const typeKey = vType.type === "sug'orish_mashinasi" ? "sug'orish_mashinasi" : vType.type;
  const models = vehicleModels[typeKey] || vehicleModels['xizmat_avtomobili'];
  const r = (offset: number) => seededRandom(i * 100 + offset);
  return {
    id: `v-${String(i + 1).padStart(3, '0')}`,
    internal_code: `${vType.prefix}-${String(i + 1).padStart(3, '0')}`,
    plate_number: `01 ${String(100 + i).slice(0, 3)} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 5) % 26))}${String.fromCharCode(65 + ((i + 10) % 26))}`,
    type: vType.type,
    department: departments[i % departments.length],
    status: statuses[i % statuses.length],
    assigned_driver: drivers[i % drivers.length],
    current_location: {
      lat: baseLat + (r(1) - 0.5) * 0.04,
      lng: baseLng + (r(2) - 0.5) * 0.06,
    },
    odometer: Math.floor(15000 + r(3) * 120000),
    efficiency_score: Math.floor(55 + r(4) * 45),
    maintenance_risk: Math.floor(r(5) * 100),
    anomaly_count: Math.floor(r(6) * 8),
    fuel_level: Math.floor(15 + r(7) * 85),
    last_service: `2026-0${1 + Math.floor(r(8) * 2)}-${String(10 + Math.floor(r(9) * 18)).padStart(2, '0')}`,
    next_service: `2026-0${3 + Math.floor(r(10) * 2)}-${String(1 + Math.floor(r(11) * 28)).padStart(2, '0')}`,
    year: 2018 + Math.floor(r(12) * 7),
    model: models[i % models.length],
  };
});

export const tasks: Task[] = [
  {
    id: 't-001', title: 'Bug\'doy dalasini haydash', type: 'Qishloq xo\'jalik', priority: 'yuqori',
    region: 'Farg\'ona', district: 'Shimoliy tuman', scheduled_start: '2026-03-27T08:00:00',
    scheduled_end: '2026-03-27T17:00:00', status: 'rejalashtirilgan', assigned_vehicle: 'v-001',
    assigned_vehicle_code: 'TR-001', description: '50 gektar bug\'doy dalasini haydash kerak',
    created_at: '2026-03-25T10:00:00', lat: 40.396, lng: 71.810,
    recommended_vehicles: [
      { vehicle_id: 'v-001', vehicle_code: 'TR-001', score: 95, reason: 'Eng yaqin joylashuv, yuqori samaradorlik' },
      { vehicle_id: 'v-007', vehicle_code: 'TR-007', score: 88, reason: 'Yaxshi texnik holat, tajribali haydovchi' },
      { vehicle_id: 'v-013', vehicle_code: 'TR-013', score: 82, reason: 'Bo\'sh holat, o\'rtacha samaradorlik' },
    ],
  },
  {
    id: 't-002', title: 'Ko\'cha tozalash xizmati', type: 'Kommunal', priority: 'o\'rta',
    region: 'Farg\'ona', district: 'Markaz', scheduled_start: '2026-03-27T06:00:00',
    scheduled_end: '2026-03-27T12:00:00', status: 'jarayonda', assigned_vehicle: 'v-002',
    assigned_vehicle_code: 'YM-002', description: 'Asosiy ko\'chalarni tozalash va chiqindilarni olib ketish',
    created_at: '2026-03-25T09:00:00', lat: 40.385, lng: 71.784,
    recommended_vehicles: [
      { vehicle_id: 'v-002', vehicle_code: 'YM-002', score: 92, reason: 'Tegishli tur, yaqin hudud' },
      { vehicle_id: 'v-008', vehicle_code: 'YM-008', score: 85, reason: 'Zaxira variant, yaxshi holat' },
      { vehicle_id: 'v-014', vehicle_code: 'YM-014', score: 78, reason: 'Mavjud, o\'rtacha masofa' },
    ],
  },
  {
    id: 't-003', title: 'Yo\'l ta\'mirlash ishlari', type: 'Qurilish', priority: 'yuqori',
    region: 'Farg\'ona', district: 'Janubiy tuman', scheduled_start: '2026-03-28T07:00:00',
    scheduled_end: '2026-03-28T18:00:00', status: 'rejalashtirilgan', assigned_vehicle: null,
    assigned_vehicle_code: null, description: 'Janubiy tumandagi 5 km yo\'l qoplamasi ta\'mirlash',
    created_at: '2026-03-25T14:00:00', lat: 40.368, lng: 71.778,
    recommended_vehicles: [
      { vehicle_id: 'v-005', vehicle_code: 'EK-005', score: 90, reason: 'Ekskovator turi mos, yaqin' },
      { vehicle_id: 'v-011', vehicle_code: 'EK-011', score: 84, reason: 'Yaxshi ishlash ko\'rsatkichi' },
      { vehicle_id: 'v-017', vehicle_code: 'EK-017', score: 76, reason: 'Mavjud, kutish holatida' },
    ],
  },
  {
    id: 't-004', title: 'Sugorish tizimini tekshirish', type: 'Qishloq xo\'jalik', priority: 'o\'rta',
    region: 'Farg\'ona', district: 'Sharqiy tuman', scheduled_start: '2026-03-27T09:00:00',
    scheduled_end: '2026-03-27T15:00:00', status: 'bajarildi', assigned_vehicle: 'v-006',
    assigned_vehicle_code: 'SM-006', description: 'Sugorish kanallarini tekshirish va ta\'mirlash',
    created_at: '2026-03-24T11:00:00', lat: 40.382, lng: 71.812,
    recommended_vehicles: [
      { vehicle_id: 'v-006', vehicle_code: 'SM-006', score: 94, reason: 'Sug\'orish mashinasi, eng mos' },
      { vehicle_id: 'v-012', vehicle_code: 'SM-012', score: 87, reason: 'Zaxira variant' },
      { vehicle_id: 'v-018', vehicle_code: 'SM-018', score: 80, reason: 'Mavjud, yaxshi holat' },
    ],
  },
  {
    id: 't-005', title: 'Maktab marshuti', type: 'Transport', priority: 'yuqori',
    region: 'Farg\'ona', district: 'Markaz', scheduled_start: '2026-03-27T07:00:00',
    scheduled_end: '2026-03-27T08:30:00', status: 'jarayonda', assigned_vehicle: 'v-004',
    assigned_vehicle_code: 'AV-004', description: 'O\'quvchilarni maktabga yetkazish marshruti',
    created_at: '2026-03-26T06:00:00', lat: 40.388, lng: 71.792,
    recommended_vehicles: [
      { vehicle_id: 'v-004', vehicle_code: 'AV-004', score: 96, reason: 'Avtobus turi, eng mos marshrut' },
      { vehicle_id: 'v-010', vehicle_code: 'AV-010', score: 89, reason: 'Zaxira avtobus, yaxshi holat' },
      { vehicle_id: 'v-016', vehicle_code: 'AV-016', score: 81, reason: 'Mavjud, o\'rtacha holat' },
    ],
  },
  {
    id: 't-006', title: 'Paxta terimiga tayyorgarlik', type: 'Qishloq xo\'jalik', priority: 'past',
    region: 'Farg\'ona', district: 'G\'arbiy tuman', scheduled_start: '2026-03-29T08:00:00',
    scheduled_end: '2026-03-29T16:00:00', status: 'rejalashtirilgan', assigned_vehicle: null,
    assigned_vehicle_code: null, description: 'Dalalarni paxta terimi uchun tayyorlash',
    created_at: '2026-03-25T16:00:00', lat: 40.384, lng: 71.760,
    recommended_vehicles: [
      { vehicle_id: 'v-019', vehicle_code: 'TR-019', score: 91, reason: 'Eng yaqin traktor, bo\'sh' },
      { vehicle_id: 'v-025', vehicle_code: 'TR-025', score: 85, reason: 'Yaxshi samaradorlik' },
      { vehicle_id: 'v-001', vehicle_code: 'TR-001', score: 72, reason: 'Mavjud, lekin band bo\'lishi mumkin' },
    ],
  },
  {
    id: 't-007', title: 'Kommunal avariya chiqish', type: 'Kommunal', priority: 'yuqori',
    region: 'Farg\'ona', district: 'Shimoliy tuman', scheduled_start: '2026-03-26T14:00:00',
    scheduled_end: '2026-03-26T18:00:00', status: 'jarayonda', assigned_vehicle: 'v-003',
    assigned_vehicle_code: 'XA-003', description: 'Suv quvuri portlashi, tezkor ta\'mirlash',
    created_at: '2026-03-26T13:30:00', lat: 40.394, lng: 71.772,
    recommended_vehicles: [
      { vehicle_id: 'v-003', vehicle_code: 'XA-003', score: 93, reason: 'Eng yaqin xizmat avtomobili' },
      { vehicle_id: 'v-009', vehicle_code: 'XA-009', score: 86, reason: 'Zaxira, yaxshi holat' },
      { vehicle_id: 'v-015', vehicle_code: 'XA-015', score: 79, reason: 'Mavjud variant' },
    ],
  },
  {
    id: 't-008', title: 'Ekologik monitoring', type: 'Ekologiya', priority: 'o\'rta',
    region: 'Farg\'ona', district: 'Janubiy-g\'arb', scheduled_start: '2026-03-28T09:00:00',
    scheduled_end: '2026-03-28T14:00:00', status: 'rejalashtirilgan', assigned_vehicle: null,
    assigned_vehicle_code: null, description: 'Hududdagi ekologik holatni tekshirish va hisobot',
    created_at: '2026-03-26T10:00:00', lat: 40.370, lng: 71.762,
    recommended_vehicles: [
      { vehicle_id: 'v-003', vehicle_code: 'XA-003', score: 88, reason: 'Xizmat avtomobili, qulay' },
      { vehicle_id: 'v-009', vehicle_code: 'XA-009', score: 82, reason: 'Yaxshi yoqilg\'i samaradorligi' },
      { vehicle_id: 'v-021', vehicle_code: 'XA-021', score: 75, reason: 'Mavjud, yaqin hudud' },
    ],
  },
];

export const alerts: Alert[] = [
  {
    id: 'a-001', type: 'yoqilgi_anomaliya', severity: 'yuqori', vehicle_id: 'v-002',
    vehicle_code: 'YM-002', message: 'Yoqilg\'i sarfi me\'yoridan 40% oshgan',
    created_at: '2026-03-26T15:30:00', status: 'yangi',
    details: 'So\'nggi 3 soat ichida yoqilg\'i sarfi keskin oshgan. AI tahlili natijasida haydovchi xulq-atvori yoki dvigatel muammosi aniqlangan.',
  },
  {
    id: 'a-002', type: 'texnik_xizmat', severity: 'yuqori', vehicle_id: 'v-007',
    vehicle_code: 'TR-007', message: 'Texnik xizmat muddati 5 kun oldin o\'tgan',
    created_at: '2026-03-26T09:00:00', status: 'yangi',
    details: 'Rejalashtirilgan moy almashtirish va filtr tozalash muddati o\'tib ketgan. Zudlik bilan xizmat ko\'rsatish talab qilinadi.',
  },
  {
    id: 'a-003', type: 'ortiqcha_kutish', severity: 'o\'rta', vehicle_id: 'v-015',
    vehicle_code: 'XA-015', message: 'Avtomobil 4 soatdan ortiq harakatsiz',
    created_at: '2026-03-26T14:00:00', status: 'ko\'rildi',
    details: 'Dvigatel yoqilgan holda kutish vaqti me\'yordan oshgan. Yoqilg\'i sarfi ortishi kuzatilmoqda.',
  },
  {
    id: 'a-004', type: 'tezlik_buzilishi', severity: 'yuqori', vehicle_id: 'v-004',
    vehicle_code: 'AV-004', message: 'Tezlik chegarasidan oshish (95 km/s)',
    created_at: '2026-03-26T11:20:00', status: 'yangi',
    details: 'Avtobus belgilangan 60 km/s tezlik chegarasidan oshib ketgan. Yo\'lovchilar xavfsizligi uchun xavf.',
  },
  {
    id: 'a-005', type: 'yoqilgi_anomaliya', severity: 'o\'rta', vehicle_id: 'v-010',
    vehicle_code: 'AV-010', message: 'Yoqilg\'i darajasi kutilmagan tarzda kamaydi',
    created_at: '2026-03-26T08:45:00', status: 'ko\'rildi',
    details: 'Yoqilg\'i darajasi 30 daqiqa ichida 25% kamaygan. Oqish yoki o\'g\'irlik ehtimoli.',
  },
  {
    id: 'a-006', type: 'marshrut_buzilishi', severity: 'past', vehicle_id: 'v-003',
    vehicle_code: 'XA-003', message: 'Belgilangan marshrutdan chetga chiqish',
    created_at: '2026-03-26T13:15:00', status: 'hal_qilindi',
    details: 'Avtomobil belgilangan marshrutdan 3 km chetga chiqgan. Haydovchi tushuntirishi kerak.',
  },
  {
    id: 'a-007', type: 'texnik_xizmat', severity: 'o\'rta', vehicle_id: 'v-019',
    vehicle_code: 'TR-019', message: 'Shina bosimi past',
    created_at: '2026-03-26T07:30:00', status: 'yangi',
    details: 'Old chap shina bosimi me\'yordan 30% past. Shinani tekshirish va pompalash kerak.',
  },
  {
    id: 'a-008', type: 'ortiqcha_kutish', severity: 'past', vehicle_id: 'v-022',
    vehicle_code: 'YM-022', message: 'Yuk mashinasi 2 soat kutish holatida',
    created_at: '2026-03-26T16:00:00', status: 'yangi',
    details: 'Yuk mashinasi belgilangan manzilda 2 soatdan ortiq kutib turgan. Vazifani tekshirish kerak.',
  },
  {
    id: 'a-009', type: 'yoqilgi_anomaliya', severity: 'yuqori', vehicle_id: 'v-014',
    vehicle_code: 'YM-014', message: 'G\'ayritabiiy yoqilg\'i to\'ldirish hajmi',
    created_at: '2026-03-25T18:20:00', status: 'ko\'rildi',
    details: 'Yoqilg\'i to\'ldirish hajmi bak sig\'imidan 20% ko\'p ko\'rsatilgan. Ma\'lumotlar noto\'g\'riligi yoki firibgarlik ehtimoli.',
  },
  {
    id: 'a-010', type: 'tezlik_buzilishi', severity: 'o\'rta', vehicle_id: 'v-008',
    vehicle_code: 'YM-008', message: 'Tezlik chegarasidan oshish (78 km/s)',
    created_at: '2026-03-25T16:45:00', status: 'hal_qilindi',
    details: 'Yuk mashinasi shahar ichida belgilangan tezlik chegarasidan oshgan.',
  },
];

export const maintenanceRecords: Maintenance[] = [
  {
    id: 'm-001', vehicle_id: 'v-007', vehicle_code: 'TR-007', plate_number: '01 107 HMR',
    service_type: 'Moy almashtirish', due_date: '2026-03-21', completed_date: null,
    risk_score: 92, status: 'muddati_o\'tgan', mechanic: 'Xolmatov Ravshan', notes: 'Dvigatel moyi va filtr almashtirish', cost: null,
  },
  {
    id: 'm-002', vehicle_id: 'v-002', vehicle_code: 'YM-002', plate_number: '01 102 BGL',
    service_type: 'Tormoz tizimi tekshiruvi', due_date: '2026-03-28', completed_date: null,
    risk_score: 78, status: 'rejalashtirilgan', mechanic: 'Saidov Anvar', notes: 'Old va orqa tormoz kolodkalarini tekshirish', cost: null,
  },
  {
    id: 'm-003', vehicle_id: 'v-015', vehicle_code: 'XA-015', plate_number: '01 115 PKZ',
    service_type: 'Shina almashtirish', due_date: '2026-03-30', completed_date: null,
    risk_score: 65, status: 'rejalashtirilgan', mechanic: 'Boymatov Kamol', notes: '4 ta shina almashtirish', cost: null,
  },
  {
    id: 'm-004', vehicle_id: 'v-001', vehicle_code: 'TR-001', plate_number: '01 101 AFJ',
    service_type: 'To\'liq diagnostika', due_date: '2026-03-15', completed_date: '2026-03-15',
    risk_score: 15, status: 'bajarildi', mechanic: 'Xolmatov Ravshan', notes: 'Barcha tizimlar tekshirildi, yaxshi holat', cost: 450000,
  },
  {
    id: 'm-005', vehicle_id: 'v-019', vehicle_code: 'TR-019', plate_number: '01 119 TYI',
    service_type: 'Shina bosimini sozlash', due_date: '2026-03-27', completed_date: null,
    risk_score: 55, status: 'kutilmoqda', mechanic: 'Ergashev Sardor', notes: 'Barcha shinalar bosimini tekshirish va sozlash', cost: null,
  },
  {
    id: 'm-006', vehicle_id: 'v-004', vehicle_code: 'AV-004', plate_number: '01 104 DIN',
    service_type: 'Dvigatel diagnostikasi', due_date: '2026-04-02', completed_date: null,
    risk_score: 42, status: 'rejalashtirilgan', mechanic: 'Saidov Anvar', notes: 'Dvigatel ishlash ko\'rsatkichlarini tekshirish', cost: null,
  },
  {
    id: 'm-007', vehicle_id: 'v-010', vehicle_code: 'AV-010', plate_number: '01 110 OTY',
    service_type: 'Yoqilg\'i tizimi', due_date: '2026-03-20', completed_date: '2026-03-20',
    risk_score: 10, status: 'bajarildi', mechanic: 'Boymatov Kamol', notes: 'Yoqilg\'i filtri va nasos tekshirildi', cost: 320000,
  },
  {
    id: 'm-008', vehicle_id: 'v-005', vehicle_code: 'EK-005', plate_number: '01 105 EJO',
    service_type: 'Gidravlika tizimi', due_date: '2026-03-25', completed_date: null,
    risk_score: 85, status: 'muddati_o\'tgan', mechanic: 'Ergashev Sardor', notes: 'Gidravlik moy va filtrlarni almashtirish', cost: null,
  },
  {
    id: 'm-009', vehicle_id: 'v-014', vehicle_code: 'YM-014', plate_number: '01 114 OEJ',
    service_type: 'Akkumulyator almashtirish', due_date: '2026-04-05', completed_date: null,
    risk_score: 30, status: 'rejalashtirilgan', mechanic: 'Xolmatov Ravshan', notes: 'Zaryad saqlash qobiliyati kamaygan', cost: null,
  },
  {
    id: 'm-010', vehicle_id: 'v-008', vehicle_code: 'YM-008', plate_number: '01 108 CNX',
    service_type: 'To\'liq texnik xizmat', due_date: '2026-03-18', completed_date: '2026-03-18',
    risk_score: 8, status: 'bajarildi', mechanic: 'Saidov Anvar', notes: 'Moy, filtr, shina, tormoz — barchasi tekshirildi', cost: 780000,
  },
];

export const activityLogs: ActivityLog[] = [
  { id: 'l-001', type: 'task', message: 'Yangi vazifa yaratildi: Bug\'doy dalasini haydash', timestamp: '2026-03-26T17:30:00', vehicle_code: 'TR-001' },
  { id: 'l-002', type: 'alert', message: 'Yoqilg\'i anomaliyasi aniqlandi', timestamp: '2026-03-26T15:30:00', vehicle_code: 'YM-002' },
  { id: 'l-003', type: 'maintenance', message: 'Texnik xizmat rejalashtirildi', timestamp: '2026-03-26T14:20:00', vehicle_code: 'AV-004' },
  { id: 'l-004', type: 'vehicle', message: 'Avtomobil marshruti yangilandi', timestamp: '2026-03-26T13:45:00', vehicle_code: 'XA-003' },
  { id: 'l-005', type: 'alert', message: 'Tezlik chegarasidan oshish qayd etildi', timestamp: '2026-03-26T11:20:00', vehicle_code: 'AV-004' },
  { id: 'l-006', type: 'task', message: 'Vazifa bajarildi: Sugorish tizimini tekshirish', timestamp: '2026-03-26T10:00:00', vehicle_code: 'SM-006' },
  { id: 'l-007', type: 'maintenance', message: 'Texnik xizmat yakunlandi', timestamp: '2026-03-26T09:30:00', vehicle_code: 'YM-008' },
  { id: 'l-008', type: 'vehicle', message: 'Yangi haydovchi biriktirildi', timestamp: '2026-03-26T08:15:00', vehicle_code: 'TR-013' },
  { id: 'l-009', type: 'alert', message: 'Ortiqcha kutish vaqti aniqlandi', timestamp: '2026-03-26T07:45:00', vehicle_code: 'XA-015' },
  { id: 'l-010', type: 'task', message: 'Vazifa boshlandi: Ko\'cha tozalash xizmati', timestamp: '2026-03-26T06:00:00', vehicle_code: 'YM-002' },
];

export const kpiData: KPIData = {
  total_vehicles: 25,
  active_vehicles: 14,
  idle_vehicles: 4,
  in_service: 3,
  average_efficiency: 78,
  anomaly_alerts: alerts.filter(a => a.status === 'yangi').length,
};

export const efficiencyTrend = [
  { name: 'Yan', value: 72 },
  { name: 'Fev', value: 75 },
  { name: 'Mar 1-h', value: 74 },
  { name: 'Mar 2-h', value: 78 },
  { name: 'Mar 3-h', value: 80 },
  { name: 'Mar 4-h', value: 78 },
];

export const taskCompletionTrend = [
  { name: 'Yan', completed: 42, total: 50 },
  { name: 'Fev', completed: 38, total: 45 },
  { name: 'Mar 1-h', completed: 12, total: 15 },
  { name: 'Mar 2-h', completed: 14, total: 16 },
  { name: 'Mar 3-h', completed: 11, total: 14 },
  { name: 'Mar 4-h', completed: 8, total: 12 },
];

export const maintenanceRiskDistribution = [
  { name: 'Past (0-30)', value: 8, fill: '#10b981' },
  { name: 'O\'rta (31-60)', value: 7, fill: '#f59e0b' },
  { name: 'Yuqori (61-80)', value: 6, fill: '#f97316' },
  { name: 'Juda yuqori (81+)', value: 4, fill: '#ef4444' },
];

export const vehiclesByType = [
  { name: 'Traktor', value: 5, fill: '#4f46e5' },
  { name: 'Yuk mashinasi', value: 5, fill: '#0ea5e9' },
  { name: 'Xizmat avto', value: 5, fill: '#10b981' },
  { name: 'Avtobus', value: 4, fill: '#f59e0b' },
  { name: 'Ekskovator', value: 3, fill: '#8b5cf6' },
  { name: 'Sug\'orish', value: 3, fill: '#06b6d4' },
];

export const vehiclesByDepartment = [
  { name: 'Qishloq xo\'jalik', value: 7 },
  { name: 'Kommunal', value: 6 },
  { name: 'Yo\'l-transport', value: 5 },
  { name: 'Ekologiya', value: 4 },
  { name: 'Qurilish', value: 3 },
];

export const fuelUsageByDepartment = [
  { name: 'Qishloq xo\'jalik', usage: 4500, budget: 5000 },
  { name: 'Kommunal', usage: 3200, budget: 3500 },
  { name: 'Yo\'l-transport', usage: 2800, budget: 3000 },
  { name: 'Ekologiya', usage: 1200, budget: 1500 },
  { name: 'Qurilish', usage: 2100, budget: 2500 },
];

export const vehicleUtilization = [
  { name: 'Dush', rate: 85 },
  { name: 'Sesh', rate: 78 },
  { name: 'Chor', rate: 82 },
  { name: 'Pay', rate: 90 },
  { name: 'Jum', rate: 75 },
  { name: 'Shan', rate: 45 },
  { name: 'Yak', rate: 20 },
];

export const anomalyDistribution = [
  { name: 'Yoqilg\'i', value: 12, fill: '#ef4444' },
  { name: 'Tezlik', value: 8, fill: '#f97316' },
  { name: 'Kutish', value: 15, fill: '#f59e0b' },
  { name: 'Marshrut', value: 5, fill: '#8b5cf6' },
  { name: 'Texnik', value: 10, fill: '#0ea5e9' },
];

// Helper functions
export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find(v => v.id === id);
}

export function getVehicleTypeLabel(type: Vehicle['type']): string {
  const labels: Record<string, string> = {
    traktor: 'Traktor',
    yuk_mashinasi: 'Yuk mashinasi',
    xizmat_avtomobili: 'Xizmat avtomobili',
    avtobus: 'Avtobus',
    ekskovator: 'Ekskovator',
    "sug'orish_mashinasi": 'Sug\'orish mashinasi',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    faol: 'Faol',
    kutish: 'Kutish',
    "ta'mirda": 'Ta\'mirda',
    "yo'lda": 'Yo\'lda',
    nomalum: 'Noma\'lum',
    rejalashtirilgan: 'Rejalashtirilgan',
    jarayonda: 'Jarayonda',
    bajarildi: 'Bajarildi',
    bekor_qilindi: 'Bekor qilindi',
    kutilmoqda: 'Kutilmoqda',
    "muddati_o'tgan": 'Muddati o\'tgan',
    yangi: 'Yangi',
    "ko'rildi": 'Ko\'rildi',
    "hal_qilindi": 'Hal qilindi',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    faol: 'badge-success',
    kutish: 'badge-warning',
    "ta'mirda": 'badge-danger',
    "yo'lda": 'badge-info',
    nomalum: 'badge-neutral',
    rejalashtirilgan: 'badge-info',
    jarayonda: 'badge-warning',
    bajarildi: 'badge-success',
    bekor_qilindi: 'badge-neutral',
    kutilmoqda: 'badge-warning',
    "muddati_o'tgan": 'badge-danger',
    yangi: 'badge-danger',
    "ko'rildi": 'badge-warning',
    "hal_qilindi": 'badge-success',
    yuqori: 'badge-danger',
    "o'rta": 'badge-warning',
    past: 'badge-info',
  };
  return colors[status] || 'badge-neutral';
}

export function getAlertTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    yoqilgi_anomaliya: 'Yoqilg\'i anomaliyasi',
    ortiqcha_kutish: 'Ortiqcha kutish',
    texnik_xizmat: 'Texnik xizmat',
    tezlik_buzilishi: 'Tezlik buzilishi',
    marshrut_buzilishi: 'Marshrut buzilishi',
  };
  return labels[type] || type;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  return num.toLocaleString('uz-UZ');
}
