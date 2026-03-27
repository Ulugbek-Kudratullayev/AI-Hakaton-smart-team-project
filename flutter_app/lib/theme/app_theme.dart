import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF3b82f6);
  static const primaryDark = Color(0xFF1e40af);
  static const success = Color(0xFF10b981);
  static const warning = Color(0xFFf59e0b);
  static const danger = Color(0xFFef4444);
  static const info = Color(0xFF0ea5e9);
  static const purple = Color(0xFF8b5cf6);

  static const bgDark = Color(0xFF0f172a);
  static const bgCard = Color(0xFF1e293b);
  static const bgCardLight = Color(0xFF334155);
  static const textPrimary = Color(0xFFf1f5f9);
  static const textSecondary = Color(0xFF94a3b8);
  static const border = Color(0xFF475569);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgDark,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.info,
        surface: AppColors.bgCard,
        error: AppColors.danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgCard,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.border, width: 0.5),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgCard,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.bgCardLight,
        selectedColor: AppColors.primary.withValues(alpha: 0.3),
        labelStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
        side: const BorderSide(color: AppColors.border, width: 0.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      ),
    );
  }
}

Color getStatusColor(String status) {
  switch (status) {
    case 'faol':
      return AppColors.success;
    case 'kutish':
      return AppColors.warning;
    case 'tamirda':
      return AppColors.danger;
    case 'yolda':
      return AppColors.info;
    default:
      return AppColors.textSecondary;
  }
}

Color getPriorityColor(String priority) {
  switch (priority) {
    case 'yuqori':
      return AppColors.danger;
    case 'orta':
      return AppColors.warning;
    case 'past':
      return AppColors.info;
    default:
      return AppColors.textSecondary;
  }
}

Color getSeverityColor(String severity) {
  switch (severity) {
    case 'yuqori':
      return AppColors.danger;
    case 'orta':
      return AppColors.warning;
    case 'past':
      return AppColors.info;
    default:
      return AppColors.textSecondary;
  }
}
