"""Generate the static sandbox bridge and pin its only inline script by CSP hash."""
from pathlib import Path
import base64
import hashlib
root = Path(__file__).resolve().parent.parent
source = (root / 'scripts/runner-frame-bootstrap.js').read_text()
digest = base64.b64encode(hashlib.sha256(source.encode()).digest()).decode()
policy = (f"default-src 'none'; script-src 'sha256-{digest}' blob: 'unsafe-eval'; "
          "connect-src blob:; worker-src blob:; child-src 'none'; frame-src 'none'; "
          "object-src 'none'; base-uri 'none'; form-action 'none'")
html = f'<!doctype html>\n<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="{policy}">\n<meta name="referrer" content="no-referrer">\n<title>CodeGym Isolated Runner</title>\n<script>{source}</script>\n'
if __name__ == '__main__':
    import sys
    target = root / 'runner-frame.html'
    if '--check' in sys.argv:
        assert target.read_text() == html, 'Run python3 scripts/build_runner_frame.py'
    else:
        target.write_text(html)
