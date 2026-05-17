---
name: mullmania.com S3 access logs
description: S3 server access logging destination for the unified mullmania.com hosting bucket — where to look when a site prefix mysteriously empties
type: reference
originSessionId: 308bea7b-53b9-4d70-a841-9381fbfef15b
---
Server access logging is enabled on `s3://mullmania.com/` as of 2026-04-18.

**Log destination:** `s3://mullmania.com-access-logs/s3-access/`
**Lifecycle:** objects expire after 30 days (trivially cheap)
**Region:** us-west-2
**Account:** 166404899495

Log format is standard S3 server access log (space-delimited). The fields that matter when a prefix goes missing:
- `Time` — when the request hit
- `Remote IP` — who issued it
- `Requester` — IAM principal ARN (if auth'd)
- `Operation` — look for `REST.DELETE.OBJECT` or `BATCH.DELETE.OBJECT`
- `Key` — which prefix was hit

To inspect after an incident:
```
aws s3 ls s3://mullmania.com-access-logs/s3-access/ --recursive
# grep the logs for DELETE operations in a time window
```

Access logs are delivered best-effort within a few hours, not real-time. Not a substitute for CloudTrail data events, but the cheap alternative — and the only audit trail currently on the bucket (no versioning, no CloudTrail data events per operator preference).

Context — why this exists: 2026-04-18 incident where ~120 published-then-vanished site prefixes disappeared from `s3://mullmania.com/` with no S3-side forensics available (bucket had no versioning, no access logging, no CloudTrail data events). Codex's likely-cause read was the canonical deploy tool's default `deleteHosting: true` + an interrupted/repeated `--delete` sync. Access logging was added so a recurrence gets bracketed with a timestamp and principal.
