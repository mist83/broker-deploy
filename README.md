# broker-deploy

Public GitHub Actions broker for allowlisted Mullmania deploys.

The repository is intentionally small. The public workflow accepts a site id,
validates it against a private JSON allowlist stored in repository secrets,
downloads the matching private repository archive, and runs the canonical
Mullmania deploy script with AWS OIDC.

No AWS keys live here. No target repository list is checked into this repo.

