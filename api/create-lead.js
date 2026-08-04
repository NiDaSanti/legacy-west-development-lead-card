// Vercel serverless function: POST /api/create-lead
// Proxies lead submissions from the frontend to Close CRM's Leads API.
// Keeps the Close API key secret on the server side.
//
// Docs: https://developer.close.com/api/resources/leads/create
//
// Required environment variable:
//   CLOSE_API_KEY - your Close API key (Settings > API Keys in Close)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

  // Build a note summarizing the qualifying questions, since these
  // depend on custom fields specific to a Close account/schema.
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
        // Close uses HTTP Basic Auth with the API key as the username
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
}
