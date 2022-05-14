import { inline } from "$lib/email/inline.js";
import { WorkerEmail, type WorkerEmailRequest } from "$lib/email/WorkerEmail.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve, platform }) {

  const request = event.request;
  
  if (request.method === 'POST') {
    if (!request.body) {
      return {
        status: 400,
        body: {
          error: 'Request body is required for POST requests'
        }
      }
    }
  }

  let fail = -1;
  
  const response = await resolve(event, {
    ssr: true,
    hydrate: false,
    transformPage: async (opts: {
      html: string,
      minify: true,
      request: Request,
    }) => {
      // For POST requests, send as email
      if (request.method === 'POST') {
        try {
          const requestContentType = request.headers.get('content-type');
          let body: WorkerEmailRequest;

          if(requestContentType && requestContentType.includes('application/json')) {
            body = await request.json();
          } else {
            fail = 400;
            return 'Request body must be JSON';
          }

          // Get the authorization header
          const authHeader = request.headers.get('authorization');
          const API_KEY = import.meta?.env?.API_KEY || event.platform?.env?.API_KEY;

          // Ensure authorization is present
          if (!authHeader) {
            fail = 400;
            return 'Authorization header is required';
          }

          // Require authorization header
          if (authHeader !== API_KEY) {
            fail = 400;
            return 'Invalid authorization header';
          }

          console.log('[Email] Received request:', JSON.stringify(body));

          // Inline css in the html
          const inlinedHtml = inline(opts.html);

          const { to, from, subject, data } = body;

          // Construct the email
          const email = new WorkerEmail({
            to,
            from,
            subject,
            data,
            html: inlinedHtml,
          });

          // Send the email
          await email.send();

          return inlinedHtml;
        } catch(err) {
          console.error('[Email.send]', err);
          fail = 500;
          return 'Failed to send email';
        }
      }
      return opts.html;
    }
  });

  if(fail > -1) {
    return new Response(response.body, {
      status: fail,
      headers: {
        'content-type': 'text/plain',
      }
    });
  }

  return response;
}