# Decision: Launch Plan for Secure Pride Landing Page

**Date**: 2026-01-11  
**Category**: Security | Architecture | Privacy | Accessibility  
**Decision ID**: DECISION-001

## Context
- Need to launch the Secure Pride landing page after purchasing securepride.org via Cloudflare registrar.
- Goals: privacy-first, zero telemetry, fast, accessible, minimal maintenance, clear call-to-action for trust and contact.
- Constraints: protect LGBTQ+ users; avoid any data collection, tracking, or third-party sharing; keep operational overhead low.

## Options Considered

**Option A: Cloudflare Pages (static site) + Cloudflare DNS**
- Pros: Simple, fast CDN; auto HTTPS; integrates with Cloudflare DNS; no servers; supports custom headers; easy cache purge; low cost.
- Cons: Build pipeline needed (but trivial with static export); Cloudflare-level logs exist (can be minimized but not fully disabled).

**Option B: GitHub Pages (static) + Cloudflare DNS proxy**
- Pros: Very simple; leverages existing GitHub repo; low cost; easy to publish.
- Cons: Two control planes (GitHub + Cloudflare); need to tune headers in repo; potential mixed caching rules; slightly more steps for TLS/redirects.

**Option C: Minimal VPS / container with Nginx serving static files**
- Pros: Full control over headers/logging; offline-friendly build.
- Cons: Highest ops surface; patching and maintenance; more potential attack surface; not justified for a static landing page.

## Decision
Choose **Option A: Cloudflare Pages (static) with Cloudflare DNS** for the landing page.

## Rationale
- **Privacy-first**: Static content, no telemetry, no cookies, no third-party embeds; can disable/strip query logging at app layer; minimizes data exhaust.
- **Security**: Cloudflare-managed TLS (TLS 1.3), HSTS, CSP, no origin server to attack; least exposed surface.
- **Simplicity & cost**: Low maintenance; easy deploys from Git; fast global CDN.
- **Accessibility & performance**: Static pages make it easy to meet low-cognitive-load, high-contrast, fast-load requirements.

## Implementation Plan
1. **Repo & branch**: Use existing GitHub repo (`mazze93/Secure-Pride`); create `landing/` or `site/` directory with static build (e.g., plain HTML/CSS or static export from Astro/Next static mode—no SSR, no JS unless essential).
2. **Content**: Craft privacy-first landing copy. Contact is handled via a form backed by Cloudflare Email Workers (no third-party processor) delivering to Proton — see DECISION-003. No analytics/trackers. If metrics are ever needed, prefer self-hosted, anon-only tooling, but default to none.
3. **Headers**: Add `_headers` file (or equivalent) for Cloudflare Pages to set:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: same-origin`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()`
4. **Assets**: Self-host all fonts (sans-serif, high contrast), icons, and images. No external CDNs. Keep images small; provide alt text.
5. **Build & deploy**: Configure Cloudflare Pages to build from `main`, output directory (e.g., `dist/` or `site/`); set production branch to `main`. Disable Cloudflare Analytics.
6. **DNS**: In Cloudflare DNS, set CNAME for `securepride.org` / `www` to Cloudflare Pages target; enable proxy for HTTPS; ensure AAAA/IPv6 works.
7. **Redirects**: Force HTTPS and apex → www or vice versa; add `_redirects` file as needed.
8. **Testing**: Validate locally (`npm run build && npm run preview` or `npx serve site`); run `npx lighthouse` for performance/accessibility; check headers via `curl -I https://securepride.org`.
9. **Post-launch**: Monitor for errors only (no user tracking); periodic security review of headers and dependencies (if any toolchain is used).

## Outcome (to be updated after launch)
- Deployed to Cloudflare Pages with custom domain.
- Headers verified; no telemetry present.
- Accessibility and performance checks documented.
