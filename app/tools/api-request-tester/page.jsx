// app/tools/api-request-tester/page.jsx
import ApiTesterTool from '@/tools/ApiTesterTool';

export const metadata = {
  title: 'Free API Request Tester — Test REST APIs Online Without Postman',
  description:
    'Test REST APIs directly in your browser for free. Send GET, POST, PUT, PATCH and DELETE requests with custom headers, query params, JSON body, Bearer token, Basic Auth and API Key authentication. View responses with a JSON tree, export as cURL and save request collections. No install, no signup.',
  keywords: [
    'api tester online free',
    'rest api tester no install',
    'test api online without postman',
    'http request tester browser',
    'postman alternative free 2026',
    'api testing tool free online',
    'send get post request online',
    'json api response viewer',
    'bearer token api tester',
    'curl command online',
    'http client browser free',
    'api endpoint tester free',
    'rest client no signup',
    'test api with headers online',
    'api request builder free',
    'json body api request',
    'api testing without software',
    'developer api tool free',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/api-request-tester' },
  openGraph: {
    title: 'Free API Request Tester — Test REST APIs Online Without Postman | TOOLBeans',
    description:
      'Test REST APIs in your browser. All HTTP methods, auth helper, JSON tree response view, cURL export, save collections, environment variables. Free, no install.',
    url: 'https://toolbeans.com/tools/api-request-tester',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'API Request Tester — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free API Request Tester — Test REST APIs Online | TOOLBeans',
    description: 'Send HTTP requests, view JSON responses, export cURL. No install, no signup. Free forever.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'API Request Tester', item: 'https://toolbeans.com/tools/api-request-tester' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'API Request Tester — TOOLBeans',
    url: 'https://toolbeans.com/tools/api-request-tester',
    description: 'Free browser-based REST API testing tool. Send HTTP requests with all methods, authentication, custom headers and JSON body. View responses with JSON tree. Export as cURL. No install required.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'GET, POST, PUT, PATCH, DELETE HTTP methods',
      'Bearer Token, Basic Auth and API Key authentication',
      'Custom request headers',
      'Query parameter builder',
      'JSON, form-data and raw request body',
      'JSON tree response viewer',
      'cURL export for any request',
      'Request collection save and load',
      'Request history',
      'Environment variables',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this API tester completely free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans API Request Tester is 100% free with no usage limits. No account, no signup and no credit card required.' },
      },
      {
        '@type': 'Question',
        name: 'Does the API tester support authentication?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool supports Bearer Token authentication, HTTP Basic Auth with username and password, and API Key authentication in both headers and query parameters.' },
      },
      {
        '@type': 'Question',
        name: 'Can I save API requests for later use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can save requests to a collection and reload them any time. Request history is also saved automatically so you can access recent requests without manually saving them.' },
      },
      {
        '@type': 'Question',
        name: 'Does it work as a Postman alternative?',
        acceptedAnswer: { '@type': 'Answer', text: 'For most common API testing needs, yes. The tool supports all HTTP methods, authentication, custom headers, request bodies, collections and cURL export. It runs in the browser without any installation.' },
      },
      {
        '@type': 'Question',
        name: 'Can I export requests as cURL commands?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every request can be exported as a cURL command with one click. This is useful for sharing requests with teammates, running requests in a terminal or documenting API calls.' },
      },
    ],
  },
];

export default function ApiTesterPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ApiTesterTool />
    </>
  );
}