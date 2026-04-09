// app/tools/page.jsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const TOOLS_PER_PAGE = 9;

// ── All 39 tools ──────────────────────────────────────────────────────────────
const tools = [
  // ── Developer (21 browser-based tools) ─────────────────────────────────────
  { name: 'Password Generator',       desc: 'Generate cryptographically secure passwords with custom length, uppercase, lowercase, numbers and symbols. Includes strength meter and crack time estimate.',   icon: '🔒', href: '/tools/password-generator',     color: 'bg-indigo-50',  badge: 'Security',  badgeColor: 'bg-indigo-100 text-indigo-700',   keywords: 'strong password generator, secure random password'           },
  { name: 'QR Code Generator',        desc: 'Create QR codes for URLs, text, email, phone, Wi-Fi and more. Choose from multiple sizes and color themes. Download as PNG, SVG or PDF.',                    icon: '📱', href: '/tools/qr-code-generator',      color: 'bg-cyan-50',    badge: 'Utility',   badgeColor: 'bg-cyan-100 text-cyan-700',       keywords: 'qr code generator free, create qr code online'              },
  { name: 'JSON Formatter',           desc: 'Beautify, minify, validate and auto-repair JSON. Tree view with collapsible nodes, custom indentation and syntax error detection.',                          icon: '{}', href: '/tools/json-formatter',         color: 'bg-yellow-50',  badge: 'Developer', badgeColor: 'bg-yellow-100 text-yellow-700',   keywords: 'json formatter online, json beautifier, json validator'      },
  { name: 'SQL Formatter',            desc: 'Format and beautify SQL queries. Supports MySQL, PostgreSQL, SQLite, T-SQL, BigQuery and MariaDB dialects with keyword case control.',                       icon: '🗄️', href: '/tools/sql-formatter',          color: 'bg-rose-50',    badge: 'Database',  badgeColor: 'bg-rose-100 text-rose-700',       keywords: 'sql formatter online, sql beautifier, format sql query'      },
  { name: 'Base64 Encoder / Decoder', desc: 'Encode text or files to Base64 and decode Base64 back to plain text. Handles JWT tokens natively. Supports URL-safe Base64.',                               icon: '🔐', href: '/tools/base64-encoder-decoder', color: 'bg-green-50',   badge: 'Encoding',  badgeColor: 'bg-green-100 text-green-700',     keywords: 'base64 encode online, base64 decode online'                 },
  { name: 'URL Encoder / Decoder',    desc: 'Encode and decode URL components, full URLs and query strings. Includes query string builder and percent-encoding reference table.',                         icon: '🔗', href: '/tools/url-encoder-decoder',    color: 'bg-purple-50',  badge: 'Encoding',  badgeColor: 'bg-purple-100 text-purple-700',   keywords: 'url encode online, url decode online, percent encoding'      },
  { name: 'URL Shortener',            desc: 'Shorten long URLs to clean short links. Set custom aliases, track click counts and generate QR codes per link.',                                             icon: '✂️', href: '/tools/url-shortener',          color: 'bg-violet-50',  badge: 'Utility',   badgeColor: 'bg-violet-100 text-violet-700',   keywords: 'url shortener free, shorten url online'                     },
  { name: 'Text Case Converter',      desc: 'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more. Live re-conversion with word and character stats.',      icon: '🔤', href: '/tools/text-case-converter',    color: 'bg-orange-50',  badge: 'Text',      badgeColor: 'bg-orange-100 text-orange-700',   keywords: 'text case converter, camelcase to snake_case'               },
  { name: 'Hash Generator',           desc: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from any text or file. Includes HMAC-SHA256 and hash comparison tab.',                     icon: '#️⃣', href: '/tools/hash-generator',         color: 'bg-emerald-50', badge: 'Security',  badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'sha256 hash generator, md5 generator online'               },
  { name: 'JWT Decoder',              desc: 'Decode JSON Web Tokens and inspect header, payload and all claims. Live expiry countdown and security warnings for weak algorithms.',                         icon: '🔓', href: '/tools/jwt-decoder',            color: 'bg-sky-50',     badge: 'Auth',      badgeColor: 'bg-sky-100 text-sky-700',         keywords: 'jwt decoder online, decode jwt token'                       },
  { name: 'Regex Tester',             desc: 'Test regular expressions with live match highlighting, flag toggles, captured group inspector, replace mode and a 10-pattern cheatsheet.',                   icon: '⚡', href: '/tools/regex-tester',           color: 'bg-fuchsia-50', badge: 'Developer', badgeColor: 'bg-fuchsia-100 text-fuchsia-700', keywords: 'regex tester online, regular expression tester'            },
  { name: 'Word Counter',             desc: 'Count words, characters, sentences and paragraphs instantly. Reading time estimate, keyword density and export options included.',                            icon: '📝', href: '/tools/word-counter',           color: 'bg-emerald-50', badge: 'Writing',   badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'word counter online, character counter free'               },
  { name: 'Lorem Ipsum Generator',    desc: 'Generate Lorem Ipsum placeholder text in paragraphs, sentences or words. Styles include Classic, Tech, Business and Casual with HTML output.',              icon: '✍️', href: '/tools/lorem-ipsum',            color: 'bg-purple-50',  badge: 'Writing',   badgeColor: 'bg-purple-100 text-purple-700',   keywords: 'lorem ipsum generator, placeholder text generator'          },
  { name: 'Timestamp Converter',      desc: 'Convert Unix timestamps instantly. Supports Unix seconds, milliseconds, ISO 8601, SQL DateTime and multiple timezone formats with real-time clock.',         icon: '⏱️', href: '/tools/timestamp-converter',    color: 'bg-sky-50',     badge: 'Developer', badgeColor: 'bg-sky-100 text-sky-700',         keywords: 'unix timestamp converter, epoch converter online'           },
  { name: 'Color Picker',             desc: 'Create color palettes, tints, shades and gradients for UI design and branding. Real-time previews, harmony suggestions and export options.',                icon: '🎨', href: '/tools/color-picker',           color: 'bg-pink-50',    badge: 'Design',    badgeColor: 'bg-pink-100 text-pink-700',       keywords: 'color picker online, hex color picker, color palette'       },
  { name: 'CSV to SQL',               desc: 'Convert CSV files to SQL INSERT statements instantly. Paste data or upload CSV, TSV, TXT or Excel files to generate clean queries for any database.',       icon: '📊', href: '/tools/csv-to-sql',             color: 'bg-emerald-50', badge: 'Database',  badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'csv to sql converter, csv to insert statements'            },
  { name: 'HTML to Markdown',         desc: 'Convert HTML to clean Markdown instantly. Supports GitHub Flavored Markdown, tables, code blocks and live preview for accurate formatting.',                icon: '🔄', href: '/tools/html-to-markdown',       color: 'bg-teal-50',    badge: 'Writing',   badgeColor: 'bg-teal-100 text-teal-700',       keywords: 'html to markdown converter, html to md online'              },
  { name: 'Code Formatter',           desc: 'Format JavaScript, TypeScript, HTML, CSS, JSON and XML instantly. Syntax highlighting, minify option and side-by-side diff view.',                          icon: '✨', href: '/tools/code-formatter',         color: 'bg-violet-50',  badge: 'Developer', badgeColor: 'bg-violet-100 text-violet-700',   keywords: 'code formatter online, js formatter, html beautifier'       },
  { name: 'API Tester',               desc: 'Test and debug REST APIs in your browser. All HTTP methods, authentication management, JSON tree response view and cURL export.',                            icon: '📡', href: '/tools/api-request-tester',    color: 'bg-violet-50',  badge: 'Developer', badgeColor: 'bg-violet-100 text-violet-700',   keywords: 'api tester online, rest api tester, test api in browser'    },
  { name: 'Image to Base64',          desc: 'Convert PNG, JPG, SVG, WebP images to Base64 Data URL, HTML img tag, CSS background or JSON. Batch convert multiple files entirely in your browser.',     icon: '🖼️', href: '/tools/image-to-base64',        color: 'bg-orange-50',  badge: 'Developer', badgeColor: 'bg-orange-100 text-orange-700',   keywords: 'image to base64 converter, png to base64 online'            },
  { name: 'Diff Checker',             desc: 'Compare two versions of text or code side-by-side. Word-level inline diff, split and unified view, ignore whitespace and export diff.',                     icon: '↔️', href: '/tools/diff-checker',           color: 'bg-cyan-50',    badge: 'Developer', badgeColor: 'bg-cyan-100 text-cyan-700',       keywords: 'diff checker online, text compare tool, code diff'          },
  // ── Convert TO PDF (9 tools) ────────────────────────────────────────────────
  { name: 'JPG to PDF',               desc: 'Convert JPG images to a PDF document. Combine multiple images into one PDF, choose page size and orientation. 100% browser-based, no upload required.',    icon: '📸', href: '/tools/jpg-to-pdf',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'jpg to pdf converter, jpeg to pdf free'                     },
  { name: 'PNG to PDF',               desc: 'Convert PNG images to PDF with transparency preserved. Combine multiple PNGs into one PDF document. Browser-based, no file upload needed.',                 icon: '🖼️', href: '/tools/png-to-pdf',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'png to pdf converter, transparent png to pdf'               },
  { name: 'Image to PDF',             desc: 'Convert JPG, PNG, WebP, GIF, BMP and SVG images to PDF. Combine multiple images. Pixel-perfect quality. 100% browser-based, nothing uploaded.',           icon: '🗂️', href: '/tools/image-to-pdf',           color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'image to pdf converter, pictures to pdf free'               },
  { name: 'TXT to PDF',               desc: 'Convert plain text files to PDF. Selectable and searchable text output. Custom font, size, margins and line numbers. Browser-based, no upload.',           icon: '📄', href: '/tools/txt-to-pdf',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'txt to pdf, text file to pdf converter'                     },
  { name: 'SVG to PDF',               desc: 'Convert SVG vector graphics to PDF. Retina 2x scale for crisp output. Fit SVG page mode. Combine multiple SVGs into one PDF. Browser-based.',             icon: '✏️', href: '/tools/svg-to-pdf',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'svg to pdf converter, vector to pdf free'                   },
  { name: 'HTML to PDF',              desc: 'Convert HTML files to PDF using your browser native render engine. Full CSS, web fonts and tables preserved. Live preview before download.',                icon: '🌐', href: '/tools/html-to-pdf',            color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'html to pdf converter, webpage to pdf free'                 },
  { name: 'Word to PDF',              desc: 'Convert Word .docx files to PDF. Fonts, tables, images, headers and footers all preserved. Powered by LibreOffice for professional quality output.',       icon: '📝', href: '/tools/word-to-pdf',            color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'word to pdf, docx to pdf converter free'                    },
  { name: 'Excel to PDF',             desc: 'Convert Excel spreadsheets to PDF. All cells, borders, charts and column widths preserved. Powered by LibreOffice for professional quality output.',       icon: '📊', href: '/tools/excel-to-pdf',           color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'excel to pdf, xlsx to pdf converter free'                   },
  { name: 'PowerPoint to PDF',        desc: 'Convert PowerPoint presentations to PDF. Every slide becomes a page with backgrounds, images and text preserved. Powered by LibreOffice.',                icon: '📽️', href: '/tools/powerpoint-to-pdf',      color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'powerpoint to pdf, pptx to pdf converter free'              },
  // ── Convert FROM PDF (9 tools) ──────────────────────────────────────────────
  { name: 'PDF to Text',              desc: 'Extract all text from any PDF instantly. Every page extracted, line breaks preserved. Runs entirely in your browser so your file never leaves your device.',  icon: '📋', href: '/tools/pdf-to-text',            color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to text extractor, extract text from pdf free'          },
  { name: 'PDF to JPG',               desc: 'Convert every PDF page to a high-quality JPG image. Choose resolution and quality. Runs entirely in your browser so nothing is uploaded to any server.',   icon: '📸', href: '/tools/pdf-to-jpg',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to jpg converter, pdf to image free online'             },
  { name: 'PDF to PNG',               desc: 'Convert every PDF page to a lossless PNG image with transparent background support. Choose resolution. Browser-based, no server upload required.',         icon: '🖼️', href: '/tools/pdf-to-png',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to png converter, pdf page to image free'               },
  { name: 'PDF to HTML',              desc: 'Convert PDF to clean, responsive HTML with automatic heading detection and table of contents. Download and open in any browser. Browser-based.',           icon: '🌐', href: '/tools/pdf-to-html',            color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to html converter, convert pdf to web page free'        },
  { name: 'PDF to CSV',               desc: 'Extract tables and text from PDF and convert to CSV. Column detection using text position analysis. Compatible with Excel and Google Sheets.',              icon: '📊', href: '/tools/pdf-to-csv',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to csv converter, extract tables from pdf free'         },
  { name: 'PDF to Word',              desc: 'Convert PDF files to editable Word .docx documents. Text, headings and tables extracted accurately. Powered by our secure conversion server.',             icon: '📝', href: '/tools/pdf-to-word',            color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to word converter, pdf to docx free online'             },
  { name: 'PDF to Excel',             desc: 'Convert PDF files to editable Excel .xlsx spreadsheets. Tables and data extracted accurately. Powered by our secure conversion server.',                   icon: '📊', href: '/tools/pdf-to-excel',           color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to excel converter, pdf to xlsx free online'            },
  { name: 'PDF to PowerPoint',        desc: 'Convert PDF files to editable PowerPoint .pptx presentations. Each PDF page becomes a slide. Powered by our secure conversion server.',                   icon: '📽️', href: '/tools/pdf-to-powerpoint',      color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to powerpoint converter, pdf to pptx free'              },
  { name: 'PDF to SVG',               desc: 'Convert PDF files to scalable SVG vector graphics. Resolution-independent output ideal for web use, logos and print. Powered by our secure server.',      icon: '✏️', href: '/tools/pdf-to-svg',             color: 'bg-red-50',     badge: 'PDF',       badgeColor: 'bg-red-100 text-red-700',         keywords: 'pdf to svg converter, pdf to vector free online'            },
];

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  { key: 'All',       label: 'All Tools',   desc: 'Browse all 39 free tools',                                       tools: [] },
  { key: 'PDF',       label: 'PDF',         desc: 'Convert documents and images to and from PDF',                   tools: ['JPG to PDF','PNG to PDF','Image to PDF','TXT to PDF','SVG to PDF','HTML to PDF','Word to PDF','Excel to PDF','PowerPoint to PDF','PDF to Text','PDF to JPG','PDF to PNG','PDF to HTML','PDF to CSV','PDF to Word','PDF to Excel','PDF to PowerPoint','PDF to SVG'] },
  { key: 'Developer', label: 'Developer',   desc: 'Code, formatting, testing and API tools',                        tools: ['JSON Formatter','Regex Tester','Timestamp Converter','Code Formatter','API Tester','Image to Base64','Diff Checker'] },
  { key: 'Security',  label: 'Security',    desc: 'Password, hashing and token tools',                              tools: ['Password Generator','Hash Generator'] },
  { key: 'Encoding',  label: 'Encoding',    desc: 'Encode and decode data formats',                                 tools: ['Base64 Encoder / Decoder','URL Encoder / Decoder'] },
  { key: 'Database',  label: 'Database',    desc: 'SQL and data conversion tools',                                  tools: ['SQL Formatter','CSV to SQL'] },
  { key: 'Utility',   label: 'Utility',     desc: 'QR codes, URL tools and general utilities',                      tools: ['QR Code Generator','URL Shortener'] },
  { key: 'Writing',   label: 'Writing',     desc: 'Text tools for writers and designers',                           tools: ['Word Counter','Lorem Ipsum Generator','HTML to Markdown'] },
  { key: 'Text',      label: 'Text',        desc: 'Text transformation and conversion tools',                       tools: ['Text Case Converter'] },
  { key: 'Design',    label: 'Design',      desc: 'Color and visual design tools',                                  tools: ['Color Picker'] },
  { key: 'Auth',      label: 'Auth',        desc: 'Authentication and token inspection tools',                      tools: ['JWT Decoder'] },
];

// ── SEO JSON-LD: CollectionPage + ItemList (all 39 tools) ─────────────────────
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://toolbeans.com/tools/#collectionpage',
    url: 'https://toolbeans.com/tools',
    name: 'All 39 Free Online Developer and PDF Tools TOOLBeans',
    description: 'Browse all 39 free developer tools on TOOLBeans. JSON formatter, password generator, Word to PDF, PDF to Word, JWT decoder, regex tester and more. No account needed.',
    isPartOf: { '@type': 'WebSite', url: 'https://toolbeans.com', name: 'TOOLBeans' },
    publisher: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All 39 Free Online Developer and PDF Tools',
    url: 'https://toolbeans.com/tools',
    numberOfItems: 39,
    itemListElement: [
      { '@type': 'ListItem', position: 1,  name: 'Password Generator',      url: 'https://toolbeans.com/tools/password-generator'     },
      { '@type': 'ListItem', position: 2,  name: 'QR Code Generator',       url: 'https://toolbeans.com/tools/qr-code-generator'      },
      { '@type': 'ListItem', position: 3,  name: 'JSON Formatter',          url: 'https://toolbeans.com/tools/json-formatter'         },
      { '@type': 'ListItem', position: 4,  name: 'SQL Formatter',           url: 'https://toolbeans.com/tools/sql-formatter'          },
      { '@type': 'ListItem', position: 5,  name: 'Base64 Encoder Decoder',  url: 'https://toolbeans.com/tools/base64-encoder-decoder' },
      { '@type': 'ListItem', position: 6,  name: 'URL Encoder Decoder',     url: 'https://toolbeans.com/tools/url-encoder-decoder'    },
      { '@type': 'ListItem', position: 7,  name: 'URL Shortener',           url: 'https://toolbeans.com/tools/url-shortener'          },
      { '@type': 'ListItem', position: 8,  name: 'Text Case Converter',     url: 'https://toolbeans.com/tools/text-case-converter'    },
      { '@type': 'ListItem', position: 9,  name: 'Hash Generator',          url: 'https://toolbeans.com/tools/hash-generator'         },
      { '@type': 'ListItem', position: 10, name: 'JWT Decoder',             url: 'https://toolbeans.com/tools/jwt-decoder'            },
      { '@type': 'ListItem', position: 11, name: 'Regex Tester',            url: 'https://toolbeans.com/tools/regex-tester'           },
      { '@type': 'ListItem', position: 12, name: 'Word Counter',            url: 'https://toolbeans.com/tools/word-counter'           },
      { '@type': 'ListItem', position: 13, name: 'Lorem Ipsum Generator',   url: 'https://toolbeans.com/tools/lorem-ipsum'            },
      { '@type': 'ListItem', position: 14, name: 'Timestamp Converter',     url: 'https://toolbeans.com/tools/timestamp-converter'    },
      { '@type': 'ListItem', position: 15, name: 'Color Picker',            url: 'https://toolbeans.com/tools/color-picker'           },
      { '@type': 'ListItem', position: 16, name: 'CSV to SQL',              url: 'https://toolbeans.com/tools/csv-to-sql'             },
      { '@type': 'ListItem', position: 17, name: 'HTML to Markdown',        url: 'https://toolbeans.com/tools/html-to-markdown'       },
      { '@type': 'ListItem', position: 18, name: 'Code Formatter',          url: 'https://toolbeans.com/tools/code-formatter'         },
      { '@type': 'ListItem', position: 19, name: 'API Tester',              url: 'https://toolbeans.com/tools/api-request-tester'     },
      { '@type': 'ListItem', position: 20, name: 'Image to Base64',         url: 'https://toolbeans.com/tools/image-to-base64'        },
      { '@type': 'ListItem', position: 21, name: 'Diff Checker',            url: 'https://toolbeans.com/tools/diff-checker'           },
      { '@type': 'ListItem', position: 22, name: 'JPG to PDF',              url: 'https://toolbeans.com/tools/jpg-to-pdf'             },
      { '@type': 'ListItem', position: 23, name: 'PNG to PDF',              url: 'https://toolbeans.com/tools/png-to-pdf'             },
      { '@type': 'ListItem', position: 24, name: 'Image to PDF',            url: 'https://toolbeans.com/tools/image-to-pdf'           },
      { '@type': 'ListItem', position: 25, name: 'TXT to PDF',              url: 'https://toolbeans.com/tools/txt-to-pdf'             },
      { '@type': 'ListItem', position: 26, name: 'SVG to PDF',              url: 'https://toolbeans.com/tools/svg-to-pdf'             },
      { '@type': 'ListItem', position: 27, name: 'HTML to PDF',             url: 'https://toolbeans.com/tools/html-to-pdf'            },
      { '@type': 'ListItem', position: 28, name: 'Word to PDF',             url: 'https://toolbeans.com/tools/word-to-pdf'            },
      { '@type': 'ListItem', position: 29, name: 'Excel to PDF',            url: 'https://toolbeans.com/tools/excel-to-pdf'           },
      { '@type': 'ListItem', position: 30, name: 'PowerPoint to PDF',       url: 'https://toolbeans.com/tools/powerpoint-to-pdf'      },
      { '@type': 'ListItem', position: 31, name: 'PDF to Text',             url: 'https://toolbeans.com/tools/pdf-to-text'            },
      { '@type': 'ListItem', position: 32, name: 'PDF to JPG',              url: 'https://toolbeans.com/tools/pdf-to-jpg'             },
      { '@type': 'ListItem', position: 33, name: 'PDF to PNG',              url: 'https://toolbeans.com/tools/pdf-to-png'             },
      { '@type': 'ListItem', position: 34, name: 'PDF to HTML',             url: 'https://toolbeans.com/tools/pdf-to-html'            },
      { '@type': 'ListItem', position: 35, name: 'PDF to CSV',              url: 'https://toolbeans.com/tools/pdf-to-csv'             },
      { '@type': 'ListItem', position: 36, name: 'PDF to Word',             url: 'https://toolbeans.com/tools/pdf-to-word'            },
      { '@type': 'ListItem', position: 37, name: 'PDF to Excel',            url: 'https://toolbeans.com/tools/pdf-to-excel'           },
      { '@type': 'ListItem', position: 38, name: 'PDF to PowerPoint',       url: 'https://toolbeans.com/tools/pdf-to-powerpoint'      },
      { '@type': 'ListItem', position: 39, name: 'PDF to SVG',              url: 'https://toolbeans.com/tools/pdf-to-svg'             },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are all 39 tools on TOOLBeans completely free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. All 39 tools are 100% free with no usage limits, no account and no credit card required.' },
      },
      {
        '@type': 'Question',
        name: 'Do TOOLBeans tools upload my files to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'Browser-based tools like JSON Formatter and Password Generator run entirely in your browser. PDF server tools delete your file immediately after conversion.' },
      },
      {
        '@type': 'Question',
        name: 'Which tools convert PDF files?',
        acceptedAnswer: { '@type': 'Answer', text: 'TOOLBeans has 18 PDF tools: 9 convert TO PDF (Word, Excel, PowerPoint, JPG, PNG, Image, TXT, SVG, HTML) and 9 convert FROM PDF (PDF to Word, PDF to Excel, PDF to PowerPoint, PDF to Text, PDF to JPG, PDF to PNG, PDF to HTML, PDF to CSV, PDF to SVG).' },
      },
    ],
  },
];

// ── Category Pill with dropdown ───────────────────────────────────────────────
function CategoryPill({ cat, toolsList, onFilter, activeFilter }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const pillRef    = useRef(null);
  const isActive   = activeFilter === cat.key;
  const matchedTools = toolsList.filter(t => cat.tools.includes(t.name));
  const hasDropdown  = cat.key !== 'All' && matchedTools.length > 0;
  const [flipLeft, setFlipLeft] = useState(false);

  const checkFlip = () => {
    if (!pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    setFlipLeft(rect.right + 288 > window.innerWidth - 16);
  };
  const open_  = () => { clearTimeout(timeoutRef.current); if (hasDropdown) { checkFlip(); setOpen(true); } };
  const close_ = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120); };

  return (
    <div ref={pillRef} className="relative" onMouseEnter={open_} onMouseLeave={close_}>
      <button
        onClick={() => { onFilter(cat.key); setOpen(false); }}
        aria-label={`Filter by ${cat.label}`}
        className={'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-150 select-none whitespace-nowrap ' +
          (isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50')}
      >
        {cat.label}
        <span className={'text-xs rounded-full px-1.5 py-px font-bold tabular-nums ' + (isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-400')}>
          {cat.key === 'All' ? tools.length : cat.tools.length}
        </span>
        {hasDropdown && (
          <svg className={'w-3 h-3 transition-transform duration-150 ' + (open ? 'rotate-180' : '')} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && hasDropdown && (
        <div
          className={'absolute top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 p-4 w-64 ' + (flipLeft ? 'right-0' : 'left-0')}
          onMouseEnter={() => clearTimeout(timeoutRef.current)} onMouseLeave={close_}
        >
          <div className={'absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45 rounded-sm ' + (flipLeft ? 'right-5' : 'left-5')} />
          <p className="text-xs text-slate-400 font-medium mb-3 pl-0.5">{cat.desc}</p>
          <div className="grid grid-cols-2 gap-1">
            {matchedTools.map(tool => (
              <Link key={tool.href} href={tool.href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors">
                <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">{tool.icon}</span>
                <span className="text-xs font-semibold leading-tight">{tool.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <button onClick={() => { onFilter(cat.key); setOpen(false); }} className="text-xs text-indigo-600 font-bold hover:underline">
              Show all {cat.tools.length} {cat.label} tools
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Show max 5 page buttons
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        aria-label="Previous page"
        className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        Prev
      </button>

      {getPages().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={'px-4 py-2 text-sm font-bold rounded-xl border transition-all ' +
            (page === currentPage
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600')}>
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        aria-label="Next page"
        className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        Next
      </button>
    </nav>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage,  setCurrentPage]  = useState(1);

  const filteredTools = activeFilter === 'All'
    ? tools
    : tools.filter(t => t.badge === activeFilter);

  const totalPages     = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);
  const startIndex     = (currentPage - 1) * TOOLS_PER_PAGE;
  const pagedTools     = filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE);
  const activeCategory = categories.find(c => c.key === activeFilter);

  const handleFilter = (key) => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── SEO meta injected via next/head pattern for client component ── */}
      {/* NOTE: Since this is 'use client', add metadata export in a separate */}
      {/* layout.js or use the metadata export from a server wrapper.         */}
      {/* The JSON-LD below works regardless of client/server.                */}

      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen">

        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">

            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-600 font-semibold" aria-current="page">All Tools</span>
            </nav>

            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-indigo-100">
              39 Free Tools
            </span>

            {/* H1  unique and keyword-rich as required by SEO document */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              All 39 Free Online{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Developer and PDF Tools
              </span>
            </h1>

            <p className="text-base text-slate-500 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Browse all 39 free developer tools on TOOLBeans. JSON formatter, password generator,
              Word to PDF, PDF to Word, JWT decoder, regex tester and more. No account needed,
              no usage limits, works in any browser.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {[{v:'39',l:'Free Tools'},{v:'0',l:'Sign-up Needed'},{v:'100%',l:'Free Forever'},{v:'No',l:'Usage Limit'}].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-2xl font-extrabold text-slate-900">{s.v}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <CategoryPill key={cat.key} cat={cat} toolsList={tools} onFilter={handleFilter} activeFilter={activeFilter} />
              ))}
            </div>
          </div>
        </section>

        {/* AD  kept commented, do not remove */}
        {/*
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement  728×90
          </div>
        </div>
        */}

        {/* TOOLS GRID */}
        <section className="max-w-6xl mx-auto px-6 pb-10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {activeFilter === 'All' ? 'All Tools' : activeFilter + ' Tools'}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  {filteredTools.length} available · page {currentPage} of {totalPages}
                </span>
              </h2>
              {activeFilter !== 'All' && activeCategory?.desc && (
                <p className="text-xs text-slate-400 mt-0.5">{activeCategory.desc}</p>
              )}
            </div>
            {activeFilter !== 'All' && (
              <button onClick={() => handleFilter('All')} className="text-xs text-indigo-600 font-semibold hover:underline">
                Show All 39 Tools
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pagedTools.map(tool => (
              <article key={tool.href} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 flex flex-col group">
                <div className="flex items-start justify-between mb-4">
                  <div className={'w-12 h-12 ' + tool.color + ' rounded-xl flex items-center justify-center text-2xl flex-shrink-0'} aria-hidden="true">
                    {tool.icon}
                  </div>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + tool.badgeColor}>{tool.badge}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{tool.desc}</p>
                <p className="sr-only">{tool.keywords}</p>
                <Link
                  href={tool.href}
                  aria-label={'Open ' + tool.name}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                  Open Tool
                </Link>
              </article>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3" aria-hidden="true">🔍</div>
              <p className="font-semibold text-slate-500">No tools in this category yet.</p>
              <button onClick={() => handleFilter('All')} className="mt-3 text-sm text-indigo-600 font-semibold hover:underline">
                Show all 39 tools
              </button>
            </div>
          )}

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

          {/* AD BOTTOM  kept commented, do not remove */}
          {/*
          <div className="mt-10">
            <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
              Advertisement  728×90
            </div>
          </div>
          */}

          {/* Tag cloud */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">All 39 Free Tools</p>
            <div className="flex flex-wrap gap-2">
              {tools.map(t => (
                <Link key={t.href} href={t.href}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-150">
                  <span className="text-sm leading-none" aria-hidden="true">{t.icon}</span>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ  required by SEO document */}
          <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-5">
              {[
                { q: 'Are all 39 tools on TOOLBeans free?',          a: 'Yes. All 39 tools are 100% free with no usage limits. No account, no credit card and no subscription is ever required.' },
                { q: 'Do the tools upload my files to a server?',     a: 'Browser-based tools like JSON Formatter, Password Generator and Regex Tester run entirely in your browser. Nothing is sent to any server. PDF server tools like Word to PDF delete your file immediately after conversion.' },
                { q: 'What PDF tools are available?',                 a: 'TOOLBeans offers 18 PDF tools: 9 convert TO PDF (Word, Excel, PowerPoint, JPG, PNG, Image, TXT, SVG, HTML) and 9 convert FROM PDF (PDF to Word, PDF to Excel, PDF to PowerPoint, PDF to Text, PDF to JPG, PDF to PNG, PDF to HTML, PDF to CSV, PDF to SVG).' },
                { q: 'Which tools work without internet?',            a: 'All 21 browser-based developer tools work offline after the page loads. PDF server tools require an internet connection to process your file.' },
              ].map(faq => (
                <div key={faq.q} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-2">Missing a Tool?</h2>
            <p className="text-indigo-100 text-sm font-light mb-6 max-w-md mx-auto">
              New tools are added regularly. Send a request and it will likely be built next.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm">
              Request a Tool
            </Link>
          </div>
        </section>

        {/* SEO TEXT */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              39 Free Tools Developer Utilities and PDF Converters
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans offers 39 free tools: 21 browser-based developer utilities and 18 PDF converters.
              Browser tools run entirely client-side with no data sent to any server, making them safe for
              production data, JWT tokens, passwords and sensitive files.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Developer tools include a{' '}
              <Link href="/tools/password-generator" className="text-indigo-600 hover:underline">password generator</Link>,{' '}
              <Link href="/tools/json-formatter"     className="text-indigo-600 hover:underline">JSON formatter</Link>,{' '}
              <Link href="/tools/jwt-decoder"        className="text-indigo-600 hover:underline">JWT decoder</Link>,{' '}
              <Link href="/tools/diff-checker"       className="text-indigo-600 hover:underline">diff checker</Link>,{' '}
              <Link href="/tools/regex-tester"       className="text-indigo-600 hover:underline">regex tester</Link>,{' '}
              <Link href="/tools/qr-code-generator"  className="text-indigo-600 hover:underline">QR code generator</Link> and more.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              PDF tools include{' '}
              <Link href="/tools/word-to-pdf"        className="text-indigo-600 hover:underline">Word to PDF</Link>,{' '}
              <Link href="/tools/excel-to-pdf"       className="text-indigo-600 hover:underline">Excel to PDF</Link>,{' '}
              <Link href="/tools/pdf-to-word"        className="text-indigo-600 hover:underline">PDF to Word</Link>,{' '}
              <Link href="/tools/pdf-to-excel"       className="text-indigo-600 hover:underline">PDF to Excel</Link>,{' '}
              <Link href="/tools/pdf-to-jpg"         className="text-indigo-600 hover:underline">PDF to JPG</Link>,{' '}
              <Link href="/tools/pdf-to-text"        className="text-indigo-600 hover:underline">PDF to Text</Link> and more.
              All 39 tools are permanently free with no account required.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}