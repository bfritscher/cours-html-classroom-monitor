import fs from "fs";
import os from "os";
import path from "path";

const chromeTmpPattern = /^(puppeteer_dev_chrome_profile-|com\.google\.Chrome\.)/;
const staleAfterMs = 60 * 60 * 1000;

export const chromeCleanupEnabled = process.env.CHROME_CLEANUP !== "false";

export function createJobTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "job-"));
}

export function removeDir(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    console.log("cleanup failed", dir, e);
  }
}

export function killProcessTree(pid: number | undefined) {
  if (!pid) {
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch (e) {
    return; // group already gone
  }
  const timer = setTimeout(() => {
    try {
      process.kill(-pid, "SIGKILL");
    } catch (e) {
      // already gone
    }
  }, 2000);
  timer.unref();
}

export function sweepStaleChromeDirs() {
  if (!chromeCleanupEnabled) {
    return;
  }
  const tmp = os.tmpdir();
  const now = Date.now();
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(tmp);
  } catch (e) {
    return;
  }
  for (const name of entries) {
    if (!chromeTmpPattern.test(name)) {
      continue;
    }
    const full = path.join(tmp, name);
    try {
      if (now - fs.statSync(full).mtimeMs > staleAfterMs) {
        removeDir(full);
      }
    } catch (e) {
      // ignore
    }
  }
}

export function startChromeSweeper() {
  if (!chromeCleanupEnabled) {
    return;
  }
  sweepStaleChromeDirs();
  const minutes = Number(process.env.CHROME_CLEANUP_INTERVAL_MINUTES) || 30;
  setInterval(sweepStaleChromeDirs, minutes * 60 * 1000).unref();
}
