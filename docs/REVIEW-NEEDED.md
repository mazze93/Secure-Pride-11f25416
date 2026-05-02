# Files Needing Local Review

These files were **untracked from git** on 2026-05-02 (branch `chore/repo-hygiene`) and are **still on your disk** — nothing was deleted. Work through each item below, then decide whether to archive, move to a secrets manager, or discard.

---

## Sensitive Legal / Financial Documents

### `docs/501(c)(3)-bundle.zip`
**Why untracked:** Contains IRS filings or incorporation docs — sensitive legal material that must not live in a public (or even private) repo.  
**Action:** Move to an encrypted drive, a password manager's secure notes, or a private cloud vault (e.g. Proton Drive). Verify it is not needed for any CI/CD workflow.

### `docs/Secure Pride Grant Materials.pdf`
**Why untracked:** Strategic grant applications may contain SOGI-adjacent org data and financial projections. Not for version control.  
**Action:** Same as above — encrypted vault. If any content from this PDF needs to be referenced in code, extract only the non-sensitive portions into a markdown file.

### `docs/certificate+signing.zip`
**Why untracked:** Likely contains signing certificates or key material. These should never be committed under any circumstances.  
**Action:** Verify contents. If it contains private keys or CSRs, rotate them and store new material in a secrets manager (e.g. 1Password, Bitwarden, or Cloudflare Secrets). If it contains only public certificates, it may be safe to re-add — verify first.

---

## CI / Infrastructure Bundles

### `dockerhub-token-ci-pack.zip`
**Why untracked:** Name implies CI credentials. Even if the actual token is not inside, zipped CI packs can expose workflow patterns that aid attackers.  
**Action:** Unzip and inspect. If a Docker Hub token or any API key is present, **revoke it immediately** at hub.docker.com → Account Settings → Security. Replace with a CI secret variable (GitHub Actions `secrets.DOCKERHUB_TOKEN`).

---

## Stale / Orphaned Archives

### `securepride-landing-bundle.zip`
**Why untracked:** Old deployment snapshot — superseded by the live Cloudflare Pages deployment.  
**Action:** If you need to preserve it for historical reference, keep it on disk but do not re-add to git. If it is truly stale, delete it.

---

## Orphaned Source Files

### `securepride-document-engine.jsx`
**Why untracked:** Root-level orphan that duplicates the version inside `docs/`. Having two copies creates divergence risk.  
**Action:** Compare with `docs/securepride-document-engine.jsx` (if it exists). Delete the root copy if they are identical, or consolidate into the correct location and remove the root copy.

---

## Staging Artefacts

### `assets/incoming-2026-03-04/SecurePride Stonewall.png`
**Why untracked:** The `assets/incoming-*/` pattern is a staging inbox — files here should be imported and cleared, not persisted in version control.  
**Action:** If this image is needed by the site, move it to `assets/images/` (or wherever production assets live) and reference it properly. Then delete the `incoming-2026-03-04/` directory.

---

## Local Machine Config

### `.claude/launch.json`
**Why untracked:** Contains absolute paths specific to your local machine. Committing it breaks the setup for any other contributor and exposes your filesystem layout.  
**Action:** No action needed on disk — this file is safe to keep locally. The `.gitignore` rule `.claude/` will prevent it from being accidentally re-added.

---

## Next Steps

1. Work through the action items above.
2. For any file you decide to permanently delete, do so from the filesystem (Finder or `rm`).
3. For any file you want to track again after review, explicitly `git add <file>` — the `.gitignore` rules will remind you to think twice.
4. Delete this file once the review is complete: `rm docs/REVIEW-NEEDED.md && git rm docs/REVIEW-NEEDED.md`.
