import 'package:flutter/material.dart';
import 'package:notebooks_app/models/checkout.dart';
import 'package:notebooks_app/services/api.dart';
import 'package:notebooks_app/widgets/time_picker.dart';
import 'package:notebooks_app/widgets/user_picker.dart';

class ConfirmCheckout extends StatefulWidget {
  const ConfirmCheckout({super.key, required this.items});

  final List<CheckoutItem> items;

  @override
  State<ConfirmCheckout> createState() => _ConfirmCheckoutState();
}

class _ConfirmCheckoutState extends State<ConfirmCheckout> {
  int? responsibleId;
  TimeOfDay? returnTime;

  bool pending = false;

  Future<void> confirmCheckout() async {
    setState(() {
      pending = true;
    });
    try {
      NotebooksApi.instance.checkoutItems(
        widget.items,
        responsible: responsibleId!,
        user: null,
        expected_checkin: timeOfDayToDateTime(returnTime!),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Error al confirmar: $e"),
        ),
      );
    }
    setState(() {
      pending = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    bool valid = responsibleId != null && returnTime != null;

    return Scaffold(
      appBar: AppBar(
        title: Text("Checkout"),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(12.0),
            child: UserPicker(
              value: responsibleId,
              label: "Responsable",
              onSelected: (user) {
                setState(() {
                  responsibleId = user.id;
                });
              },
            ),
          ),
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
            child: SheetTimePicker(
              value: returnTime,
              label: "Devolver",
              onSelected: (returnTime) {
                setState(() {
                  this.returnTime = returnTime;
                });
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: widget.items.length,
              itemBuilder: (context, index) {
                final item = widget.items[index];
                return ListTile(
                  title: Text(item.tag),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: pending || !valid ? null : confirmCheckout,
        label: Text("Confirmar"),
        icon: Icon(Icons.chevron_right_outlined),
      ),
    );
  }
}

DateTime timeOfDayToDateTime(TimeOfDay timeOfDay, {DateTime? dateTime}) {
  if (dateTime != null) {
    return DateTime(dateTime.year, dateTime.month, dateTime.day, timeOfDay.hour,
        timeOfDay.minute);
  } else {
    final now = DateTime.now();
    return DateTime(
        now.year, now.month, now.day, timeOfDay.hour, timeOfDay.minute);
  }
}
