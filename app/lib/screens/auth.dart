import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:web/web.dart' as web;

final uri = Uri.parse('https://notebooks.henryford.edu.ar/login/mobile');

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            if (kIsWeb) {
              web.window.open(
                '/api/auth/signin/microsoft-entra-id?returnTo=/app',
                '_self',
              );
            } else {
              launchUrl(uri);
            }
          },
          child: Text('Ingresar'),
        ),
      ),
    );
  }
}
