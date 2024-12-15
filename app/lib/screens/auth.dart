import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

final uri = Uri.parse('https://inventario.henryford.edu.ar/login/mobile');

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            launchUrl(uri);
          },
          child: Text('Ingresar'),
        ),
      ),
    );
  }
}
