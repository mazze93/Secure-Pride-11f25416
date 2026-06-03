# DECISION-003: Contact Form Email Delivery

**Status**: Approved  
**Date**: 2026-06-03  
**Authority**: Tier 1 (Autonomous — infrastructure within existing platform)  
**Decision maker**: @mazze93  

## Context

The site has a contact form (`ContactForm.tsx`) that POSTs to `/api/contact`. The form needs to deliver submissions to the operator's inbox. The operator uses Proton Mail for all Secure Pride email (`hello@securepride.org`, `security@securepride.org`, `mazze@securepride.org`) and the site is deployed on Cloudflare Pages.

## Options Considered

**Option A: Resend (transactional email API)**
- Pros: Simple API key, widely used, reliable delivery, generous free tier
- Cons: US-based third party processes every form submission; adds a vendor relationship; inconsistent with "no third-party data sharing" principle

**Option B: Proton SMTP via Proton Bridge**
- Pros: Stays within Proton's infrastructure
- Cons: Proton Bridge is a desktop app — cannot be used from a serverless function; not viable

**Option C: Cloudflare Email Workers + Email Routing (send_email binding)**
- Pros: No new vendor; stays entirely within existing Cloudflare account; routes directly to Proton inbox; no API keys to manage; consistent with privacy-first posture; operator already uses this pattern for mazzeleczzare.com
- Cons: Requires Email Routing enabled on securepride.org (already available free on CF); slightly more wrangler config than an API key

## Decision

Use **Option C: Cloudflare Email Workers** via the `send_email` binding.

## Rationale

The project's non-negotiable is no third-party data sharing. Every contact form submission contains a name, email address, and message — routing that through a US third party (Resend) contradicts the core principle even if the submission is not SOGI data.

Cloudflare Email Routing keeps the data within the operator's existing CF account and delivers to Proton, which is already trusted for all org email. There is no new vendor relationship, no API key to rotate, and no additional surface area. The operator has already implemented this pattern successfully.

## Implementation

**`functions/api/contact.ts`** — Cloudflare Pages Function (replaces `api/contact.ts` which used `@vercel/node`)
- Imports `EmailMessage` from `cloudflare:email`
- Builds a raw MIME message (no external library; plain `TextEncoder` + `ReadableStream`)
- Sends FROM `contact-form@securepride.org` TO `hello@securepride.org` with `Reply-To` set to the submitter's address so replies go directly to them
- Falls back to a `CONTACT_ENDPOINT` env var if `SEND_EMAIL` binding is absent
- Falls back to console log for local dev

**`wrangler.toml`**
```toml
[[send_email]]
name = "SEND_EMAIL"
destination_address = "hello@securepride.org"
```

## Setup Required (one-time, in CF dashboard)

1. **Email Routing** — confirm enabled on securepride.org (Workers & Pages → Email → Email Routing)
2. **Destination address** — verify `hello@securepride.org` as a destination address in Email Routing
3. **Sending address** — add `contact-form@securepride.org` as an allowed sending address, or configure it as a custom address in Email Routing

No secrets, no API keys, no dashboard env vars needed beyond what wrangler.toml already defines.

## Consequences

- Contact form submissions arrive in Proton inbox as emails from `contact-form@securepride.org`
- Replying to the email goes directly to the submitter (Reply-To header)
- No third-party processes submission data
- If Email Routing is misconfigured, the function returns a 502 and logs the error — no silent data loss
