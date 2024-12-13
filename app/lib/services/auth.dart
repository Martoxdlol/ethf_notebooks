import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:http/http.dart' as http;

enum AuthState { authenticated, unauthenticated, offline, loading }

class AuthProvider {
  final StreamController<AuthState> _stream = StreamController.broadcast();

  AuthState state = AuthState.loading;

  String? token;

  Uri server = Uri.parse('https://notebooks.henryford.edu.ar');

  Future<void> saveToken(String token) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    await prefs.setString('access_token', token);
  }

  Future<String?> getToken() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    return prefs.getString('access_token');
  }

  Future<void> deleteToken() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    await prefs.remove('access_token');
  }

  Future<void> handleCode(String code, Uri? server) async {
    _updateState(AuthState.loading);

    Uri baseUrl = (server ?? this.server);

    final url = Uri(
      scheme: baseUrl.scheme,
      host: baseUrl.host,
      port: baseUrl.port,
      path: '/api/auth/mobile/callback',
      query: 'code=$code',
      userInfo: baseUrl.userInfo,
    );

    try {
      final response = await http.get(url);
      final text = response.body;

      if (response.statusCode != 200) {
        throw Exception('Failed to authenticate: $text');
      }

      if (kDebugMode) {
        print('Authenticated: $text');
      }

      await saveToken(text);
    } catch (e) {
      if (kDebugMode) {
        print('Failed to authenticate: $e');
      }
    }

    await update();
  }

  void _updateState(AuthState state) {
    if (this.state == state) {
      return;
    }
    print('Updating state to $state from ${this.state}');

    this.state = state;
    _stream.sink.add(state);
  }

  Future<void> update() async {
    token = await getToken();

    if (token != null) {
      _updateState(AuthState.authenticated);
    } else {
      _updateState(AuthState.unauthenticated);
    }
  }

  Future<void> logout() async {
    await deleteToken();
    await update();
  }

  Stream<AuthState> get stream => _stream.stream;

  static final instance = AuthProvider();
}
