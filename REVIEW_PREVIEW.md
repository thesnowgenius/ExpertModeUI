# Isolated Expert preview build

This opt-in build pins one non-production API origin. The ordinary `index.html` remains the normal application. Building does not deploy, authenticate reviewers, approve a catalog or change hosted settings.

From this repository, build into a NEW directory outside the checkout:

```bash
python3 scripts/build_review_preview.py --api-origin https://sa-expert.example.com --output /tmp/expert-sa-preview
```

Replace the example with the approved isolated API origin. It must be canonical HTTPS without a trailing slash, path, credentials, query or fragment. Known Snow Genius production hosts are refused. Hosting and private access still require separate review; a hostname passing validation is not proof that its server is isolated.

For disposable local testing only:

```bash
python3 scripts/build_review_preview.py --api-origin http://127.0.0.1:8007 --local-test --output /tmp/expert-local-preview
python3 -m http.server 5180 --bind 127.0.0.1 --directory /tmp/expert-local-preview
```

The API must use the isolated catalog reader, revision refresh, `SG_CATALOG_REVIEW_MODE=true` and CORS for the exact preview UI origin. Never give the browser database credentials. Keep strict pricing off until coverage is reviewed. The API's `/health/ready` must pass with current approved inventory; liveness alone is insufficient.

The generated page pins both configuration and CSP, ignores `window.API_URL` and saved endpoint overrides, and removes endpoint editing even in `?devmode`. Missing/invalid configuration stops before requests. A missing API review disclosure prevents catalog acceptance. It has no production API fallback. The preview omits production instrumentation assets and feedback controls; provider links use validated destination URLs rather than production redirect links. Normal-mode behavior is preserved.

`preview-manifest.json` records file SHA-256 values. Keep it with the unmodified artifact. Deliberately broken browser fixtures are test material, never deployment artifacts. Content-based query versions keep changed config and assets distinct. The builder refuses existing output, source-nested output, symlink assets and unexpected HTML layouts.

Checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p test_review_preview.py -v
node --test tests/review-deployment.test.js
node --check assets/script.js
```

Also check a real isolated DB request, unsupported inventory, a saved production endpoint override, missing config/disclosure, normal-mode control, keyboard selection, and desktop/mobile layout. Local checks do not certify hosted auth, CORS, recovery or capacity.
