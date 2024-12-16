import 'package:flutter/material.dart';
import 'package:notebooks_app/models/checkout.dart';
import 'package:notebooks_app/widgets/user_picker.dart';

class ConfirmCheckout extends StatefulWidget {
  const ConfirmCheckout({super.key, required this.items});

  final List<CheckoutItem> items;

  @override
  State<ConfirmCheckout> createState() => _ConfirmCheckoutState();
}

class _ConfirmCheckoutState extends State<ConfirmCheckout> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Checkout"),
      ),
      body: Column(
        children: [
          Text("${widget.items.length} items"),
          Padding(
              padding: EdgeInsets.all(12.0),
              child: UserPicker(onSelected: (user) {})),
          Padding(
            padding: EdgeInsets.all(12.0),
            child: TextField(
              decoration: InputDecoration(
                labelText: "Usuario / Alumno",
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(12.0),
            child: ElevatedButton(
              onPressed: () => showTimePicker(
                  context: context, initialTime: TimeOfDay.now()),
              child: Text("Hasta"),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: Text("Confirmar"),
        icon: Icon(Icons.chevron_right_outlined),
      ),
    );
  }
}
