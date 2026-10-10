"""Build a separate, pinned Expert preview artifact. Never deploys or edits source.

Use --local-test only for loopback browser checks. Output must be a new directory.
A generated build is not authentication, catalog approval or a production release.
"""
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import hashlib
import html
import json
import re
import shutil
import tempfile

SOURCE = Path(__file__).resolve().parents[1]


def api_origin(value, local_test=False):
    url = urlsplit(value)
    host = (url.hostname or '').lower().rstrip('.')
    loopback = host in ('localhost', '127.0.0.1', '::1')
    if (not host or url.username or url.password or url.path or url.query or url.fragment
            or host == 'snow-genius.com' or host.endswith('.snow-genius.com')
            or host == 'pass-picker-expert-mode-multi.onrender.com'
            or '*' in host or host.endswith('.invalid')
            or (loopback and (not local_test or url.scheme != 'http'))
            or (not loopback and (local_test or url.scheme != 'https'))
            or url.port is not None and not 1 <= url.port <= 65535):
        raise ValueError('An exact isolated HTTPS API origin is required; loopback requires --local-test.')
    canonical = url.scheme + '://' + url.netloc.lower()
    if value != canonical or (url.scheme == 'https' and url.port == 443) or (url.scheme == 'http' and url.port == 80):
        raise ValueError('Use a canonical origin without default port, path, credentials or query.')
    return value


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError('Source layout changed; review the preview builder before proceeding.')
    return text.replace(old, new, 1)


def build(origin, output, local_test=False, source=SOURCE):
    origin = api_origin(origin, local_test)
    source = Path(source).resolve(); output = Path(output).absolute()
    if output.resolve().is_relative_to(source):
        raise ValueError('Output cannot be inside the source repository.')
    if output.exists() or output.is_symlink():
        raise ValueError('Output must be a new directory.')
    # Copy only browser assets, never credentials, Git metadata or repository docs.
    asset_paths = list((source/'assets').rglob('*'))
    if any(p.is_symlink() for p in asset_paths):
        raise ValueError('Symlink assets are not permitted.')
    index = (source/'index.html').read_text()
    index = replace_once(index, '<html lang="en">', '<html lang="en" data-sg-deployment="review">')
    index = replace_once(index, '<head>', '<head>\n  <meta name="sg-review-api-origin" content="'+html.escape(origin, quote=True)+'">\n  <meta name="robots" content="noindex, nofollow">\n  <script src="assets/review-deployment.js"></script>\n  <script src="assets/review-config.js"></script>')
    index, count = re.subn(r"connect-src [^;]+;", 'connect-src '+origin+';', index)
    if count != 1: raise ValueError('Expected one CSP connect-src directive.')
    for name in ('funnel-analytics', 'outbound-analytics'):
        index, count = re.subn(r'  <script src="assets/'+name+r'\.js\?[^"\n]+" defer></script>\n', '', index)
        if count != 1: raise ValueError('Expected production instrumentation script reference.')
    index, count = re.subn(r'  <link rel="preload" href="resorts.json"[^>]+>\n', '', index)
    if count != 1: raise ValueError('Expected old resort preload reference.')
    # A separate artifact with content-hashed asset references prevents mixed caches.
    config = {'mode':'review','apiOrigin':origin,'localTest':local_test}
    config_js = 'window.SnowGeniusReviewConfig = Object.freeze('+json.dumps(config, sort_keys=True)+');\n'
    with tempfile.TemporaryDirectory(prefix='sg-preview-', dir=output.parent) as temporary:
        target = Path(temporary)/'site';target.mkdir()
        shutil.copytree(source/'assets', target/'assets', ignore=shutil.ignore_patterns('.*','__pycache__','*.pyc','*analytics*'))
        (target/'assets/review-config.js').write_text(config_js)
        for name in ('bootstrap.js','script.js','styles.css','review-deployment.js','review-config.js'):
            path = target/'assets'/name
            fingerprint = hashlib.sha256(path.read_bytes()).hexdigest()[:16]
            index = re.sub(r'assets/'+re.escape(name)+r'(?:\?[^"\s]+)?', 'assets/'+name+'?v='+fingerprint, index)
        (target/'index.html').write_text(index)
        manifest = {'kind':'isolated_expert_preview','api_origin':origin,'local_test_only':local_test,
                    'production_approved':False,'hosted_access_control_verified':False,
                    'files':{str(p.relative_to(target)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(target.rglob('*')) if p.is_file()}}
        (target/'preview-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        target.rename(output)
    return manifest


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--api-origin',required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--local-test',action='store_true')
    args=parser.parse_args()
    try:
        build(args.api_origin,args.output,args.local_test)
    except (ValueError,OSError):
        parser.exit(2,'Preview build refused: invalid configuration, existing output or source layout drift. No input values printed.\n')
    print('Created isolated preview artifact; deployment remains unapproved.')

if __name__=='__main__':main()
