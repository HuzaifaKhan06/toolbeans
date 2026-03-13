import ApiTesterTool from '@/tools/ApiTesterTool';

export const metadata = {
  title: 'API Request Tester Test REST APIs Online Free | No Install',
  description:
    'Free online API tester. Send GET, POST, PUT, PATCH, DELETE requests with custom headers, query params, JSON body, Bearer/Basic/API Key auth. JSON tree view, cURL export, save collections, request history, environment variables. No install, runs in browser.',
  keywords: [
    'api tester online',
    'rest api tester',
    'api request tester',
    'test api online',
    'http request tester',
    'postman alternative online',
    'api testing tool free',
    'send http request online',
    'rest client online',
    'api client browser',
    'test get post api',
    'json api tester',
    'curl online',
    'http client online free',
    'api endpoint tester',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/api-request-tester' },
  openGraph: {
    title: 'Free API Request Tester GET, POST, Auth, JSON Tree, cURL Export | TOOLBeans',
    description:
      'Test REST APIs in your browser. All HTTP methods, auth helper, JSON tree view, cURL export, save collections, env variables. No install needed.',
    url: 'https://toolbeans.com/tools/api-request-tester',
  },
}; 

export default function ApiTesterPage() {
  return <ApiTesterTool />;
}