import 'package:ai_barcode_scanner/ai_barcode_scanner.dart';
import 'package:flutter/material.dart';
// import 'package:native_device_orientation/native_device_orientation.dart';

final key = GlobalKey();

MobileScannerController controller = MobileScannerController(
  detectionSpeed: DetectionSpeed.noDuplicates,
);

class QRScanner extends StatefulWidget {
  const QRScanner({
    super.key,
    this.onDetect,
  });

  final void Function(String)? onDetect;

  @override
  State<QRScanner> createState() => _QRScannerState();
}

class _QRScannerState extends State<QRScanner> {
  GlobalKey scannerKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    controller.start();

    final w = MobileScanner(
      key: key,
      fit: BoxFit.cover,
      controller: controller,

      // hideGalleryButton: true,
      onDetect: (BarcodeCapture detection) {
        for (final barcode in detection.barcodes) {
          final rawValue = barcode.rawValue;
          final onDetect = widget.onDetect;
          if (rawValue != null && onDetect != null) {
            onDetect(rawValue);
          }
        }
      },
    );
    return w;
    // return NativeDeviceOrientedWidget(
    //   landscape: (c) => RotatedBox(quarterTurns: 1, child: w),
    //   portrait: (c) => w,
    //   landscapeLeft: (c) => RotatedBox(quarterTurns: 3, child: w),
    //   portraitDown: (c) => RotatedBox(quarterTurns: 2, child: w),
    //   fallback: (c) => w,
    // );
  }
}
