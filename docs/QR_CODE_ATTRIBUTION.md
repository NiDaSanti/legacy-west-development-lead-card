# Per-Employee QR Code Attribution

The lead form now supports auto-attributing submissions to a specific team
member via a `?rep=` query parameter in the link. This is designed for
printed/physical QR codes (business cards, yard signs, truck decals, etc.)
so a client doesn't have to know or select an employee's name — it's done
automatically based on which rep's QR code they scanned.

## How it works

1. Each employee gets their own version of the form link with a `rep` query
   parameter set to a slugified version of their name (lowercase, spaces
   replaced with dashes).
2. When the form loads with that parameter, the "Submitted By" field is
   automatically filled in and locked (read-only) so it can't be
   accidentally changed.
3. If no `rep` parameter is present (e.g. someone just visits the base
   URL), the "Submitted By" dropdown behaves as before — manually
   selectable and required.

## Employee QR Code URLs

Replace `https://lwd-lead-card.netlify.app` with your actual production
Netlify URL if different.

| Team Member         | QR Code URL                                                              |
|----------------------|---------------------------------------------------------------------------|
| Nicholas Santiago     | `https://lwd-lead-card.netlify.app/?rep=nicholas-santiago`               |
| George Limbrick       | `https://lwd-lead-card.netlify.app/?rep=george-limbrick`                 |
| William J. Johnson    | `https://lwd-lead-card.netlify.app/?rep=william-j-johnson`               |
| Quinton Jones         | `https://lwd-lead-card.netlify.app/?rep=quinton-jones`                  |

Generate a QR code for each URL above (e.g. via [qr-code-generator.com](https://www.qr-code-generator.com/)
or any QR generator) and print it on that employee's business card, yard
sign, or vehicle decal.

## Adding a new team member

1. Add their name to the `TEAM_MEMBERS` array in `src/App.jsx`.
2. Their slug is automatically generated (lowercase, spaces → dashes).
   For example, "Maria Lopez" becomes `maria-lopez`.
3. Give them the URL `https://your-site.netlify.app/?rep=maria-lopez`
   and generate a QR code from it.

## Notes

- The `rep` value is matched case-insensitively and ignores punctuation,
  so `?rep=Nicholas-Santiago` or `?rep=nicholas_santiago` style typos in
  the slug separator won't necessarily match — stick to the exact
  lowercase-with-dashes slug shown above for reliability.
- If the `rep` value doesn't match any current team member (e.g. someone
  who left the company, or a typo), the form silently falls back to the
  normal manual dropdown — it won't show an error to the client.
