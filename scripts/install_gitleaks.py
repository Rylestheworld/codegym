"""Install an official scanner archive only after checking its pinned SHA-256."""
from pathlib import Path
import hashlib
import platform
import subprocess
import tarfile
import tempfile
import sys
artifacts = {
 ('Linux','x86_64'):('linux_x64','551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'),
 ('Darwin','arm64'):('darwin_arm64','b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5')
}
name,digest = artifacts[(platform.system(),platform.machine())]
target = Path(sys.argv[1]).resolve()
target.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as directory:
    archive=Path(directory)/'scanner.tar.gz'
    subprocess.run(['curl','--fail','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--output',str(archive),f'https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_{name}.tar.gz'],check=True)
    assert hashlib.sha256(archive.read_bytes()).hexdigest()==digest, 'Scanner checksum mismatch'
    with tarfile.open(archive) as bundle:
        member=bundle.getmember('gitleaks')
        assert member.isfile()
        (target/'gitleaks').write_bytes(bundle.extractfile(member).read())
    (target/'gitleaks').chmod(0o755)
print('Installed checksum-verified Gitleaks 8.30.1.')
