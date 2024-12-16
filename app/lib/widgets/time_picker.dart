import 'package:flutter/material.dart';
import 'package:notebooks_app/widgets/sheet_picker.dart';

class SheetTimePicker extends StatefulWidget {
  const SheetTimePicker({
    super.key,
    this.value,
    required this.onSelected,
    required this.label,
  });

  final TimeOfDay? value;
  final String label;
  final void Function(TimeOfDay time) onSelected;

  @override
  State<SheetTimePicker> createState() => _SheetTimePickerState();
}

typedef MenuEntry = DropdownMenuEntry<int>;

class _SheetTimePickerState extends State<SheetTimePicker> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final List<PickerEntry<TimeOfDay>> entries = [
      PickerEntry(value: TimeOfDay(hour: 7, minute: 30), label: "07:30"),
      PickerEntry(value: TimeOfDay(hour: 8, minute: 30), label: "08:30"),
      PickerEntry(value: TimeOfDay(hour: 9, minute: 30), label: "09:30"),
      PickerEntry(value: TimeOfDay(hour: 10, minute: 30), label: "10:30"),
      PickerEntry(value: TimeOfDay(hour: 11, minute: 30), label: "11:30"),
      PickerEntry(value: TimeOfDay(hour: 12, minute: 30), label: "12:30"),
      PickerEntry(value: TimeOfDay(hour: 13, minute: 30), label: "13:30"),
      PickerEntry(value: TimeOfDay(hour: 14, minute: 30), label: "14:30"),
      PickerEntry(value: TimeOfDay(hour: 15, minute: 30), label: "15:30"),
      PickerEntry(value: TimeOfDay(hour: 16, minute: 30), label: "16:30"),
      PickerEntry(value: TimeOfDay(hour: 17, minute: 30), label: "17:30"),
      PickerEntry(value: TimeOfDay(hour: 18, minute: 30), label: "18:30"),
      PickerEntry(value: TimeOfDay(hour: 19, minute: 30), label: "19:30"),
    ];

    return SheetPicker<TimeOfDay>(
      value: widget.value,
      onSelected: (TimeOfDay value) {
        widget.onSelected(value);
      },
      entries: entries,
      decoration: InputDecoration(label: Text(widget.label)),
    );
  }
}
