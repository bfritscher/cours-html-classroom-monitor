# Cours HTML Classroom Monitor
Use puppeteer and jest to validate assignments.

## Environment variables

- `HTML_VALIDATOR_URL` (optional): HTML validator endpoint. Defaults to `https://validator.w3.org/nu/?out=json&level=error`.
- `CSS_VALIDATOR_URL` (optional): CSS validator endpoint. Defaults to `https://validator.w3.org/nu/?out=json&level=error` and is called with `Content-Type: text/css`.
- `CHROME_CLEANUP` (optional, default `true`): after each job the spawned jest process group is killed (SIGTERM, then SIGKILL) and the job's private temp dir (passed as `TMPDIR`, containing Chrome's `puppeteer_dev_chrome_profile-*` and `com.google.Chrome.*` dirs) is removed. Set to `false` when the browser is reused/shared; this also disables the periodic sweep.
- `CHROME_CLEANUP_INTERVAL_MINUTES` (optional, default `30`): on start and at this interval, stale `puppeteer_dev_chrome_profile-*` and `com.google.Chrome.*` dirs in the temp dir older than 60 minutes are removed.

## Docker notes

The image uses `tini` as entrypoint to reap zombie Chrome processes (otherwise use `docker run --init`). Optionally cap temp usage by mounting `/tmp` as tmpfs, e.g. `docker run --tmpfs /tmp:size=2g ...` or `tmpfs: ["/tmp:size=2g"]` in docker-compose.
