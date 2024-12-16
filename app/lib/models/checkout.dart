import 'package:notebooks_app/services/api.dart';

class CheckoutItem {
  final String tag;

  late final Future<CheckoutItemDetails?> details;

  CheckoutItem({
    required this.tag,
  }) {
    details = NotebooksApi.instance.fetchDetails(tag);
  }
}

class CheckoutItemDetails {
  final String tag;
  final String? model;
  final String? serial;
  final double? battery;
  final String? user;

  CheckoutItemDetails({
    required this.tag,
    required this.model,
    required this.serial,
    required this.battery,
    required this.user,
  });

  factory CheckoutItemDetails.fromJson(Map<String, dynamic> json) {
    final modelJson = json['model'] as Map<String, dynamic>?;

    return CheckoutItemDetails(
      tag: json['asset_tag'],
      model: modelJson != null ? modelJson['name'] : null,
      serial: json['serial'],
      battery: json['battery'],
      user: json['user'],
    );
  }
}
