import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'tracking_screen.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final _codeController = TextEditingController(text: 'MOB-001');
  final _driverController = TextEditingController(text: 'Haydovchi');
  final _serverController = TextEditingController(text: 'http://192.168.217.217:8000');
  String _selectedType = 'service_car';
  bool _testing = false;
  bool? _connectionOk;

  final _vehicleTypes = <String, String>{
    'service_car': 'Xizmat avtomobili',
    'tractor': 'Traktor',
    'utility_truck': 'Yuk mashinasi',
    'municipal_vehicle': 'Kommunal transport',
    'water_tanker': "Sug'orish mashinasi",
    'loader': 'Ekskovator',
  };

  final _typeEmoji = <String, String>{
    'service_car': '🚗',
    'tractor': '🚜',
    'utility_truck': '🚛',
    'municipal_vehicle': '🚐',
    'water_tanker': '💧',
    'loader': '🏗️',
  };

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _codeController.text = prefs.getString('vehicle_code') ?? 'MOB-001';
      _driverController.text = prefs.getString('driver_name') ?? 'Haydovchi';
      _serverController.text = prefs.getString('server_url') ?? 'http://192.168.217.217:8000';
      _selectedType = prefs.getString('vehicle_type') ?? 'service_car';
    });
  }

  Future<void> _savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('vehicle_code', _codeController.text);
    await prefs.setString('driver_name', _driverController.text);
    await prefs.setString('server_url', _serverController.text);
    await prefs.setString('vehicle_type', _selectedType);
  }

  Future<void> _testConnection() async {
    setState(() {
      _testing = true;
      _connectionOk = null;
    });

    final api = ApiService(_serverController.text.trim());
    final ok = await api.testConnection();

    setState(() {
      _testing = false;
      _connectionOk = ok;
    });
  }

  void _start() async {
    await _savePrefs();

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => TrackingScreen(
          serverUrl: _serverController.text.trim(),
          vehicleCode: _codeController.text.trim(),
          vehicleType: _selectedType,
          driverName: _driverController.text.trim(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _codeController.dispose();
    _driverController.dispose();
    _serverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // Header
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text('📱', style: TextStyle(fontSize: 40)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Haydovchi Ilovasi',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'GPS orqali transport sifatida ishlash',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Server URL
              const Text('Server manzili', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _serverController,
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'http://192.168.217.217:8000',
                        prefixIcon: Icon(Icons.dns, color: AppColors.textSecondary, size: 20),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _testing ? null : _testConnection,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _connectionOk == true
                            ? AppColors.success
                            : _connectionOk == false
                                ? AppColors.danger
                                : AppColors.bgCardLight,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _testing
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Icon(
                              _connectionOk == true ? Icons.check : _connectionOk == false ? Icons.close : Icons.wifi_find,
                              size: 20,
                            ),
                    ),
                  ),
                ],
              ),
              if (_connectionOk != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    _connectionOk! ? 'Ulanish muvaffaqiyatli!' : 'Server topilmadi',
                    style: TextStyle(
                      color: _connectionOk! ? AppColors.success : AppColors.danger,
                      fontSize: 12,
                    ),
                  ),
                ),
              const SizedBox(height: 20),

              // Vehicle code
              const Text('Transport kodi', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: _codeController,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'MOB-001',
                  prefixIcon: Icon(Icons.qr_code, color: AppColors.textSecondary, size: 20),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
              ),
              const SizedBox(height: 20),

              // Driver name
              const Text('Haydovchi ismi', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: _driverController,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Ism Familiya',
                  prefixIcon: Icon(Icons.person, color: AppColors.textSecondary, size: 20),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
              ),
              const SizedBox(height: 20),

              // Vehicle type
              const Text('Transport turi', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _vehicleTypes.entries.map((e) {
                  final selected = _selectedType == e.key;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedType = e.key),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primary.withValues(alpha: 0.2) : AppColors.bgCardLight,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected ? AppColors.primary : AppColors.border,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(_typeEmoji[e.key] ?? '🚗', style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Text(
                            e.value,
                            style: TextStyle(
                              color: selected ? AppColors.primary : AppColors.textSecondary,
                              fontSize: 12,
                              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),

              // Start button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _start,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.play_arrow, size: 22),
                      SizedBox(width: 8),
                      Text('Kuzatishni boshlash'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'GPS joylashuv ma\'lumotlari serverga yuboriladi',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
