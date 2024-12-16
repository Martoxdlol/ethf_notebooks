import 'package:collection/collection.dart';
import 'package:flutter/material.dart';

class PickerEntry<T> {
  PickerEntry({
    required this.value,
    required this.label,
  });

  final T value;
  final String label;

  @override
  String toString() => label;
}

class SheetPicker<T> extends StatefulWidget {
  const SheetPicker({
    super.key,
    required this.entries,
    required this.onSelected,
    required this.value,
    this.decoration,
  });

  final InputDecoration? decoration;

  final T? value;
  final List<PickerEntry<T>> entries;
  final void Function(T) onSelected;

  @override
  State<SheetPicker<T>> createState() => _SheetPickerState<T>();
}

class _SheetPickerState<T> extends State<SheetPicker<T>> {
  void showPicker(BuildContext context) {
    final entries = widget.entries.sorted((a, b) => a.label.compareTo(b.label));

    showModalBottomSheet(
      isScrollControlled: true,
      context: context,
      builder: (context) {
        final realAvailableVerticalSpace = MediaQuery.of(context).size.height -
            MediaQuery.of(context).viewInsets.top -
            MediaQuery.of(context).viewInsets.bottom;

        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: SizedBox(
            height: realAvailableVerticalSpace > 500
                ? 500
                : realAvailableVerticalSpace - 50,
            child: PickerSheetModal(
              entries: entries,
              onSelected: widget.onSelected,
              value: widget.value,
            ),
          ),
        );
      },
    );
  }

  TextEditingController controller = TextEditingController();

  @override
  void didUpdateWidget(covariant SheetPicker<T> oldWidget) {
    if (widget.value != oldWidget.value) {
      final entry =
          widget.entries.firstWhere((element) => element.value == widget.value);
      controller.text = entry.label;
    }

    super.didUpdateWidget(oldWidget);
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      readOnly: true,
      onTap: () => showPicker(context),
      controller: controller,
      decoration: widget.decoration,
    );
  }
}

class PickerSheetModal<T> extends StatefulWidget {
  const PickerSheetModal({
    super.key,
    required this.entries,
    required this.onSelected,
    required this.value,
  });

  final List<PickerEntry> entries;
  final void Function(T) onSelected;
  final T? value;

  @override
  State<PickerSheetModal> createState() => PickerSheetModalState<T>();
}

class PickerSheetModalState<T> extends State<PickerSheetModal<T>> {
  String filter = "";

  List<PickerEntry> filteredEntries = [];

  void filterEntries() {
    filteredEntries = widget.entries
        .where((element) =>
            element.label.toLowerCase().contains(filter.toLowerCase()))
        .toList();
  }

  @override
  void initState() {
    filterEntries();
    super.initState();
  }

  @override
  void didUpdateWidget(covariant PickerSheetModal<T> oldWidget) {
    if (widget.entries != oldWidget.entries) {
      setState(() {
        filterEntries();
      });
    }

    super.didUpdateWidget(oldWidget);
  }

  @override
  Widget build(BuildContext context) {
    return BottomSheet(
      onClosing: () {},
      builder: (context) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextField(
                autofocus: true,
                onChanged: (value) => setState(() {
                  filter = value;
                  filterEntries();
                }),
                decoration: InputDecoration(
                  hintText: "Buscar",
                  filled: true,
                  border: OutlineInputBorder(
                      borderSide: BorderSide.none,
                      borderRadius: BorderRadius.circular(20.0)),
                ),
              ),
            ),
            Expanded(
                child: ListView.builder(
              itemCount: filteredEntries.length,
              itemBuilder: (context, index) {
                final entry = filteredEntries[index];
                return ListTile(
                  title: Text(entry.toString()),
                  onTap: () {
                    Navigator.of(context).pop();
                    widget.onSelected(entry.value);
                  },
                );
              },
            ))
          ],
        );
      },
    );
  }
}
