import { createHash } from 'node:crypto'
export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
  return new Response(
    JSON.stringify({ ok: false, error: 'Use POST only' }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
    const body = await request.json()

    const { employee } = body

    const apiKey = process.env.MAILCHIMP_API_KEY
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing Mailchimp env vars' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!employee?.email) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing employee email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const serverPrefix =
      process.env.MAILCHIMP_SERVER_PREFIX || apiKey.split('-')[1]

  const subscriberHash = createHash('md5')
  .update(employee.email.toLowerCase())
  .digest('hex')

    const mailchimpResponse = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: employee.email,
          status_if_new: 'subscribed',
          merge_fields: {
            FNAME: employee.firstName || '',
            LNAME: employee.lastName || '',
          },
          tags: ['internal-rsvp'],
        }),
      }
    )

    const data = await mailchimpResponse.json()

    if (!mailchimpResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: mailchimpResponse.status,
          mailchimp: data,
        }),
        {
          status: mailchimpResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        ok: true,
        status: mailchimpResponse.status,
        mailchimp: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
