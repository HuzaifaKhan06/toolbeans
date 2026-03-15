// app/tools/excel-to-pdf/page.jsx
import ExcelToPdfTool from '@/tools/ExcelToPdfTool';

export const metadata = {
  title: 'Excel to PDF Converter Free Online .xlsx to PDF, No Signup',
  description: 'Convert Excel .xlsx and .xls spreadsheets to PDF free. Cells, borders, charts and formatting fully preserved. Powered by LibreOffice. No signup, no watermark.',
  keywords: ['excel to pdf','excel to pdf converter','xlsx to pdf','convert excel to pdf free','excel to pdf online','xls to pdf','spreadsheet to pdf'],
  alternates: { canonical: 'https://toolbeans.com/tools/excel-to-pdf' },
  openGraph: {
    title: 'Excel to PDF Converter Free, LibreOffice Quality',
    description: 'Convert Excel spreadsheets to PDF with all cells and charts preserved. Powered by LibreOffice. Free.',
    url: 'https://toolbeans.com/tools/excel-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools',        item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Excel to PDF', item: 'https://toolbeans.com/tools/excel-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Excel to PDF Converter',
      url: 'https://toolbeans.com/tools/excel-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Free Excel to PDF converter powered by LibreOffice. Converts .xlsx and .xls with full cell and chart fidelity.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['.xlsx and .xls to PDF','Cells and borders preserved','Charts preserved','Multiple sheets supported','No watermark','Files deleted after conversion'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Are multiple sheets converted?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each sheet in your Excel file becomes a separate page in the PDF.' } },
        { '@type': 'Question', name: 'Is my Excel file stored on your server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your file is deleted immediately after your PDF downloads.' } },
        { '@type': 'Question', name: 'Are charts preserved in the PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Basic charts are preserved. Complex chart types may have limited support.' } },
      ],
    },
  ],
};

export default function ExcelToPdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ExcelToPdfTool />
    </>
  );
}