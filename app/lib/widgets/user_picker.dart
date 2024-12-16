import 'package:flutter/material.dart';
import 'package:notebooks_app/services/api.dart';

class UserPicker extends StatefulWidget {
  const UserPicker({super.key, this.value, required this.onSelected});

  final int? value;

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
        .map<MenuEntry>(
            (User user) => MenuEntry(label: user.name, value: user.id))
        .toList();

    return DropdownMenu<int>(
      width: double.infinity,
      initialSelection: entries.isNotEmpty ? entries.first.value : null,
      onSelected: (int? value) {
        widget.onSelected(users.firstWhere((element) => element.id == value));
      },
      dropdownMenuEntries: entries,
    );
  }
}
