"""
AI Resume Portfolio Generator - Web Server & API Backend
---------------------------------------------------------
Serves the Interactive Web Dashboard UI, handles POST /api/generate API 
with direct Gemini multimodal extraction & theme selection, POST /api/chat 
for the interactive AI Chatbot, and GET /api/download-zip for 1-click deployment.
"""

import os
import sys
import json
import base64
import zipfile
import io
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Ensure UTF-8 output encoding for Windows terminals
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import main

PORT = 8000
LATEST_PORTFOLIO_DATA = {} # Global cache for interactive recruiter chatbot

class PortfolioDashboardHandler(SimpleHTTPRequestHandler):
    """Custom HTTP Request Handler serving static dashboard assets and APIs."""

    def do_GET(self):
        if self.path == "/" or self.path == "":
            self.path = "/index.html"
        elif self.path == "/api/download-zip":
            self.handle_download_zip()
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/generate":
            self.handle_api_generate()
        elif self.path == "/api/chat":
            self.handle_api_chat()
        else:
            self.send_error(404, "Endpoint Not Found")

    def handle_download_zip(self):
        """Creates a downloadable .zip package containing portfolio.html and style.css for 1-click Netlify deployment."""
        try:
            portfolio_path = Path(main.OUTPUT_FILE)
            style_path = Path("style.css")

            if not portfolio_path.exists():
                self.send_error(404, "portfolio.html has not been generated yet!")
                return

            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(portfolio_path, arcname="index.html") # Renamed to index.html inside zip for root hosting!
                if style_path.exists():
                    zf.write(style_path, arcname="style.css")

            zip_bytes = zip_buffer.getvalue()

            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", 'attachment; filename="portfolio_website.zip"')
            self.send_header("Content-Length", str(len(zip_bytes)))
            self.end_headers()
            self.wfile.write(zip_bytes)

            print("[Server API] Deploy Zip Package (portfolio_website.zip) downloaded successfully!")

        except Exception as e:
            print(f"❌ [Zip Download Error]: {e}")
            self.send_error(500, str(e))

    def handle_api_generate(self):
        """Processes resume extraction requests with theme choices & file uploads."""
        global LATEST_PORTFOLIO_DATA
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            payload = json.loads(body_bytes.decode("utf-8"))

            file_b64 = payload.get("file_data")
            filename = payload.get("filename", "resume.txt")
            resume_text = payload.get("resume_text", "").strip()
            profile_img_b64 = payload.get("profile_image")
            selected_theme = payload.get("selected_theme", "dark-lime")

            api_key = main.load_api_key()

            if file_b64:
                file_bytes = base64.b64decode(file_b64)
                print(f"\n[Server API] Processing file '{filename}' ({len(file_bytes)} bytes) with Gemini AI...")
                raw_response = main.extract_data_with_gemini(file_bytes, filename, api_key)
            else:
                if not resume_text or len(resume_text) < main.MIN_RESUME_LENGTH:
                    self.send_json_response({
                        "success": False,
                        "error": f"Resume text is too short. Minimum {main.MIN_RESUME_LENGTH} characters required."
                    }, status_code=400)
                    return
                
                print(f"\n[Server API] Processing text input ({len(resume_text)} chars) with Gemini AI...")
                raw_response = main.extract_data_with_gemini(resume_text, filename, api_key)

            portfolio_data = main.parse_and_clean_json(raw_response)
            LATEST_PORTFOLIO_DATA = portfolio_data

            main.generate_portfolio(portfolio_data, main.TEMPLATE_FILE, main.OUTPUT_FILE, profile_img_b64, selected_theme)

            with open(main.OUTPUT_FILE, "r", encoding="utf-8") as f:
                generated_html = f.read()

            print(f"[Server API] Portfolio HTML generated successfully with theme '{selected_theme}'!")

            self.send_json_response({
                "success": True,
                "html": generated_html,
                "data": portfolio_data,
                "theme": selected_theme,
                "ats_analysis": portfolio_data.get("ats_analysis", {})
            })

        except Exception as e:
            print(f"❌ [Server API Error]: {e}")
            self.send_json_response({
                "success": False,
                "error": str(e)
            }, status_code=500)

    def handle_api_chat(self):
        """Processes real-time Recruiter AI Chatbot queries."""
        global LATEST_PORTFOLIO_DATA
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            payload = json.loads(body_bytes.decode("utf-8"))

            question = payload.get("question", "").strip()
            if not question:
                self.send_json_response({"reply": "Please ask a specific question!"}, status_code=400)
                return

            api_key = main.load_api_key()
            reply = main.answer_recruiter_question(question, LATEST_PORTFOLIO_DATA, api_key)
            self.send_json_response({"reply": reply})

        except Exception as e:
            print(f"❌ [Chat API Error]: {e}")
            self.send_json_response({"reply": f"Sorry, AI Assistant is offline: {e}"}, status_code=500)

    def send_json_response(self, data_dict, status_code=200):
        response_bytes = json.dumps(data_dict).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)


def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, PortfolioDashboardHandler)
    print("=" * 70)
    print(f"🚀 AI RESUME PORTFOLIO GENERATOR DASHBOARD SERVER RUNNING")
    print(f"👉 Open in browser: http://localhost:{PORT}")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
