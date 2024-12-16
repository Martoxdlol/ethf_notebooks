import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:notebooks_app/models/checkout.dart';
import 'package:notebooks_app/services/auth.dart';

class User {
  final int id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}

class NotebooksApi {
  Uri buildUri(String path) {
    return Uri(
      host: AuthProvider.server.host,
      port: AuthProvider.server.port,
      scheme: AuthProvider.server.scheme,
      userInfo: AuthProvider.server.userInfo,
      path: '/api$path',
    );
  }

  Future<Map<String, dynamic>> fetchApi(String path,
      {bool post = false, dynamic body}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ${AuthProvider.instance.token}',
    };

    if (AuthProvider.instance.token == null) {
      headers.remove('Authorization');
    }

    if (post) {
      return jsonDecode(
        (await http.post(
          buildUri(path),
          body: jsonEncode(post),
          headers: headers,
        ))
            .body,
      );
    } else {
      return jsonDecode(
        (await http.get(
          buildUri(path),
          headers: headers,
        ))
            .body,
      );
    }
  }

  Future<List<User>> fetchUsers() async {
    final data = await fetchApi('/users');
    return (data['rows'] as List).map((e) => User.fromJson(e)).toList();
  }

  Future<CheckoutItemDetails?> fetchDetails(String tag) async {
    final data = await fetchApi('/assets/$tag');

    if (data['error'] != null) {
      return null;
    }

    return CheckoutItemDetails.fromJson(data);
  }

  Future<void> checkoutItems(
    List<CheckoutItem> items, {
    required int responsible,
    required String? user,
    required DateTime expected_checkin,
  }) async {
    await fetchApi('/checkout', post: true, body: {
      'assets': items.map((e) => e.tag).toList(),
      responsible: responsible,
      user: user,
      expected_checkin: expected_checkin.toIso8601String(),
    });
  }

  static final instance = NotebooksApi();
}
