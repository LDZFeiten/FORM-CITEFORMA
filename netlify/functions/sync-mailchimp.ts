import { createHash } from 'node:crypto'
export default async (request: Request) => {
  try {
    const body = await request.json()

    const {
      employee,
      guestDetails,
      presence,
      guest,
      dietaryRestrictions,
      dietaryDetails,
    } = body

    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      return new Response(
        JSON.stringify({ error: 'Missing Mailchimp env vars' }),
        { status: 500 }
      )
    }

    const serverPrefix =
      process.env.MAILCHIMP_SERVER_PREFIX ||
      apiKey.split('-')[1]

    const hash = createHash('md5')
  .update(employee.email.toLowerCase())
  .digest('hex')
    
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${hash}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: employee.email,
          status_if_new: 'subscribed',
          status: 'subscribed',

          merge_fields: {
  FNAME: employee.firstName || '',
  LNAME: employee.lastName || '',
}
          },

          tags: [
            'internal-rsvp',
            presence === 'confirmed'
              ? 'confirmed'
              : 'declined',

            guest === 'yes'
              ? 'with-guest'
              : 'solo',

            dietaryRestrictions === 'yes'
              ? 'dietary-restrictions'
              : 'no-dietary-restrictions',
          ],
        }),
      }
    )

const data = await response.json()

if (!response.ok) {
  return new Response(
    JSON.stringify({
      ok: false,
      status: response.status,
      mailchimp: data,
    }),
    {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

return new Response(
  JSON.stringify({
    ok: true,
    status: response.status,
    mailchimp: data,
  }),
  {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }
)
