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

    const subscriberHash = await crypto.subtle.digest(
      'MD5',
      new TextEncoder().encode(employee.email.toLowerCase())
    )

    const hashArray = Array.from(new Uint8Array(subscriberHash))
    const hash = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

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
            FNAME: employee.firstName,
            LNAME: employee.lastName,
            PHONE: employee.phone,
            MERGE8: employee.city,
            MERGE9: employee.role,
            MERGE10: employee.department,
            MERGE13: guestDetails?.name || '',
            MERGE14: guestDetails?.email || '',
            MERGE15: guestDetails?.phone || '',
            MERGE16: guestDetails?.relationship || '',
            MERGE17: dietaryDetails || '',
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

    return new Response(
      JSON.stringify(data),
      { status: 200 }
    )

  } catch (error) {
    console.error(error)

    return new Response(
      JSON.stringify({
        error: 'Mailchimp sync failed',
      }),
      { status: 500 }
    )
  }
}
