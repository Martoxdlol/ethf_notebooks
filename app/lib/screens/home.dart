import 'package:flutter/material.dart';
import 'package:notebooks_app/services/auth.dart';
import 'package:notebooks_app/views/checkout.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.title});

  final String title;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int index = 0;

  late final TabController controller;

  GlobalKey checkoutKey = GlobalKey();

  @override
  void initState() {
    controller = TabController(length: 3, vsync: this);
    controller.addListener(listener);
    super.initState();
  }

  void listener() {
    setState(() {
      index = controller.index;
    });
  }

  void onDestinationSelected(int value) {
    controller.animateTo(value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
              onPressed: AuthProvider.instance.logout,
              icon: Icon(
                Icons.logout_rounded,
                color: Colors.white,
              ))
        ],
        backgroundColor: Colors.blue,
        title: Text(
          widget.title,
          style: TextStyle(color: Colors.white),
        ),
        elevation: 4.0,
        shadowColor: Colors.black,
      ),
      body: TabBarView(controller: controller, children: [
        Text(bool.fromEnvironment('dart.tool.dart2wasm')
            ? 'wasm yes'
            : 'wasm no'),
        CheckoutView(
          key: checkoutKey,
        ),
        Text("Lista"),
      ]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: onDestinationSelected,
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner_rounded),
            label: 'Checkout',
          ),
          NavigationDestination(
            icon: Icon(Icons.laptop_windows_rounded),
            label: 'Notebooks',
          ),
        ],
      ),
    );
  }
}
