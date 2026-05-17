# broker-deploy

Public GitHub Actions broker for allowlisted Mullmania deploys.

See [docs/usage.md](docs/usage.md) for registration and redeploy examples.

The repository is intentionally small. The public workflow accepts a site id,
asks the protected Sites API for the matching allowlisted target, downloads the
matching private repository archive, and runs the canonical Mullmania deploy
script with AWS OIDC.

No AWS keys live here. No target repository list is checked into this repo or
duplicated in broker secrets.

The broker keeps only two repository secrets:

- `MULLMANIA_BROKER_API_KEY`: lets the workflow ask the Sites API for one
  allowlisted target at runtime.
- `MULLMANIA_PRIVATE_REPO_TOKEN`: lets the workflow download the private source
  repository archive for that target.

The protected Sites API can also receive signed GitHub push webhooks from
allowlisted source repositories. Those hooks dispatch this broker workflow, so
private repos do not need their own GitHub Actions runners to redeploy after a
normal check-in.

After the AWS publish succeeds, the workflow mirrors the public artifact from
S3 into this repository's `gh-pages` branch under the site id. The mirror uses
the already-published files, not the private source checkout.

The `gh-pages` root is a read-only transparency page. It lists public mirror
URLs, publish times, and broker run links without publishing private source
repository names, target store contents, secrets, or raw webhook payloads.
