# broker-deploy

Public GitHub Actions broker for allowlisted Mullmania deploys.

The repository is intentionally small. The public workflow accepts a site id,
validates it against a private JSON allowlist stored in repository secrets,
downloads the matching private repository archive, and runs the canonical
Mullmania deploy script with AWS OIDC.

No AWS keys live here. No target repository list is checked into this repo.

The protected Sites API can also receive signed GitHub push webhooks from
allowlisted source repositories. Those hooks dispatch this broker workflow, so
private repos do not need their own GitHub Actions runners to redeploy after a
normal check-in.
