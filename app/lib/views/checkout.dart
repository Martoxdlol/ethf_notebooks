import 'package:flutter/material.dart';
import 'package:notebooks_app/models/checkout.dart';
import 'package:notebooks_app/scanner.dart';

class CheckoutView extends StatefulWidget {
  const CheckoutView({super.key});

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

  @override
  Widget build(BuildContext context) {
    GlobalKey scannerKey = GlobalKey();

    final screenWidth = MediaQuery.of(context).size.width;

    print(items);

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
