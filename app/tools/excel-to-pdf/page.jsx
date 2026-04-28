// app/tools/excel-to-pdf/page.jsx
import ExcelToPdfTool from '@/tools/ExcelToPdfTool';

export const metadata = {
  title: 'Excel to PDF Converter Free Online .xlsx to PDF, No Signup',
  description: 'Convert Excel .xlsx and .xls spreadsheets to PDF free. Cells, borders, charts and formatting fully preserved. Powered by LibreOffice. No signup, no watermark.',
  keywords: ['toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'free excel to pdf', 'online free excel to pdf', 'toolbeans excel to pdf', 'excel to pdf toolbeans', 'free online excel to pdf', 'excel to pdf free', 'free online excel to pdf converter', 'toolbeans excel to pdf converter',
    'excel to pdf','excel to pdf converter','xlsx to pdf','convert excel to pdf free','excel to pdf online','xls to pdf','spreadsheet to pdf', 'excel file to pdf converter', 'convert xlsx file to pdf online', 'free spreadsheet to pdf converter', 'excel sheet to pdf online free', 'convert xls file to pdf free', 'best excel pdf converter online', 'excel workbook to pdf converter', 'excel to pdf without software', 'secure excel to pdf conversion', 'instant excel to pdf converter',
'excel to pdf no signup', 'fast excel to pdf tool', 'simple excel to pdf converter', 'bulk excel to pdf converter', 'excel to pdf drag and drop', 'excel to pdf high quality', 'convert excel sheet to pdf online', 'excel to pdf web tool', 'cloud excel to pdf converter', 'excel document to pdf converter',
'export excel to pdf online', 'excel to pdf with formatting', 'accurate excel to pdf converter', 'excel to pdf without losing format', 'free xls converter to pdf', 'convert spreadsheet online free', 'excel pdf converter no watermark', 'excel to pdf unlimited free', 'easy excel to pdf converter', 'quick xlsx to pdf tool',
'excel file conversion to pdf free', 'convert excel files to pdf online free', 'online spreadsheet converter to pdf', 'excel to pdf converter without login', 'free excel pdf generator', 'excel to pdf lightweight tool', 'excel to pdf browser tool', 'excel to pdf conversion fast', 'xlsx to pdf free tool online', 'excel data to pdf converter',
'convert excel tables to pdf', 'spreadsheet pdf export tool', 'excel sheet pdf export free', 'online xls to pdf converter free', 'excel workbook pdf export', 'excel report to pdf converter', 'xls file to pdf online free', 'excel pdf tool no registration', 'convert excel report to pdf', 'spreadsheet export to pdf free',
'excel to pdf instant download', 'excel to pdf secure tool online', 'excel converter to pdf without ads', 'xls to pdf fast converter', 'xlsx file converter online pdf', 'excel to pdf web app', 'convert excel docs to pdf free', 'excel to pdf conversion online tool', 'excel pdf conversion simple tool', 'excel to pdf SaaS tool',
'excel to pdf conversion service free', 'spreadsheet to pdf converter free online', 'excel export as pdf online free', 'online excel document converter pdf', 'excel pdf conversion without watermark', 'convert excel sheets online to pdf free', 'excel pdf export tool fast', 'excel pdf conversion cloud tool', 'excel file to pdf fast converter', 'convert excel to pdf instantly online',
'excel file to pdf without losing data', 'excel pdf converter tool free online', 'spreadsheet pdf converter tool fast', 'excel to pdf generator online', 'free excel pdf export online tool', 'xlsx pdf conversion online free tool', 'xls pdf converter without signup', 'excel pdf export no login tool', 'excel pdf conversion high speed tool', 'convert excel sheets to pdf free online tool',
'excel document export to pdf free', 'online excel to pdf conversion free tool', 'excel sheet converter pdf online fast', 'excel pdf maker online free', 'excel pdf conversion utility online', 'xlsx file to pdf converter tool free', 'xls document to pdf converter online', 'spreadsheet pdf maker online free', 'excel to pdf transformation online', 'excel pdf conversion easy tool',
'excel file to pdf converter fast free', 'online excel to pdf converter no signup free', 'excel pdf conversion tool without watermark free', 'xlsx to pdf conversion instant online', 'spreadsheet converter pdf free fast tool', 'excel export pdf online no login', 'convert excel to pdf online quickly free', 'excel pdf conversion tool high quality free', 'xls to pdf converter online no signup', 'excel to pdf web converter free fast'],
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