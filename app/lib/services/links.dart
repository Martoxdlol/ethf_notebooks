import 'package:app_links/app_links.dart';

class LinksProvider {
  late AppLinks appLinks;

  final void Function(String code, Uri? server)? onAuthorizationCodeReceived;

  LinksProvider({this.onAuthorizationCodeReceived}) {
    appLinks = AppLinks();

    appLinks.uriLinkStream.listen(handleLink);
  }

  void handleLink(Uri uri) {
    if (uri.path == '/auth/callback') {
      final code = uri.queryParameters['code'];
      String? server = uri.queryParameters['server'];

      if (code != null && onAuthorizationCodeReceived != null) {
        onAuthorizationCodeReceived!(
          code,
          server != null ? Uri.tryParse(server) : null,
        );
      }
    }
  }
}
