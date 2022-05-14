import { striptags } from '../striptags/striptags.js';

export type Only<T, U> = { [P in keyof T]: T[P] } & Omit<{ [P in keyof U]?: never }, keyof T>;

export type Either<T, U> = Only<T, U> | Only<U, T>;

export type Attachment = {
  filename: string;
  content: string;
  contentType: string;
}

export type EmailAddress = {
  email: string;
  name: string;
};

export type WorkerEmailRequest = {
  to: EmailAddress[] | EmailAddress | string;
  from: EmailAddress | string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Attachment[];
  data?: { [key: string]: any };
};

export interface WorkerEmailCommon {
  emailHost?: string;
  from: EmailAddress | string;
  subject: string;
  to: EmailAddress[] | EmailAddress | string;
  bcc?: EmailAddress[] | EmailAddress | string
  cc?: EmailAddress[] | EmailAddress | string;
  attachments?: Attachment[];
  data?: { [key: string]: any };
}

export interface WorkerEmailWithText extends WorkerEmailCommon {
  text: string;
}

export interface WorkerEmailWithHTML extends WorkerEmailCommon {
  html: string;
  text?: string;
}

type WorkerEmailConfig = Either<WorkerEmailWithText, WorkerEmailWithHTML>;

export class WorkerEmail {
  emailHost = 'https://api.mailchannels.net/tx/v1/send';
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  from: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  data?: { [key: string]: any };
  
  constructor({
    emailHost,
    to,
    cc,
    bcc,
    from,
    subject,
    text,
    html,
    attachments,
    data,
  }: WorkerEmailConfig) {
    if(emailHost) this.emailHost = emailHost;
    this.to = this.parseAddress(to);
    if (!this.to || !this.to.length) throw new Error('To is required');
    this.from = this.parseAddress(from)[0];
    if (!this.from) throw new Error('From address is required');
    this.subject = subject;
    if (!this.subject) throw new Error('Subject is required');
    if(cc) this.cc = this.parseAddress(cc);
    if(bcc) this.bcc = this.parseAddress(bcc);
    if(text) this.text = text;
    if(html) this.html = html;
    if(attachments) this.attachments = attachments;
    if(data) this.data = data;
    if(!this.html && !this.text) throw new Error('Either text or html is required');
  }

  private parseAddress(address: EmailAddress[] | EmailAddress | string | undefined): EmailAddress[] {
    if(!address) return [];
    if(typeof address === 'string') return [{ email: address, name: address }];
    if(Array.isArray(address)) {
      return address.map(a => {
        if(typeof a === 'string') return { email: a, name: a };
        return a;
      });
    }
    return [address];
  }

  private replaceDataTags() {
    if (!this.data) return;
    const data = this.data;
    const text = this.text;
    const html = this.html;
    const keys = Object.keys(data);
    keys.forEach(key => {
      const value = data[key];
      const regex = new RegExp(`{{{${key}}}}`, 'g');
      if (this.text) this.text = this.text.replace(regex, value);
      if (this.html) this.html = this.html.replace(regex, value);
    });
  }

  private getTextBody() {
    if (this.html && !this.text) {
      this.text = striptags(this.html);
      return this.text;
    }
    return this.text;
  }

  async send() {
    this.replaceDataTags();
    const htmlBody = this.html ? this.html : undefined;
    const textBody = this.getTextBody();
    const content = [{
      type: 'text/plain',
      value: textBody,
    }];

    if(htmlBody) {
      content.push({
        type: 'text/html',
        value: htmlBody,
      });
    }

    const personalizations: any[] = [];

    personalizations.push({ to: this.to });
    if(this.cc) personalizations[0].cc = this.cc;
    if(this.bcc) personalizations[0].bcc = this.bcc;

    const body = {
      personalizations,
      from: this.from,
      subject: this.subject,
      content: [
        {
          type: 'text/plain',
          value: textBody,
        },
        {
          type: 'text/html',
          value: htmlBody,
        }
      ],
    };

    console.log('body:', JSON.stringify(body, null, 2));

    const request = new Request(this.emailHost, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const response = await fetch(request);

    // Check if request was successful
    if (!response.ok) {
      const text = await response.text();
      console.error('[WorkerEmail] Failed to send email', response.status, text);
      throw new Error(`Failed to send email`);
    }

    return response;
  }
}