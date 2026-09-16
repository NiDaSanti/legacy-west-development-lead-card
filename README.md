# Legacy West — Project Information Form

A lead-capture web form for Legacy West Development that submits directly into **Close CRM**. Built as a split architecture: a static React frontend (Netlify) and a small Express API (Render) that holds the Close API credentials securely.

Live: frontend on Netlify, API on Render (see [Deployment](#deployment) for URLs/config).

> 👋 **Not a developer?** See [`OWNER_GUIDE.md`](./OWNER_GUIDE.md) for a plain-language explanation of how this system works.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Form Fields & Validation](#form-fields--validation)
- [SMS/Text Consent Compliance](#smstext-consent-compliance)
- [Close CRM Integration](#close-crm-integration)
- [Security](#security)
- [Deployment](#deployment)
- [Scaling & Future Work](#scaling--future-work)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────┐        HTTPS         ┌──────────────────┐        HTTPS        ┌───────────┐
│   Browser    │ ───────────────────▶ │  Express API      │ ──────────────────▶ │ Close CRM │
│ (React/Vite) │ ◀─────────────────── │  (server.js)       │ ◀────────────────── │   API     │
│  on Netlify  │      JSON            │  on Render         │       JSON          └───────────┘
└─────────────┘                      └──────────────────┘
```

- The **frontend never talks to Close directly** and never holds the Close API key.
- The **Express API is the only thing that knows `CLOSE_API_KEY`**, and it's stored as a Render environment variable — never committed to git.
- CORS on the API is restricted to the deployed Netlify origin in production (`ALLOWED_ORIGIN`).
- The API rate-limits submissions per IP to reduce spam/abuse risk.

This split means the frontend can be redeployed, rebuilt, or even swapped out (e.g., for a different framework) without ever touching the Close credentials, and the backend can be reused by other clients (mobile app, another internal tool, etc.) in the future.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Material UI (MUI) 9 |
| Backend | Node.js, Express 4 |
| CRM | [Close CRM REST API](https://developer.close.com/) |
| Hosting (frontend) | Netlify |
| Hosting (backend) | Render |
| Rate limiting | `express-rate-limit` |

---

## Project Structure

```
my-app/
├── src/
│   ├── App.jsx          # Main form component (fields, validation, submit handler)
│   ├── App.css
│   ├── main.jsx          # React root, MUI ThemeProvider + custom theme
│   └── index.css
├── public/               # Static assets (favicon, icons, manifest)
├── api/
│   └── create-lead.js    # Legacy/alternate serverless handler (not currently deployed;
│                          # kept for reference — see note in Deployment section)
├── server.js              # Express API — the only service that calls Close CRM
├── index.html
├── vite.config.js         # Dev server + /api proxy to localhost:3001
├── netlify.toml           # Netlify build config (frontend)
├── render.yaml            # Render service config (backend)
├── .env.example           # Documents all required env vars
└── package.json
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A Close CRM API key ([Settings → API Keys](https://app.close.com/settings/api/))

### Setup

```bash
npm install
cp .env.example .env
# edit .env and set CLOSE_API_KEY
```

### Run

Two processes run locally:

```bash
# Terminal 1 — the API (port 3001)
npm run server

# Terminal 2 — the frontend (port 5173)
npm run dev
```

Vite's dev server proxies any request to `/api/*` to `http://localhost:3001` (see `vite.config.js`), so the frontend code always just calls a relative `/api/create-lead` path and works identically in dev and prod.

Visit `http://localhost:5173` to use the form.

### Build

```bash
npm run build     # outputs static site to dist/
npm run preview   # preview the production build locally
```

---

## Environment Variables

| Variable | Used by | Required | Description |
|---|---|---|---|
| `CLOSE_API_KEY` | `server.js` (Render) | ✅ Always | Your Close CRM API key. Used as HTTP Basic Auth username with a blank password. |
| `ALLOWED_ORIGIN` | `server.js` (Render) | Production only | Restricts CORS to your deployed frontend's exact origin (e.g. `https://your-site.netlify.app`). Falls back to allow-all if unset (fine for local dev). |
| `VITE_API_URL` | `src/App.jsx` (Netlify, build-time) | Production only | Base URL of the deployed Render API (e.g. `https://your-api.onrender.com`), no trailing slash. Baked into the JS bundle at build time — **changing it requires a redeploy**, not just a config change. |
| `PORT` | `server.js` (Render) | Auto-set by Render | Render injects this automatically; don't set manually. |

See `.env.example` for a ready-to-copy template.

---

## Form Fields & Validation

All fields are validated **client-side** (`validate()` in `App.jsx`) before submission, giving immediate feedback:

| Section | Fields | Notes |
|---|---|---|
| Submitted By | Team member (dropdown) | Required. Remembered in `localStorage` for future visits. Recorded in the lead's description in Close so it's clear who logged each lead. |
| Contact Information | Name, Phone, Email, SMS Consent (checkbox) | Phone validated via regex (`7–20` digits/symbols); email validated via standard pattern. SMS consent checkbox is required — see [SMS/Text Consent Compliance](#smstext-consent-compliance) below. |
| Property Address | Street, City, State, Zip | State must be a 2-letter code; zip validated as `12345` or `12345-6789`. |
| Project Details | 4 yes/no radio questions | Increase home size, started plans/engineering, add ADU, add backup generator. |
| Altadena Fire Recovery | 3 yes/no radio questions | Affected by fires, consulted on rebuilding options, planning to rebuild. |
| Notes | Free text | Optional. |

> **Note:** Validation currently exists client-side only. See [Scaling & Future Work](#scaling--future-work) for hardening plans.

---

## SMS/Text Consent Compliance

Since the form collects phone numbers with intent to text leads, it includes a **required SMS consent checkbox** to comply with TCPA/10DLC carrier requirements for webform opt-in (as opposed to verbal opt-in, which requires reading a disclosure script out loud instead).

**Where it lives:**
- UI: `src/App.jsx` — a required `Checkbox` in the Contact Information section, right after Phone/Email
- Validation: enforced **both** client-side (`validate()` in `App.jsx`) and server-side (`server.js`) — the API will reject a submission with `smsConsent: false` even if called directly, bypassing the form
- Audit trail: every lead's description in Close includes a line like:
  ```
  SMS consent: given (webform checkbox, 2026-09-15T22:51:24.754Z)
  ```
  This timestamp is generated server-side (`server.js`) at the moment the lead is created, so there's a permanent record of when consent was captured for every lead.

**The checkbox label includes all 5 required disclosure points:**
1. Opt-in confirmation ("I consent to receive text messages...")
2. Message frequency varies
3. Message and data rates may apply
4. Reply STOP to opt out at any time
5. A link to the Privacy Policy

⚠️ **Action item:** The Privacy Policy link currently points to a placeholder URL (`https://legacywestdevelopment.com/privacy`) in `src/App.jsx`. **Confirm this is correct or update it** before relying on this for compliance — an incorrect/broken privacy policy link could itself be a compliance issue.

If Close's US Compliance settings (`Settings → US Compliance` in the Close dashboard) are ever changed from "Webform" back to "Verbally," this checkbox approach would need to be reconsidered, since verbal consent requires the disclosure to be read aloud by staff rather than self-checked by the customer.

---

## Close CRM Integration

`server.js` builds a Close **Lead** payload from the submitted form:

- `name` → lead name (falls back to street address, then a generic label)
- `contacts[0]` → one contact with phone (`type: mobile`) and email (`type: office`)
- `addresses[0]` → full structured address (`address_1`, `city`, `state`, `zipcode`, `country: 'US'`)
- `description` → a plain-text summary combining "Submitted by," SMS consent + timestamp, the yes/no answers, and any notes

**Auth:** Close uses HTTP Basic Auth with the API key as the username and an empty password:
```js
Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
```

**Known Close API limitation:** the Lead object has **no owner/assignment field** (`assigned_to` is not supported on leads via this endpoint — confirmed by testing). This is why "Submitted By" is recorded in the description text rather than as a native Close field/badge.

---

## Security

- **API key isolation** — `CLOSE_API_KEY` only ever lives in Render's environment variables; the browser never sees it.
- **CORS lockdown** — production `ALLOWED_ORIGIN` restricts which origins can call the API via the browser (does not stop direct `curl`/script access — see below).
- **Rate limiting** — `/api/create-lead` is limited to 5 requests per IP per 10-minute window (`express-rate-limit`), configured with `trust proxy` enabled since Render sits behind a proxy/CDN.
- **HTTPS everywhere** — both Netlify and Render serve over HTTPS by default.

**What this does *not* protect against** (see [Scaling & Future Work](#scaling--future-work) for planned hardening):
- Direct API abuse via `curl`/Postman (CORS only restricts *browser* requests)
- Malicious/garbage payloads sent straight to the API, bypassing the frontend's validation
- Basic bot spam beyond what rate limiting catches (no CAPTCHA/honeypot yet)

---

## Deployment

### Backend — Render

- **Root Directory:** leave blank (the git repo root already *is* `my-app`'s contents)
- **Build Command:** `npm install`
- **Start Command:** `npm run start` (equivalent to `node server.js`)
- **Environment variables:** `CLOSE_API_KEY`, `ALLOWED_ORIGIN`
- Config lives in `render.yaml`

### Frontend — Netlify

- **Base directory:** leave blank
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_URL` (must point to the Render URL, no trailing slash)
- Config lives in `netlify.toml`, including an SPA fallback redirect (`/* → /index.html`)

> ⚠️ **Vite env vars are build-time, not runtime.** If you change `VITE_API_URL` on Netlify, you must trigger a new deploy for it to take effect — updating the env var alone does nothing until a rebuild happens.

### Deploy checklist (first time / new environment)

1. Deploy the Express API to Render, set `CLOSE_API_KEY`.
2. Confirm `GET /health` on the Render URL returns `{"status":"ok"}`.
3. Deploy the frontend to Netlify with `VITE_API_URL` set to the Render URL.
4. Set `ALLOWED_ORIGIN` on Render to the live Netlify URL, then redeploy Render.
5. Submit a real test lead end-to-end and confirm it appears in Close CRM.

---

## Scaling & Future Work

This project is intentionally small today (single shared API key, one static form, no database), but the architecture leaves room to grow:

- **Multiple forms / lead sources** — the Express API can gain more routes (e.g. `/api/create-lead-referral`, `/api/create-lead-partner`) without touching the frontend's deployment, since they're decoupled services.
- **Server-side validation** — port the same rules from `App.jsx`'s `validate()` into `server.js` so the API rejects bad data even when called directly, not just from the form.
- **Bot protection** — add a honeypot field and/or a CAPTCHA (e.g. hCaptcha/Turnstile) in front of `/api/create-lead`.
- **Per-user Close identity** — if Close adds lead-owner support via API in the future, or if per-user API keys become worthwhile, the `submittedBy` dropdown already captures which team member is submitting — this can be wired directly to a real Close user assignment at that point.
- **Persistent logging/analytics** — currently there's no database; every submission goes straight to Close. A lightweight log (e.g. a Postgres table on Render, or a simple webhook to a logging service) could be added for auditing/analytics without disrupting the existing flow.
- **Multi-environment config** — `render.yaml` and `netlify.toml` support adding staging environments (e.g. a `staging` branch deploy) by duplicating the service config with different env vars.
- **TypeScript** — the codebase is small enough that migrating `src/` to TypeScript (Vite has first-class support) would be low-risk and improve safety as more fields/logic are added.
- **Testing** — no automated tests exist yet. Given the API's simplicity, a small Vitest/Supertest suite for `server.js`'s validation and payload-building logic would be a high-value first addition.

---

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| `OPTIONS` request returns 404 in production | Wrong Render URL configured in `VITE_API_URL`, or the Render service isn't actually running (check Render logs for "Your service is live"). |
| CORS error in browser console | `ALLOWED_ORIGIN` on Render doesn't exactly match the Netlify URL (check for trailing slashes / http vs https). |
| Frontend still hitting old API URL after changing env var | Netlify env vars are build-time only — trigger a new deploy after changing `VITE_API_URL`. |
| `401 Unauthorized` from Close | `CLOSE_API_KEY` is missing, malformed, or has a stray character (check Render's env var value carefully, e.g. no accidental duplication). |
| `429 Too Many Requests` | Rate limiter triggered (5 requests/10 min per IP) — expected behavior, not a bug. |
| Lead created but address fields empty in Close | Confirm the `addressStreet` / `addressCity` / `addressState` / `addressZip` fields are all being sent — Close expects a structured `addresses` array, not a single free-text field. |

---

## License

See [LICENSE](./LICENSE).

