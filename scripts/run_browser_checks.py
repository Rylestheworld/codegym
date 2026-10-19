"""Run browser suites against the exact static build in an isolated test profile."""
from pathlib import Path
import os
import subprocess
import sys
import time
import urllib.request
root=Path(__file__).resolve().parent.parent
env=os.environ.copy()
env['CODEGYM_TEST_URL']='http://127.0.0.1:8765/'
if not env.get('CODEGYM_CHROME'):
    env['CODEGYM_CHROME']=subprocess.check_output(['node','-e','process.stdout.write(require("playwright").chromium.executablePath())'],cwd=root,text=True)
server=subprocess.Popen([sys.executable,'-m','http.server','8765','--bind','127.0.0.1','--directory',str(root/'_site')],stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
try:
    for attempt in range(30):
        if server.poll() is not None:raise RuntimeError('Test server could not start')
        try:
            urllib.request.urlopen(env['CODEGYM_TEST_URL'],timeout=1).close();break
        except OSError:time.sleep(0.2)
    else:raise RuntimeError('Test server did not become ready')
    for suite in ['browser-security.cjs','browser-learning.cjs','browser-proving.cjs']:
        subprocess.run(['node',str(root/'tests'/suite)],cwd=root,env=env,check=True,timeout=240)
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill();server.wait()
