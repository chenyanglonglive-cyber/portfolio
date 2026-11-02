"""Apply a reversible Nginx change for public, hash-named cover images only."""
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess

site = Path('/etc/nginx/sites-available/strapi')
log_config = Path('/etc/nginx/conf.d/cover-timing.conf')
marker = '# Public hashed cover cache'
original = site.read_text()
if marker in original:
    raise SystemExit('Cover configuration already installed; inspect before updating.')
if log_config.exists():
    raise SystemExit('Timing config already exists; inspect before updating.')
backup = site.with_name('strapi.backup-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
shutil.copy2(site, backup)
location = '''
    # Public hashed cover cache: do not include resumes or other uploads.
    location ~* ^/uploads/cover_[a-z0-9_-]+\\.(jpg|jpeg|png|webp)$ {
        root /var/www/strapi/public;
        try_files $uri =404;
        expires 30d;
        add_header Access-Control-Allow-Origin "*";
        add_header X-Cover-Cache "nginx-static";
        access_log /var/log/nginx/cover-access.log cover_timing;
    }

'''
updated = original.replace('    location / {', location + '    location / {')
if updated.count(marker) != 2:
    raise SystemExit('Expected exactly two Strapi server blocks.')
try:
    log_config.write_text('log_format cover_timing \'$time_iso8601 status=$status bytes=$body_bytes_sent request_time=$request_time upstream_time=$upstream_response_time "$request"\';\n')
    site.write_text(updated)
    subprocess.run(['nginx', '-t'], check=True)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
except Exception:
    site.write_text(original)
    log_config.unlink(missing_ok=True)
    subprocess.run(['nginx', '-t'], check=False)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=False)
    raise
print('Installed. Site backup:', backup)
