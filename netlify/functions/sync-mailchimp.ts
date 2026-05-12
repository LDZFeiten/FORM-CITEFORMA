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

    const {
  employee,
  guestDetails,
  guest,
  dietaryRestrictions,
  dietaryDetails,
} = body
const email = String(employee?.email || '').trim().toLowerCase()

if (!email || !email.includes('@')) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'Missing or invalid employee email',
      receivedEmployee: employee,
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
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
  .update(email.toLowerCase())
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
          email_address: email,
          status_if_new: 'subscribed',
          merge_fields: {
            FNAME: employee.firstName || '',
            LNAME: employee.lastName || '',
            ADDRESS: employee.address || '',
            PHONE: employee.phone || '',
            COMPANY: employee.company || '',
            MMERGE8: employee.city || '',
            MMERGE9: employee.job || '',
            MMERGE10: employee.dept || '',
            
            MMERGE13: guestDetails?.name || '',
            MMERGE14: guestDetails?.email || '',
            MMERGE15: guestDetails?.phone || '',
            MMERGE16: guestDetails?.relationship || '',
            MMERGE17: dietaryDetails || '',
          },
          tags: [
            'Funcionários',
          guest === 'yes' ? 'Convidado' : 'Solo',
          (dietaryRestrictions === 'yes' ? ['Restrição Alimentar'] : []),
          ],
        }),
      }
    )
    if (
  guest === 'yes' &&
  guestDetails?.email &&
  guestDetails.email.includes('@')
) {
  const guestEmail = guestDetails.email.trim().toLowerCase()

  const guestHash = createHash('md5')
    .update(guestEmail)
    .digest('hex')

  await fetch(
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${guestHash}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: guestEmail,
        status_if_new: 'subscribed',

        merge_fields: {
          FNAME: guestDetails?.name || '',
          PHONE: guestDetails?.phone || '',
          MMERGE16: guestDetails?.relationship || '',
        },

        tags: [
          'Convidado',
          'Evento Microsoft',
          ...(dietaryRestrictions === 'yes'
            ? ['Restrição Alimentar']
            : []),
        ],
      }),
    }
  )
}

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
