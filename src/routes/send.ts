// POST /send

import { WorkerEmail } from "$lib/email/WorkerEmail";

/** @type {import('./send').RequestHandler} */
export async function post({ params, request }) {

  // Check that the request has a body
  if (!request.body) {
    return {
      status: 400,
      body: {
        error: 'Request body is required'
      }
    }
  }

  try {

    const { to, from, subject, template, html, text } = await request.json();
    const url = new URL(request.url);

    const email = new WorkerEmail({
      to,
      from,
      subject,
      template,
      html,
      text,
    });

    console.log('email:' + JSON.stringify(email));
  
    await email.send();

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'hi',
    };
  } catch (err) {
    console.error('[Email.send]', err);
    return {
      status: 500,
      body: {
        status: 'An error occurred.',
      },
    };
  }
}
