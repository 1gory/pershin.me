#!/usr/bin/env python3
"""Prepare Chrome Web Store stats for the portfolio, server-side.

Reads the extension list from projects.json (single source of truth), fetches
each extension's stats from shields.io, and writes a ready-to-serve stats.json
into the web root. The client then reads same-origin data instead of calling
shields.io itself -- no rate-limit flakiness on the visitor's side.

Runs hourly from cron; safe to run by hand. It never blanks previously-good
data: fresh values are merged OVER the last written snapshot (these metrics only
grow or appear-and-stay), so a flaky shields.io response can't make a field
disappear. If projects.json can't be read or no IDs are found, it aborts without
touching the existing stats.json.

Kept deliberately to Python 3.5 syntax (no f-strings / timespec) because the
server's system interpreter is 3.5.3. Canonical copy lives in the repo at
ops/update-stats.py; deployed to /opt/ipershin-stats/update-stats.py.
"""
import json
import os
import re
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

WEBROOT = "/var/www/pershin.me"
PROJECTS = os.path.join(WEBROOT, "projects.json")
OUT = os.path.join(WEBROOT, "stats.json")
SHIELDS = "https://img.shields.io/chrome-web-store/{ep}/{ext}.json"
ENDPOINTS = ("users", "rating", "rating-count", "v")
EXT_ID_RE = re.compile(r"/detail/[^/]+/([a-p]{32})")
TIMEOUT = 15


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def log(msg):
    print("[{}] {}".format(now_iso(), msg), flush=True)


def fetch_value(ep, ext_id):
    url = SHIELDS.format(ep=ep, ext=ext_id)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ipershin-stats/1.0"})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            if resp.getcode() != 200:
                return None
            # Python 3.5's json.loads needs str, and urllib yields bytes.
            body = resp.read().decode("utf-8")
            return json.loads(body).get("value")
    except Exception as exc:  # any failure just means "no value this run"
        log("  {} for {}: {}".format(ep, ext_id, exc))
        return None


def digits(value):
    only = re.sub(r"[^\d]", "", value or "")
    return int(only) if only else None


def parse_ext(ext_id):
    raw = {ep: fetch_value(ep, ext_id) for ep in ENDPOINTS}
    out = {}
    users = digits(raw.get("users"))
    if users is not None:
        out["users"] = users
    rating = raw.get("rating")
    if rating is not None:
        try:
            out["rating"] = float(str(rating).split("/")[0])
        except ValueError:
            pass
    count = digits(raw.get("rating-count"))
    if count is not None:
        out["ratingCount"] = count
    version = raw.get("v")
    if version:
        out["version"] = str(version).lstrip("v")
    return out


def load_prev_stats():
    try:
        with open(OUT, encoding="utf-8") as fh:
            data = json.load(fh)
        return data.get("stats", {}) if isinstance(data, dict) else {}
    except Exception:
        return {}


def main():
    try:
        with open(PROJECTS, encoding="utf-8") as fh:
            projects = json.load(fh)
    except Exception as exc:
        log("cannot read {}: {}; aborting without touching stats.json".format(PROJECTS, exc))
        return 1

    ext_ids = []
    for project in projects:
        match = EXT_ID_RE.search(project.get("url", "") or "")
        if match and match.group(1) not in ext_ids:
            ext_ids.append(match.group(1))
    if not ext_ids:
        log("no extension ids found in projects.json; aborting")
        return 1

    prev = load_prev_stats()
    stats = {}
    for ext_id in ext_ids:
        fresh = parse_ext(ext_id)
        merged = {**prev.get(ext_id, {}), **fresh}  # last-known-good wins where fresh is missing
        stats[ext_id] = merged
        log("{}: fresh={} merged={}".format(ext_id, fresh, merged))

    payload = {"updatedAt": now_iso(), "stats": stats}

    fd, tmp = tempfile.mkstemp(dir=WEBROOT, prefix=".stats.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, separators=(",", ":"))
        os.chmod(tmp, 0o644)
        os.replace(tmp, OUT)  # atomic: nginx never sees a half-written file
    except Exception as exc:
        log("write failed: {}".format(exc))
        try:
            os.unlink(tmp)
        except OSError:
            pass
        return 1

    log("wrote {} for {} extension(s)".format(OUT, len(stats)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
