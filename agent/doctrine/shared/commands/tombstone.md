Tombstone the specified repository using the purge-and-remove protocol.

Usage: /tombstone <owner/repo> [superseded-by]

If no superseded-by is given, use NONE.

## Protocol

If the user says "tombstone" with no qualifier, treat it as `purge-and-remove`.
Use `tombstone-only` only if the user explicitly says to keep the rest of the repo.

### Workflow

1. Inspect the repo and determine the active replacement repo or `NONE`.
2. Identify any concepts/files worth salvaging.
3. Clone the repo to a temp directory.
4. Delete everything except `.git`.
5. Write a tombstone `README.md`:

```
# DEFUNCT

This repository is defunct as of YYYY-MM-DD.

Superseded by: `owner/repo` or `NONE`

ARCHIVE_STATUS: DEFUNCT
SUPERSEDED_BY: owner/repo or NONE
REVIEWED_ON: YYYY-MM-DD

Do not continue feature work here.
```

If there are recovery breadcrumbs, append:

```
If anything needs to be recovered, use Git history and inspect:
- `path/to/file`
```

6. Stage all changes, commit with message: `Tombstone: repository is defunct`
7. Push. If push fails, do NOT remove the local clone.
8. Only after push succeeds, remove the local clone.

### Final Report

After tombstoning, state:
- Whether anything should be merged into the replacement repo
- Mode used (purge-and-remove or tombstone-only)
- Whether the push succeeded
- Whether the local clone was removed
- Any leftovers worth salvaging
