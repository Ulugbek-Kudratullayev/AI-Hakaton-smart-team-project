import 'package:flutter_test/flutter_test.dart';
import 'package:transport_map/main.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TransportMapApp());
    expect(find.text('Harita'), findsOneWidget);
  });
}
