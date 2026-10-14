"""Build only browser-facing assets for static hosting."""
from pathlib import Path
import re
import shutil
root = Path(__file__).resolve().parent.parent
out = root / '_site'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
files = {'index.html', 'style.css', 'code-worker.js'}
files.update(re.findall(r'<script src="([^"]+)"', (root / 'index.html').read_text()))
files.update(str(p.relative_to(root)) for p in (root / 'assets').rglob('*') if p.is_file() and not any(part.startswith('.') for part in p.relative_to(root).parts))
for name in sorted(files):
    dest = out / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, dest)
(out / '.nojekyll').touch()
assert (out / 'assets/pyodide/pyodide.asm.wasm').is_file()
assert not (out / 'distribution').exists()
print(f'Built {len(files)} application files in {out.name}')
