import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:notebooks_app/providers/auth_wrapper.dart';
import 'package:notebooks_app/services/auth.dart';
import 'package:notebooks_app/services/links.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // ignore: unused_local_variable
  final links = LinksProvider(
    onAuthorizationCodeReceived: (code, server) {
      AuthProvider.instance.handleCode(code, server);
    },
  );

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ETHF Notebooks',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}
