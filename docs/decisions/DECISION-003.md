# DECISION-003: Contact Form Email Delivery

**Status**: Approved  
**Date**: 2026-06-03  
**Authority**: Tier 1 (Autonomous — no server infrastructure, no data collection)  
**Decision maker**: @mazze93  

## Context

The site has a contact form (`ContactForm.tsx`) that needs to deliver submissions
to the operator's inbox. The operator uses Proton Mail with `securepride.org` as
a **custom domain** — Proton holds the MX records (`mail.protonmail.ch`,
`mailsec.protonmail.ch`) and SPF record for the domain.

## Options Considered

**Option A: Resend (transactional email API)**
- Cons: US-based third party processes every submission; new vendor relationship;
  contradicts "no third-party data sharing" principle.

**Option B: Cloudflare Email Workers (`send_email` binding)**
- Explored as the primary path given existing CF infrastructure.
- Blocked: CF Email Workers requires CF Email Routing to own the domain's MX
  records. Enabling it would require deleting the Proton MX records, which would
  break all `@securepride.org` custom domain email managed through Proton.
  Not viable without a full email migration.

**Option C: `mailto:` — client-side compose, no server**
- The contact form fields (name, email, org, message) are composed client-side.
- On submit, `window.location.href` is set to a pre-filled `mailto:hello@securepride.org`
  URL. The user's own email client opens and sends the message from their address.
- No data touches a server. Reply-To is automatic (sender's own email).
- Fully consistent with the privacy-first posture.

## Decision

Use **Option C: client-side `mailto:` compose**.

## Rationale

No server processes submission data — the data never leaves the user's device
until they send from their own email client. This is the strongest possible
privacy outcome. It also has zero infrastructure dependencies, zero ops overhead,
and works regardless of how the domain's MX records are configured.

The trade-off (requires the user to have an email client configured) is
acceptable for this audience.

## Implementation

**`src/components/ContactForm.tsx`**
- Removed: server `fetch` to `/api/contact`, honeypot, consent checkbox,
  loading/success states, `@vercel/node` dependency
- Added: `mailto:` URL construction from form fields on submit; plain validation
  error state only; disclosure note ("opens your email client, no data sent to
  a server")
- Button label: "Open in email client →"

**`functions/api/contact.ts`** — removed (no longer needed)

**`wrangler.toml`** — no `send_email` binding (not applicable)

## Consequences

- Zero server-side contact form infrastructure to maintain or secure
- `hello@securepride.org` Proton custom domain setup is undisturbed
- `mailto:hello@securepride.org` direct link (already in Contact section)
  serves as a second path for users who prefer not to use the form
