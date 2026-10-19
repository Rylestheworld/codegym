"""Fail-closed local security invariants; complements Semgrep and Gitleaks."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'assets/pyodide/manifest.json').read_text())
for name, record in manifest['files'].items():
    assert Path(name).name == name
    path = root / 'assets/pyodide' / name
    assert not path.is_symlink(), f'Symlink runtime asset: {name}'
    data = path.read_bytes()
    assert len(data) == record['bytes'] and hashlib.sha256(data).hexdigest() == record['sha256'], f'Runtime integrity failure: {name}'
subprocess.run([sys.executable, str(root / 'scripts/build_runner_frame.py'), '--check'], check=True)
page = (root / 'index.html').read_text()
assert "script-src 'self';" in page and "worker-src 'none'" in page
assert 'unsafe-eval' not in page and 'https://' not in re.search(r'Content-Security-Policy" content="([^"]+)', page)[1]
runner = (root / 'code-runner.js').read_text()
assert "frame.sandbox='allow-scripts'" in runner and 'allow-same-origin' not in runner
assert "event.source!==frame.contentWindow" in runner and "event.origin!=='null'" in runner
assert 'new Worker' not in runner
for source in re.findall(r'<script src="([^"]+)"', page):
    assert re.fullmatch(r'[a-z][a-z0-9-]*\.js', source), f'Unapproved script source: {source}'
for path in (root / 'assets').rglob('*'):
    assert not path.is_symlink(), f'Symlink asset: {path.name}'
for workflow in (root / '.github/workflows').glob('*.yml'):
    for action in re.findall(r'uses:\s*([^\s]+)', workflow.read_text()):
        assert re.fullmatch(r'[\w-]+/[\w-]+(?:/[\w-]+)*@[0-9a-f]{40}', action), f'Action must use immutable SHA: {action}'
lock=json.loads((root/'package-lock.json').read_text())
for name, package in lock['packages'].items():
    if name:
        assert package['resolved'].startswith('https://registry.npmjs.org/') and package['integrity'].startswith('sha512-'), 'Unverified npm artifact'
bridge=(root/'scripts/runner-frame-bootstrap.js').read_text()
assert "self.origin !== 'null'" in bridge and 'event.origin !== parentOrigin' in bridge
print('PASS: runtime checksums, runner CSP and origin isolation, script allowlist, asset paths, and pinned actions.')
