"""Create a Devpost-sized source archive without builds, recordings, or local binaries."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path.cwd()
output = root / 'artifacts/submission/the-last-light-source.zip'
output.parent.mkdir(parents=True, exist_ok=True)
top_files = [
    'README.md', 'package.json', 'package-lock.json', 'next.config.mjs',
    'postcss.config.mjs', 'tailwind.config.ts', 'tsconfig.json',
    'vitest.config.ts', 'playwright.config.ts', 'playwright.dev.config.ts',
    'playwright.release.config.ts',
]
files = [root / name for name in top_files]
files += [p for folder in ('src', 'public', 'e2e', 'scripts')
          for p in (root / folder).rglob('*') if p.is_file()
          and '.vendor' not in p.parts and '__pycache__' not in p.parts
          and 'screenshots' not in p.parts]
missing = [str(p) for p in files if not p.exists()]
if missing:
    raise RuntimeError(f'Missing source files: {missing}')
with ZipFile(output, 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for file in sorted(set(files)):
        archive.write(file, file.relative_to(root).as_posix())
limit = 35 * 1024 * 1024
if output.stat().st_size > limit:
    raise RuntimeError(f'Source ZIP exceeds 35 MiB: {output.stat().st_size} bytes')
print(f'{output}: {output.stat().st_size} bytes, {len(set(files))} files')
