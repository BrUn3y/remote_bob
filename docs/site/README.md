# Remote Bob website

Static, English-language project website inspired by Carbon for AI. It uses
Carbon's White and Gray 100 palettes and locally hosted IBM Plex fonts. The
font license is included in `assets/fonts/OFL.txt`. No package installation or
JavaScript build is required.

## Local preview

Run from the repository root:

```bash
python3 - <<'PY'
from pathlib import Path
from shutil import copy2, copytree

output = Path('/tmp/remote-bob-site')
copytree('docs/site', output, dirs_exist_ok=True)
(output / 'media').mkdir(exist_ok=True)
for name in ('remote-bob-slack-en-poster.jpg', 'remote-bob-slack-en.mp4'):
    copy2(Path('docs/media') / name, output / 'media' / name)
PY
python3 -m http.server 4173 --bind 127.0.0.1 --directory /tmp/remote-bob-site
```

Open `http://127.0.0.1:4173`. The preview copies only the website and its two
public media files; repository secrets and workspace data are excluded.

## Deployment

`.github/workflows/pages.yml` publishes this directory plus the two tutorial
assets after website changes are pushed to `anin`. Select **GitHub Actions**
as the repository's Pages build source. The workflow can also be started
manually from `anin`.

## Manual verification

- Test White and Gray 100 with the header controls, reload to verify the
  saved preference, and test OS preference on a fresh browser profile.
- Test desktop, tablet and mobile widths for horizontal overflow.
- Use keyboard navigation to check focus, the mobile menu, Escape, and
  Left/Right/Home/End in the language tabs.
- Check every language example and copy button, including the Podman/Docker
  selector. Examples target the user's local API; the website never invokes it.
- Play the tutorial and verify the README, Slack, OpenAPI and Postman links.
- Verify the site still presents its content when JavaScript is unavailable
  and honors the reduced-motion preference.
