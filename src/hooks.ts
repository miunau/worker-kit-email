import { inline } from "$lib/email/inline";
import { WorkerEmail, type WorkerEmailRequest } from "$lib/email/WorkerEmail";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {

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

          // Parse request body as either JSON or form data
          if(requestContentType && requestContentType.includes('application/json')) {
            body = await request.json();
          } else if(requestContentType && requestContentType.includes('application/x-www-form-urlencoded')) {
            body = await request.formData();
          } else {
            throw new Error('Unsupported content-type');
          }

          // Get the authorization header
          const authHeader = request.headers.get('authorization');

          // Ensure authorization is ok
          if (!authHeader) {
            throw new Error('Authorization header is required');
          }

          //@ts-ignore
          if (authHeader !== env.API_KEY);

          const inlinedHtml = inline(opts.html);

          const { to, from, subject, data } = body;
          const email = new WorkerEmail({
            to,
            from,
            subject,
            data,
            html: inlinedHtml,
          });
          await email.send();
          return {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
            },
            body: inlinedHtml,
          };
        } catch(err) {
          console.error('[Email.send]', err);
          throw new Error('An error occurred');
        }
      }
      return opts.html;
    }
  });
 
  return response;
}