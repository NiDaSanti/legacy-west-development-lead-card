# Legacy West Lead Form — Owner's Guide

*A plain-language guide for Nick and George — no coding knowledge required.*

This document explains what this system does, how it works, and what to do if something goes wrong. If you ever need a developer to make changes, you can hand them the other file in this project (`README.md`), which has all the technical details.

---

## What Is This?

This is the **"Project Information Form"** — the form on your website where potential customers (or your team) enter details about a project, and that information gets sent straight into your **Close CRM** as a new Lead.

Think of it as: **someone fills out the form → a new Lead automatically appears in Close** with all their contact info, property address, and answers to your project questions.

---

## Where Everything Lives

There are two separate pieces to this system, hosted in two different places:

| Piece | What it does | Where it lives |
|---|---|---|
| **The Form (what customers see)** | The actual webpage with the fields people fill out | Netlify |
| **The "Delivery" Service** | The behind-the-scenes piece that takes the form data and safely delivers it to Close CRM | Render |

You don't need to think about these separately day-to-day — they work together automatically. But if something ever breaks, knowing there are "two parts" helps a developer figure out where to look.

---

## What Happens When Someone Submits the Form

1. A person visits the form and fills in their name, phone, email, property address, and answers a few yes/no project questions.
2. They select **who on your team is entering this lead** (a dropdown: Nicholas Santiago, George Limbrick, Aaron Carson, or Quinton Jones).
3. They click **Submit**.
4. Within a second or two, a brand new **Lead** shows up in your Close CRM account with all of that information — including a note at the top saying who submitted it.

No one has to manually copy/paste anything into Close. It happens automatically.

---

## The Secret Ingredient: Your Close API Key

To let this form talk to Close CRM automatically, it uses something called an **API Key** — think of it like a special password that lets the form "log in" to Close CRM on your behalf, without ever showing that password to whoever's filling out the form.

**This key is never visible to the public.** It's stored securely on the Render side (the "Delivery" service), completely hidden from anyone visiting the website.

⚠️ **If this key ever needs to change** (for example, if you regenerate it in Close for security reasons), a developer will need to update it in one place: Render's settings. The form itself never needs to change.

---

## Who Shows Up as "Submitted By"

When the form is filled out, whoever is submitting it picks their name from a dropdown list. That name gets written into the notes of the new Lead in Close, so you can always tell who logged it.

**Current list of names in the dropdown:**
- Nicholas Santiago
- George Limbrick
- Aaron Carson
- Quinton Jones

If someone new joins the team and needs to be added to this list (or someone needs to be removed), let a developer know — it's a quick change.

> **Why isn't this a proper "Lead Owner" in Close?** We looked into this — Close CRM's system doesn't currently support assigning an "owner" to a Lead through the connection we use. So instead, we made sure the name is clearly written in the notes every time, which achieves the same goal: you always know who added it.

---

## Basic Protections Already in Place

You don't need to do anything for these — they're already active:

- ✅ **Spam protection** — if someone (or some bot) tries to submit the form more than 5 times in a 10-minute window, it gets automatically blocked for a bit. This keeps fake/junk leads from flooding your Close CRM.
- ✅ **Secure connection** — everything sent through the form travels over an encrypted connection (the little padlock icon in the browser), so information can't be intercepted in transit.
- ✅ **Hidden credentials** — as mentioned above, your Close API key is never exposed to site visitors.

---

## If Something Goes Wrong

Here's what to check first, in plain terms, before calling in a developer:

### "The form won't submit / shows an error"
- Wait a minute and try again — sometimes the "Delivery" service (Render) briefly goes to sleep if it hasn't been used in a while, and takes a moment to wake back up.
- If it keeps failing, send a developer:
  - A screenshot of the error message
  - What information you entered (so it can be reproduced)

### "A lead never showed up in Close"
- Double check the correct email/phone was entered (typos can sometimes make things look "missing" when they're actually just filed under a different contact).
- If it's truly missing, let a developer know the approximate date/time it was submitted — they can check the delivery service's logs.

### "I need to add/remove a team member from the 'Submitted By' list"
- This is a quick code change — just tell a developer the name to add or remove.

### "We need to change something about the form questions or fields"
- Any wording changes, new fields, or removed fields require a developer to update the code — but these changes are usually quick and low-risk.

---

## Who to Contact

For any changes beyond what's listed above (redesigning the form, adding new features, connecting to another tool, etc.), reach out to whoever is currently managing the development for this project. They can reference the technical `README.md` file included in this same project for full setup details.

---

*Last updated: August 2026*
