"""Query OSV for pinned browser/runtime and security-tool packages. No secrets sent."""
from pathlib import Path
import json
import re
import subprocess
import sys
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'assets/pyodide/manifest.json').read_text())
packages = [('npm', 'pyodide', manifest['version'])]
tools = json.loads((root / 'security/tools.json').read_text())
packages.append(('PyPI','semgrep',tools['semgrep']['version']))
for path, package in json.loads((root/'package-lock.json').read_text())['packages'].items():
    if path:packages.append(('npm',path.split('node_modules/')[-1],package['version']))
payload = json.dumps({'queries':[{'package':{'ecosystem':eco,'name':name},'version':version} for eco,name,version in packages]})
response = subprocess.run(['curl','--fail','--silent','--show-error','--retry','2','--max-time','60','--proto','=https','-H','Content-Type: application/json','--data-binary','@-','https://api.osv.dev/v1/querybatch'],input=payload,text=True,capture_output=True,check=True)
data = json.loads(response.stdout)
assert len(data['results']) == len(packages), 'Incomplete advisory response'
findings = []
for package, result in zip(packages,data['results']):
    for advisory in result.get('vulns',[]):
        findings.append({'package':':'.join(package),'advisory':advisory['id']})
print(json.dumps({'packages_checked':len(packages),'findings':findings},indent=2))
if findings:sys.exit(1)
print('PASS: no OSV advisories returned for these package versions. CPython core and browser/OS vulnerabilities are outside this ecosystem lookup.')
