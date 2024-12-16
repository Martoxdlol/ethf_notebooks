import 'package:flutter/material.dart';
import 'package:notebooks_app/models/checkout.dart';
import 'package:notebooks_app/scanner.dart';
import 'package:notebooks_app/views/confirm-checkout.dart';

class CheckoutView extends StatefulWidget {
  const CheckoutView({super.key});

  static void triggerCheckout(GlobalKey checkoutKey) {
    (checkoutKey.currentState as _CheckoutViewState).triggerCheckout();
  }

  @override
  State<CheckoutView> createState() => _CheckoutViewState();
}

class _CheckoutViewState extends State<CheckoutView> {
  List<CheckoutItem> items = [];

  void addItem(String tag) {
    setState(() {
      // check if exists
      if (items.any((element) => element.tag == tag)) {
        return;
      }

      items.add(CheckoutItem(tag: tag));
    });
  }

  void triggerCheckout() async {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ConfirmCheckout(
          items: items,
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    GlobalKey scannerKey = GlobalKey();

    final screenWidth = MediaQuery.of(context).size.width;

    return Column(
      mainAxisSize: MainAxisSize.max,
      children: [
        SizedBox(
          width: screenWidth,
          height: screenWidth / 1.7777,
          child: QRScanner(
            onDetect: addItem,
            key: scannerKey,
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];

              return ListTile(
                title: Text(item.tag),
                subtitle: Text("Disponible"),
                leading: CircleAvatar(
                  child: Icon(Icons.laptop_windows_rounded),
                ),
                trailing: Icon(Icons.battery_5_bar),
              );
            },
          ),
        ),
      ],
    );
  }
}
