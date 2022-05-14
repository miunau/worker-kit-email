# worker-kit-email

Develop transactional emails quickly using regular SvelteKit routes in your browser, then take it to production by POSTing to that route after deploying on CloudFlare Workers.

![email](https://user-images.githubusercontent.com/55932282/168412180-3ba5e2c4-f4d3-456b-bb44-5b045d565988.png)


## How does it work?

Develop your email templates as regular SvelteKit routes (for example. `routes/email/TestEmail`).

Put a secret called `API_KEY` using wrangler:
```sh
wrangler secret put API_KEY
```

Once published on CloudFlare Workers, or when using `wrangler dev`, POST some JSON to that route to send it as an email:

```sh
curl -H "Authorization: your_api_key" \
  -H "Content-Type: application/json" \
  -X POST -d '{ "to": { "name": "John Doe", "email": "john.doe@foobar.com" }, "from": "no-reply@myapp.com", "subject": "Test email from SvelteKit!" }' \
  https://youremailworker.company.workers.dev/email/TestEmail
```

The route will be rendered on the worker, its CSS will be inlined and the content will be sent to the recipient.

### text/plain

`striptags` is used to strip the tags from the HTML for a text-only version.

## Request format

```ts
export type EmailAddress = {
  email: string;
  name: string;
};

export type Attachment {
  filename: string;
  content: string; // As base64
  contentType: string; // Mimetype
  size: number; // Bytes
}
```

Variable | Type     | Explanation
---------|----------|---------------
subject  | `string` | E-mail subject
from     | `EmailAddress`, `string` | From email address
to       | `EmailAddress[]`, `EmailAddress` or `string` | To email address(es)
cc?       | `EmailAddress[]`, `EmailAddress` or `string` | CC email address(es) - not working yet
bcc?       | `EmailAddress[]`, `EmailAddress` or `string` | BCC email address(es) - not working yet
attachments? | `Attachment[]`, `Attachment` | Attachments (base64) - not working yet
data? | `{ [key: string]: any }` | Template variables

## Template variables

To use template variables that will be replaced from your POST request, use `{{{triple_braces}}}` in your template.

Then, pass it in your POST data:
```
{
  "data": {
    "triple_braces": "otters are cool"
  }
}
```

## How do I use it?

Clone this repo.

## TODO

- [ ] cc and bcc fields (what's the API call?)
- [ ] attachments (do they even work?)
- [ ] "click to view this email in your browser" link injection

## License

This repository contains a version of [striptags](https://github.com/ericnorris/striptags) modified to compile for CloudFlare Workers.

This repository is licensed under [Anti-Capitalist Software License](https://anticapitalist.software/).
