import json
import math
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OPERATIONS = {
    "+": lambda left, right: left + right,
    "-": lambda left, right: left - right,
    "×": lambda left, right: left * right,
    "÷": lambda left, right: left / right,
}


class CalculatorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != "/calculate":
            self.send_error(404, "Not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4096:
                raise ValueError("Request body must be between 1 and 4096 bytes.")

            payload = json.loads(self.rfile.read(length))
            left = float(payload["left"])
            right = float(payload["right"])
            operator = payload["operator"]

            if not math.isfinite(left) or not math.isfinite(right):
                raise ValueError("Operands must be finite numbers.")
            if operator not in OPERATIONS:
                raise ValueError("Unsupported operator.")
            if operator == "÷" and right == 0:
                raise ValueError("Cannot divide by zero.")

            result = OPERATIONS[operator](left, right)
            if not math.isfinite(result):
                raise ValueError("The result is outside the supported range.")

            formatted = str(int(result)) if result.is_integer() else format(result, ".12g")
            self._send_json(200, {"result": formatted})
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            self._send_json(400, {"error": str(error) or "Invalid calculation."})
        except OverflowError:
            self._send_json(400, {"error": "The result is outside the supported range."})

    def _send_json(self, status, payload):
        response = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(response)


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    server = ThreadingHTTPServer(address, CalculatorHandler)
    print(f"Calculator running at http://{address[0]}:{address[1]} (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nCalculator server stopped.")
    finally:
        server.server_close()
