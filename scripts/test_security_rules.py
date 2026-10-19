"""Check that the SAST gate detects deliberately unsafe snippets, not just clean code."""
from pathlib import Path
import json
import os
import subprocess
import sys
import tempfile
root=Path(__file__).resolve().parent.parent
if sys.platform=='darwin' and 'SSL_CERT_FILE' not in os.environ and Path('/etc/ssl/cert.pem').exists():os.environ['SSL_CERT_FILE']='/etc/ssl/cert.pem'
with tempfile.TemporaryDirectory() as directory:
    path=Path(directory)/'unsafe.js'
    path.write_text("element.innerHTML = localStorage.getItem('untrusted');\neval(input.value);\nother.postMessage({}, '*');\n")
    output=subprocess.check_output([str(Path(sys.argv[1]).resolve()),'-rules',str(root/'security/semgrep.yml'),'-lang','javascript','-json_nodots',str(path)],text=True)
    data=json.loads(output)
    assert not data.get('errors')
    found={row['check_id'] for row in data['results']}
    assert {'untrusted-html','dynamic-code-outside-runner','wildcard-window-message'}<=found, found
print('PASS: deliberately unsafe HTML, dynamic evaluation, and unrestricted messaging are detected.')
