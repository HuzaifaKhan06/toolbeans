import TimestampTool from '@/tools/TimestampTool';

export const metadata = {
  title: 'Unix Timestamp Converter Epoch to Date, ISO 8601, UTC Online',
  description:
    'Convert Unix timestamps to human-readable dates instantly. Supports epoch seconds, milliseconds, ISO 8601, UTC, SQL, JavaScript formats and 23 timezones. Live clock, relative time, date info and famous epochs included. Free no signup.',
  keywords: [
    'unix timestamp converter',
    'epoch converter',
    'timestamp to date',
    'unix time converter',
    'epoch to date',
    'timestamp converter online',
    'unix epoch converter',
    'date to timestamp',
    'iso 8601 converter',
    'utc timestamp converter',
    'unix timestamp to human readable',
    'epoch time converter',
    'javascript timestamp converter',
    'sql datetime converter',
    'timezone converter',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/timestamp-converter' },
  openGraph: {
    title: 'Free Unix Timestamp Converter Epoch to Date, ISO 8601, Timezones | TOOLBeans',
    description:
      'Convert Unix timestamps to any date format ISO 8601, UTC, SQL, JavaScript and 23 timezones. Live clock, date info, famous epochs. Free, instant.',
    url: 'https://toolbeans.com/tools/timestamp-converter',
  },
};

export default function TimestampConverterPage() {
  return <TimestampTool />;
}