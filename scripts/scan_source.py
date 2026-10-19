"""Run focused local SAST rules, failing on findings, parse errors, or timeouts."""
from pathlib import Path
import json
import os
import subprocess
import sys
root=Path(__file__).resolve().parent.parent
# Native Semgrep needs a trusted PEM bundle even for local-only analysis.
if sys.platform=='darwin' and 'SSL_CERT_FILE' not in os.environ and Path('/etc/ssl/cert.pem').exists():
    os.environ['SSL_CERT_FILE']='/etc/ssl/cert.pem'
binary=str(Path(sys.argv[1]).resolve())
files=sorted([*root.glob('*.js'),*root.glob('scripts/*.js'),*root.glob('scripts/*.py')])
findings=[]
# Reviewed exceptions: evaluation exists only in the isolated worker; opaque
# frame messaging requires '*' but validates source/origin on receipt.
exceptions={('dynamic-code-outside-runner','code-worker.js'),('wildcard-window-message','code-runner.js')}
accepted=[]
for path in files:
    language='python' if path.suffix=='.py' else 'javascript'
    scan=subprocess.run([binary,'-rules','security/semgrep.yml','-lang',language,'-json_nodots','-timeout','10','-max_memory','1024',str(path.relative_to(root))],cwd=root,text=True,capture_output=True,check=True,timeout=60)
    data=json.loads(scan.stdout)
    if data.get('errors'):
        print(json.dumps(data['errors'],indent=2));sys.exit(1)
    for result in data.get('results',[]):
        finding={'rule':result['check_id'],'file':result['path'],'line':result['start']['line']}
        (accepted if (result['check_id'],result['path']) in exceptions else findings).append(finding)
print(json.dumps({'files_scanned':len(files),'findings':findings,'reviewed_runner_exceptions':accepted},indent=2))
if findings:sys.exit(1)
