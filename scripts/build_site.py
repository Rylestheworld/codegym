"""Build only browser-facing assets for static hosting."""
from pathlib import Path
import re
import shutil
import subprocess
import sys
root = Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, str(root / 'scripts/security_check.py')], check=True)
out = root / '_site'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
files = {'index.html', 'style.css', 'code-worker.js', 'runner-frame.html'}
files.update(re.findall(r'<script src="([^"]+)"', (root / 'index.html').read_text()))
files.update(str(p.relative_to(root)) for p in (root / 'assets').rglob('*') if p.is_file() and not any(part.startswith('.') for part in p.relative_to(root).parts))
for name in sorted(files):
    source = root / name
    if source.is_symlink() or not source.resolve().is_relative_to(root):
        raise ValueError('Unapproved source path')
    dest = out / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, dest)
(out / '.nojekyll').touch()
assert (out / 'assets/pyodide/pyodide.asm.wasm').is_file()
assert not (out / 'distribution').exists()
print(f'Built {len(files)} application files in {out.name}')
