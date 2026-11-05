"""Create the hosting ZIP with a provisioned owner; keep its password outside Git."""
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib
import json
import os
import secrets
import re
import subprocess

root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
private = root.parent / '.rtm-blog-install'
private.mkdir(mode=0o700, parents=True, exist_ok=True)
private.chmod(0o700)
credentials_file = private / f'{root.name}.admin-credentials'
if not credentials_file.exists():
    password = 'Rtm!' + secrets.token_urlsafe(18)
    php = os.environ.get('RTM_PHP_BIN', 'php')
    try:
        password_hash = subprocess.run(
            [php, '-r', 'echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT);'],
            input=password, text=True, capture_output=True, check=True,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        raise SystemExit('Configure RTM_PHP_BIN com um executável PHP para preparar o acesso principal.')
    if not password_hash.startswith(('$2y$', '$argon2')):
        raise SystemExit('Não foi possível proteger a senha do administrador.')
    credentials = {
        'username': 'admin.rtm', 'password': password, 'passwordHash': password_hash,
        'provisioningId': secrets.token_hex(16),
    }
    descriptor = os.open(credentials_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    with os.fdopen(descriptor, 'w') as handle:
        json.dump(credentials, handle)
credentials_file.chmod(0o600)
credentials = json.loads(credentials_file.read_text())
if (not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}', credentials.get('username', ''))
        or not re.fullmatch(r'[a-f0-9]{32}', credentials.get('provisioningId', ''))
        or not credentials.get('passwordHash', '').startswith(('$2y$', '$argon2'))
        or len(credentials.get('password', '')) < 12):
    raise SystemExit('O arquivo privado do administrador precisa ser verificado.')
(dist / 'api' / 'blog-install.php').write_text(
    "<?php\ndeclare(strict_types=1);\nreturn ['primary_account' => ["
    "'username' => '" + credentials['username'] + "', "
    "'passwordHash' => '" + credentials['passwordHash'] + "', "
    "'provisioningId' => '" + credentials['provisioningId'] + "']];\n"
)

files = {}
allowed = {'assets', 'images', 'api', 'blog', 'painel'}
for path in sorted(dist.rglob('*')):
    if not path.is_file():
        continue
    relative = path.relative_to(dist)
    name = relative.as_posix()
    if name == 'rtm-preview.html':
        continue
    if name not in {'index.html', 'favicon.svg'} and relative.parts[0] not in allowed:
        raise SystemExit(f'Recurso inesperado no build: {name}')
    files[name] = path.read_bytes()
for package, label in [
    ('react', 'react-MIT.txt'), ('react-dom', 'react-dom-MIT.txt'),
    ('scheduler', 'scheduler-MIT.txt'), ('lucide-react', 'lucide-react-ISC.txt'),
    ('@fontsource/manrope', 'manrope-OFL.txt'),
    ('@fontsource/cormorant-garamond', 'cormorant-garamond-OFL.txt'),
]:
    files['licenses/' + label] = (root / 'node_modules' / package / 'LICENSE').read_bytes()

archive = root / 'SITE-RTM-LOCAWEB.zip'
with ZipFile(archive, 'w', compression=ZIP_DEFLATED, compresslevel=9) as output:
    for name, data in sorted(files.items()):
        if credentials['password'].encode() in data:
            raise SystemExit('A senha do administrador não pode entrar no pacote.')
        entry = ZipInfo(name, date_time=datetime.now().timetuple()[:6])
        entry.create_system = 3
        entry.external_attr = 0o100644 << 16
        output.writestr(entry, data, compress_type=ZIP_DEFLATED, compresslevel=9)
with ZipFile(archive) as check:
    assert check.testzip() is None
    assert all(name in check.namelist() for name in ['index.html', 'blog/index.html', 'painel/index.html', 'api/blog.php', 'api/blog-install.php'])
print(json.dumps({'file': archive.name, 'bytes': archive.stat().st_size, 'files': len(files), 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'principal_username': credentials['username'], 'credentials_file_outside_repository': str(credentials_file)}, ensure_ascii=False))
