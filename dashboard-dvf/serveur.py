"""
serveur.py
----------
Back-end minimal en Python (bibliothèque standard, aucune dépendance).
Sert le dashboard sur http://localhost:8000

  python3 serveur.py            # port 8000 par défaut
  python3 serveur.py 8080       # port personnalisé

Le front lit data/dashboard_data.json (généré par collecte_dvf.py + traitement.py).
"""

import http.server
import os
import socketserver
import sys
import webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
RACINE = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RACINE, **kwargs)

    def end_headers(self):
        # évite la mise en cache pendant le développement
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"  · {self.address_string()} — {fmt % args}")


def main():
    if not os.path.exists(os.path.join(RACINE, "data", "dashboard_data.json")):
        print("[!] data/dashboard_data.json manquant.")
        print("    Lancez d'abord :  python3 collecte_dvf.py  puis  python3 traitement.py\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"=== Dashboard immobilier DVF ===")
        print(f"Serveur lancé sur {url}")
        print("Ctrl+C pour arrêter.\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServeur arrêté.")


if __name__ == "__main__":
    main()
