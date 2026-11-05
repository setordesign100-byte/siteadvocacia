"""Create the hosting ZIP; keep the one-time activation code outside Git and the ZIP."""
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib
import json
import os
import secrets

root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
private = root.parent / '.rtm-blog-install'
private.mkdir(mode=0o700, parents=True, exist_ok=True)
private.chmod(0o700)
activation_file = private / f'{root.name}.activation-code'
if not activation_file.exists():
    descriptor = os.open(activation_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    with os.fdopen(descriptor, 'w') as handle:
        handle.write('RTM-' + secrets.token_hex(24).upper() + '\n')
activation_file.chmod(0o600)
activation = activation_file.read_text().strip()
if not activation.startswith('RTM-') or len(activation) != 52:
    raise SystemExit('O arquivo de ativação precisa ser verificado antes de gerar o pacote.')
verifier = hashlib.sha256(activation.encode()).hexdigest()
(dist / 'api' / 'blog-install.php').write_text(
    "<?php\ndeclare(strict_types=1);\nreturn ['activation_hash' => '" + verifier + "'];\n"
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
        if activation.encode() in data:
            raise SystemExit('O código de ativação não pode entrar no pacote.')
        entry = ZipInfo(name, date_time=datetime.now().timetuple()[:6])
        entry.create_system = 3
        entry.external_attr = 0o100644 << 16
        output.writestr(entry, data, compress_type=ZIP_DEFLATED, compresslevel=9)
with ZipFile(archive) as check:
    assert check.testzip() is None
    assert all(name in check.namelist() for name in ['index.html', 'blog/index.html', 'painel/index.html', 'api/blog.php', 'api/blog-install.php'])
print(json.dumps({'file': archive.name, 'bytes': archive.stat().st_size, 'files': len(files), 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'activation_file_outside_repository': str(activation_file)}, ensure_ascii=False))
