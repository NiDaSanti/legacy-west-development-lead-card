// Minimal Express server for the Close CRM lead-submission API.
// In development, this runs locally on port 3001 and Vite proxies /api requests to it.
// In production, this is deployed to Render as its own service, while the
// frontend (built by Vite) is deployed separately to Netlify.
//
// Required environment variables:
//   CLOSE_API_KEY   - your Close API key (Close > Settings > API Keys)
//   ALLOWED_ORIGIN  - the deployed frontend's URL (e.g. https://legacy-west.netlify.app)
//                     used to restrict CORS in production. Not required in development.

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN

app.use(cors({
  origin: ALLOWED_ORIGIN || true
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.post('/api/create-lead', async (req, res) => {
  const apiKey = process.env.CLOSE_API_KEY
  if (!apiKey) {
    console.error('CLOSE_API_KEY environment variable is not set')
    return res.status(500).json({ error: 'Server is not configured to submit leads' })
  }

  const {
    name = '',
    phone = '',
    email = '',
    addressStreet = '',
    addressCity = '',
    addressState = '',
    addressZip = '',
    increaseSize = '',
    startedPlans = '',
    addADU = '',
    addGenerator = '',
    notes = ''
  } = req.body || {}

  if (!name && !phone && !email) {
    return res.status(400).json({ error: 'At least a name, phone, or email is required' })
  }

  const questionSummary = [
    `Increase size of home: ${increaseSize || 'n/a'}`,
    `Started plans/engineering: ${startedPlans || 'n/a'}`,
    `Add ADU: ${addADU || 'n/a'}`,
    `Add backup generator: ${addGenerator || 'n/a'}`,
    notes ? `Notes: ${notes}` : null
  ].filter(Boolean).join('\n')

  const hasAddress = addressStreet || addressCity || addressState || addressZip

  const leadPayload = {
    name: name || addressStreet || 'New Website Lead',
    contacts: [
      {
        name: name || undefined,
        phones: phone ? [{ phone, type: 'mobile' }] : [],
        emails: email ? [{ email, type: 'office' }] : []
      }
    ],
    addresses: hasAddress
      ? [{
          label: 'business',
          address_1: addressStreet,
          city: addressCity,
          state: addressState,
          zipcode: addressZip,
          country: 'US'
        }]
      : [],
    description: questionSummary
  }

  try {
    const closeResponse = await fetch('https://api.close.com/api/v1/lead/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
      },
      body: JSON.stringify(leadPayload)
    })

    const data = await closeResponse.json()

    if (!closeResponse.ok) {
      console.error('Close API error:', data)
      return res.status(closeResponse.status).json({ error: data })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Failed to reach Close API:', err)
    return res.status(502).json({ error: 'Failed to reach Close API' })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
  if (ALLOWED_ORIGIN) {
    console.log(`CORS restricted to origin: ${ALLOWED_ORIGIN}`)
  } else {
    console.log('CORS is open to all origins (set ALLOWED_ORIGIN in production)')
  }
})
