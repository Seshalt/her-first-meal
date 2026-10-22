# Her First Meal launch audit

Working audit, 2026-10-22. Stripe deliberately deferred by owner.

## Repair and verification queue

- [x] Open production in cloud browser; confirm homepage renders.
- [x] Confirm correct Vercel project, READY deployment and domain assignment.
- [x] Restore source from GitHub after workspace maintenance.
- [x] Inspect intended Neon project; production schema is empty.
- [x] Create isolated Neon migration-test branch.
- [x] Validate all 13 migrations on isolated branch.
- [x] Apply migrations to intended HFM production database.
- [x] Configure dedicated HFM database connection on Vercel (production and isolated preview, separate direct migration connections).
- [ ] Verify production reads the intended database.
- [ ] Audit public navigation, images, social links and contact links.
- [ ] Audit membership controls and non-payment checkout states.
- [ ] Audit signup/login/logout, verification, reset and admin MFA.
- [ ] Audit forms and errors; test transactional delivery when configured.
- [ ] Audit all member rooms, persistence, permissions and empty states.
- [ ] Complete locale packs and remaining hardcoded customer-facing English.
- [ ] Verify all 18 language options and Arabic RTL.
- [ ] Verify mobile layout, keyboard access and reduced motion.
- [ ] Verify privacy/terms/cookies/accessibility/sitemap/robots.
- [ ] Run typecheck, lint, tests, production build, dependency audit.
- [ ] Deploy repaired code and recheck production.

## Observations

- Latest deployed source: 643b71019f20600129cb1c40979f1999ef971807.
- Production domain is verified and assigned to her-first-meal-now.
- Intended HFM database: square-night-10002358; production br-empty-meadow-b44ng17x.
- Migration test branch: br-lucky-firefly-b4isu7nz.
- Public homepage and pricing render. Pricing is $49 monthly, $490 yearly, $120 private session and $1,500 doula service.
- Homepage Instagram fallback and loaded-site Instagram disagree; inspect before changing.
- About photo alt text does not describe the rendered photo; inspect stored defaults.
- Browser changes locale chrome, but major customer-facing page content remains English.
- Production variable inventory has no RESEND_API_KEY or MAIL_FROM.

## Deferred owner/external tasks

- Stripe connection and payment tests: owner explicitly deferred.
- Attorney review of Privacy Policy and Terms.

## Repairs completed in source

- Owner bootstrap requires a private setup key on persistent/production databases; absent key fails closed.
- Shared admin authorization now checks MFA for visual edits, copy drafts, and the private support inbox.
- Paid member APIs enforce membership and email verification on the server.
- Unverified email addresses cannot automatically claim paid memberships.
- Member gate and login no longer allow email-factor lookup failures to bypass verification.
- Public contact submissions are rate limited.
- Meal planning no longer removes dietary restrictions to fill a plan, honors saved allergies/avoids, rejects incompatible swaps, and keeps appliance constraints when few recipes match.
- Unknown allergies fail closed pending review; empty/error meal states are explicit in all 18 supported languages.
- Recipe cooking instructions updated for fish, eggs and poultry temperatures using FDA/CDC pregnancy food-safety guidance.
- Cantonese browser-language detection runs before generic Chinese detection.
- Unconfigured preview OAuth providers are hidden in production; email/password auth remains active.
- Dependency audit fixes applied; npm audit reports zero vulnerabilities.
- Launch dashboard checks migration history, including privacy and MFA migrations.

## Browser evidence

- Public service/legal pages: /doula, /nouri, /privacy, /terms, /cookies, /accessibility rendered; no detected broken images or desktop horizontal overflow.
- Empty contact form invokes required-field validation.
- All 18 language selections switch the contact heading; Arabic dir=rtl. Doula copy stays English in every non-English selection.
- Login and password-reset pages render. Authenticated flows require owner-controlled sign-in/verification and were not bypassed.
- Resend origin access was rejected by automatic approval review due to usage limit. The existing HFM tab remained available.
- Browser console captured extension errors from chrome-extension://; these are not classified as application errors.

## Verification gates

- TypeScript passed after access-control changes; final rerun pending deployment.
- Unit/security tests: 44 passed (6 source/security checks + 38 behavior tests).
- Production build passed locally; local migration step correctly skipped without secrets. Production migration history verified via Neon connector.
- Full language conversion, authenticated member/browser tests and mobile browser verification remain open. Do not claim full audit or launch readiness.
