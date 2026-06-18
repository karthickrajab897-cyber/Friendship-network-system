"""
run.py — Alternative launcher for Friendship Network
Usage: python run.py
- Starts the Flask server
- Automatically opens the browser to the login page
"""
import subprocess
import sys
import os
import time
import webbrowser
import urllib.request

PORT = 5000
URL  = f"http://localhost:{PORT}"

def install_deps():
    """Auto-install required packages if missing."""
    try:
        import flask
        import flask_sqlalchemy
        import werkzeug
    except ImportError:
        print("[*] Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install",
                               "flask", "flask-sqlalchemy", "werkzeug"])
        print("[OK] Packages installed.\n")

def server_ready(timeout=30):
    """Poll until server is up or timeout reached."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(f"{URL}/ping", timeout=1)
            return True
        except Exception:
            time.sleep(0.8)
    return False

def main():
    print("=" * 55)
    print("  Friendship Network — Python Launcher")
    print("=" * 55)

    install_deps()

    # Kill existing process on port 5000 (Windows)
    if os.name == "nt":
        os.system("for /f \"tokens=5\" %a in ('netstat -ano ^| findstr \":5000 \" ^| findstr LISTENING 2>nul') do taskkill /F /PID %a >nul 2>&1")
        time.sleep(0.5)

    script = os.path.join(os.path.dirname(__file__), "network_app.py")
    print(f"\n[*] Starting Flask server on {URL}...")
    proc = subprocess.Popen([sys.executable, script],
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                            text=True, bufsize=1)

    print("[*] Waiting for server to be ready...")
    if server_ready(timeout=30):
        print(f"[OK] Server ready at {URL}")
        print(f"\n  Login  : {URL}/auth")
        print(f"  Register: {URL}/auth#register")
        print(f"  Dashboard: {URL}/dashboard")
        print("\n  KEEP THIS WINDOW OPEN to keep the server running.")
        print("=" * 55)
        webbrowser.open(f"{URL}/auth")
    else:
        print("[ERROR] Server did not start in 30 seconds.")
        print("  Make sure Python is installed correctly.")
        print("  Try: pip install flask flask-sqlalchemy werkzeug")

    # Stream server output
    try:
        for line in proc.stdout:
            print(" ", line, end="")
    except KeyboardInterrupt:
        print("\n[*] Shutting down server...")
        proc.terminate()

if __name__ == "__main__":
    main()
