"""Extract only Semgrep's native engine and its bundled libraries. No pip install."""
from pathlib import Path
import hashlib
import json
import platform
import subprocess
import sys
import tempfile
import zipfile
root=Path(__file__).resolve().parent.parent
record=json.loads((root/'security/tools.json').read_text())['semgrep']['artifacts'][platform.system()+'-'+platform.machine()]
target=Path(sys.argv[1]).resolve()
with tempfile.TemporaryDirectory() as directory:
    wheel=Path(directory)/'semgrep.whl'
    subprocess.run(['curl','--fail','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--output',str(wheel),record['url']],check=True)
    assert hashlib.sha256(wheel.read_bytes()).hexdigest()==record['sha256'], 'SAST checksum mismatch'
    with zipfile.ZipFile(wheel) as bundle:
        for name in bundle.namelist():
            marker='/semgrep/bin/'
            normalized='/'+name
            if marker not in normalized or name.endswith('/') or name.endswith('.py'):continue
            relative=Path('bin')/normalized.split(marker,1)[1]
            assert '..' not in relative.parts
            destination=target/relative
            destination.parent.mkdir(parents=True,exist_ok=True)
            destination.write_bytes(bundle.read(name))
    (target/'bin/semgrep-core').chmod(0o755)
print('Installed checksum-verified native Semgrep engine; no Python dependencies installed.')
