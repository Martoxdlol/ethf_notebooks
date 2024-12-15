import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:notebooks_app/screens/auth.dart';
import 'package:notebooks_app/screens/home.dart';
import 'package:notebooks_app/services/auth.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:web/web.dart' as web;

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  Widget getScreen(AuthState state) {
    if (state == AuthState.authenticated) {
      return HomeScreen(title: 'ETHF Notebooks');
    } else if (state == AuthState.unauthenticated) {
      if (kIsWeb) {
        web.window.open('/api/auth/signin?returnTo=/app', '_self');
      }

      return AuthScreen();
    } else {
      return const Placeholder();
    }
  }

  late StreamSubscription sub;
  AuthState? state;

  @override
  void initState() {
    sub = AuthProvider.instance.stream.listen((state) {
      setState(() {
        this.state = state;
      });
    });

    AuthProvider.instance.update();

    super.initState();
  }

  @override
  void dispose() {
    sub.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (state == null || state == AuthState.loading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return getScreen(state!);
  }
}
