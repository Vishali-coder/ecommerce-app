#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to the directory containing the HTML file
os.chdir(r'd:\backend')

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print(f"Open http://localhost:{PORT}/test-connection.html to test the API")
    httpd.serve_forever()