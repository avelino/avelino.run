import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';

export const NewsletterTemplate = ({ title, description, url, imageUrl, siteName = 'avelino.run' }) => {
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Preview, null, description || `New post from ${siteName}`),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          imageUrl ? React.createElement('div', { style: imageContainer },
            React.createElement(Img, {
              src: imageUrl,
              alt: title,
              width: '540',
              style: imageStyle
            })
          ) : null,
          React.createElement(Heading, { style: heading }, title)
        ),
        React.createElement(Section, { style: content },
          React.createElement(Text, { style: descriptionText }, description),
          React.createElement(Section, { style: buttonContainer },
            React.createElement(Link, { href: url, style: button }, 'Read on website →')
          )
        ),
        React.createElement(Hr, { style: hr }),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText },
            "You're receiving this because you subscribed to the newsletter.",
            React.createElement('br', null),
            React.createElement(Link, { href: '{{{RESEND_UNSUBSCRIBE_URL}}}', style: unsubscribeLink }, 'Unsubscribe')
          ),
          React.createElement(Text, { style: footerText },
            React.createElement(Link, { href: `https://${siteName}`, style: siteLink }, siteName)
          )
        )
      )
    )
  );
};

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 30px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  maxWidth: '600px',
};

const header = {
  marginBottom: '30px',
  borderBottom: '3px solid #bd93f9',
  paddingBottom: '20px',
};

const imageContainer = {
  marginBottom: '24px',
  textAlign: 'center',
};

const imageStyle = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  display: 'block',
  margin: '0 auto',
};

const heading = {
  color: '#5e497c',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 10px 0',
};

const content = {
  marginBottom: '40px',
};

const descriptionText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const buttonContainer = {
  textAlign: 'center',
  marginTop: '24px',
};

const button = {
  backgroundColor: '#5e497c',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center',
  marginTop: '32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const unsubscribeLink = {
  color: '#6b7280',
  textDecoration: 'underline',
};

const siteLink = {
  color: '#5e497c',
  textDecoration: 'none',
  fontWeight: '500',
};

export function renderEmailTemplate({ title, description, url, imageUrl, siteName = 'news.avelino.run' }) {
  const template = NewsletterTemplate({ title, description, url, imageUrl, siteName });
  return render(template);
}

export default NewsletterTemplate;

