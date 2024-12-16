import 'package:flutter/material.dart';
import 'package:notebooks_app/services/api.dart';
import 'package:notebooks_app/widgets/sheet_picker.dart';

class UserPicker extends StatefulWidget {
  const UserPicker({
    super.key,
    this.value,
    required this.onSelected,
    required this.label,
  });

  final int? value;
  final String label;
  final void Function(User user) onSelected;

  @override
  State<UserPicker> createState() => _UserPickerState();
}

typedef MenuEntry = DropdownMenuEntry<int>;

class _UserPickerState extends State<UserPicker> {
  List<User> users = [];

  @override
  void initState() {
    NotebooksApi.instance.fetchUsers().then((value) {
      setState(() {
        users = value;
      });
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final entries = users
        .map((User user) => PickerEntry(label: user.name, value: user.id))
        .toList();

    return SheetPicker<int>(
      value: widget.value,
      onSelected: (int? value) {
        widget.onSelected(users.firstWhere((element) => element.id == value));
      },
      entries: entries,
      decoration: InputDecoration(label: Text(widget.label)),
    );
  }
}
