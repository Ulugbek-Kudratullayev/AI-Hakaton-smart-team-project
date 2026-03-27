import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/main.dart';

void main() {
  testWidgets('App renders', (WidgetTester tester) async {
    await tester.pumpWidget(const DriverApp());
    expect(find.text('Haydovchi Ilovasi'), findsOneWidget);
  });
}
