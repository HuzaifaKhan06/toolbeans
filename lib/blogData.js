// lib/blogData.js
// All 21 blog posts — one per tool
// Human-written tone, keyword-rich, no fluff, Google-ready

export const blogPosts = [
  {
    slug: 'how-to-create-strong-passwords',
    title: 'How to Create Strong Passwords That Are Actually Hard to Crack',
    description: 'Most people use weak passwords without realizing it. Learn what makes a password strong, how attackers crack them, and how to generate secure passwords instantly.',
    category: 'Security',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    date: '2025-01-15',
    readTime: '6 min read',
    tool: { name: 'Password Generator', href: '/tools/password-generator', icon: '🔐' },
    keywords: ['strong password', 'password generator', 'password security', 'secure password tips', 'random password'],
    content: `
## Why Most Passwords Get Cracked in Minutes

Here is something most people do not want to hear: if your password is a word from the dictionary — even with a number at the end — hackers can crack it in under a minute. Not because they are sitting there guessing one by one. They use automated tools that run through billions of combinations per second.

Password cracking falls into a few common methods. Dictionary attacks try every real word plus common variations. Brute-force attacks try every possible character combination up to a certain length. Credential stuffing attacks use passwords leaked from other websites — and since people reuse passwords, it works more often than you would think.

The math is brutal. A 6-character lowercase password has about 300 million possible combinations. Modern hardware can crack that in under a second. A 12-character password using mixed characters, numbers and symbols? That is 475 quadrillion combinations. Even the fastest supercomputer would take thousands of years.

## What Actually Makes a Password Strong

Length matters more than anything else. Every extra character multiplies the difficulty exponentially, not just additively. A 16-character password is not just twice as hard to crack as an 8-character one — it is astronomically harder.

Beyond length, the character set matters. Using only lowercase letters gives you 26 options per position. Add uppercase and you get 52. Add numbers for 62. Add symbols and you jump to 94 or more. More options per position combined with more positions means the attacker has to try vastly more combinations.

Here is what a good password actually looks like: random, long, and never reused. Something like \`mK9#vL2@pQx7!nRt\` — 16 characters, mixed everything. Yes, it looks impossible to remember. That is fine. That is what password managers are for.

## The Three Rules That Actually Protect You

**Rule 1 — Never reuse passwords.** When a website gets breached (and they do, constantly), attackers get your password for that site. If you used the same password on your bank account, email, or social media, you are now compromised on all of them. Every account needs its own unique password.

**Rule 2 — Make them at least 14 characters.** 12 is the old minimum. With modern computing power, push it to 14 or 16. Longer is always better.

**Rule 3 — Use a password manager.** Tools like Bitwarden, 1Password, or even your browser's built-in manager store your passwords encrypted. You only need to remember one master password. The manager generates and fills in random strong passwords for everything else.

## Common Password Mistakes

Substituting letters for numbers does not help as much as you think. Replacing 'a' with '@' or 'i' with '1' is a known technique and modern crackers account for it. \`p@ssw0rd\` is not a strong password. It falls in under a second.

Adding your birth year, pet's name, or favourite sports team makes the password personal — and personal information is easier to guess, especially with social engineering. Attackers often research targets before trying to crack accounts.

Using the same base password with slight variations per site is also dangerous. \`MySitePassword1\`, \`MySitePassword2\`, \`MySitePassword3\` — once an attacker knows the pattern, they will try variations on every site.

## How to Generate Strong Passwords Right Now

The fastest way is to use a dedicated password generator. Our free Password Generator tool creates cryptographically random passwords with one click. You can set the length (we recommend 16+), choose which character types to include, and copy the result directly.

The randomness is the key part. Human brains are terrible at generating truly random sequences. We have patterns we do not even know about. A computer-generated password has no pattern, no bias, and no personal connection — making it as strong as it can possibly be.

Generate one now and drop it into your password manager. It takes about 30 seconds and dramatically improves your security.
    `,
  },

  {
    slug: 'how-to-create-qr-codes',
    title: 'How to Create QR Codes for Free — A Complete Guide for 2025',
    description: 'QR codes connect physical things to the internet. Learn how they work, what you can encode in them, and how to generate them for free without any app.',
    category: 'Utility',
    categoryColor: 'bg-slate-50 text-slate-700 border-slate-200',
    date: '2025-01-22',
    readTime: '5 min read',
    tool: { name: 'QR Code Generator', href: '/tools/qr-code-generator', icon: '📱' },
    keywords: ['qr code generator', 'create qr code', 'free qr code', 'qr code for website', 'qr code maker'],
    content: `
## What Is a QR Code and Why Does It Still Matter

QR stands for Quick Response. It is a two-dimensional barcode that smartphones can read with their camera to instantly open a URL, contact card, wifi network, or any other piece of information.

They were invented in 1994 for tracking car parts in Japan. For years, they were mostly ignored by the general public. Then the pandemic happened. Restaurants replaced physical menus with QR code links to online ones, and suddenly everyone knew how to scan them.

Now they are everywhere — product packaging, business cards, event tickets, museum exhibits, shop windows, and print ads. They bridge the gap between physical and digital in a way that typing a URL just does not.

## What You Can Put in a QR Code

Most people think QR codes are just for website links. But they can encode a lot more than that.

**Website URL** — The most common use. Point people to your business website, portfolio, or any specific page.

**WiFi credentials** — Encode your network name and password so guests can connect without typing it out. Works on both Android and iPhone.

**Contact information** — Store a full vCard so someone can add you to their contacts with a single scan instead of typing everything manually.

**Plain text** — Sometimes you just need to share a piece of information quickly without hosting it anywhere.

**Email or phone** — Scanning opens a pre-addressed email compose window or taps to call, depending on how you encode it.

## The Technical Side (Simplified)

QR codes work using a grid of black and white squares. The three large squares in the corners tell the scanner which way is up. The smaller squares encode the actual data using a pattern that is resistant to damage — you can actually cover up to 30% of a QR code and it still scans correctly, which is why you see logos placed in the center of custom-branded QR codes.

Error correction levels let you trade off storage capacity for durability. Higher error correction means more redundant data, so the code still works when it is partially obscured or damaged. For most uses, medium error correction is fine.

## How to Generate a QR Code in Seconds

You do not need an app, a subscription, or an account. Our free QR Code Generator handles it right in your browser.

Just type or paste whatever you want to encode — a URL, phone number, text, wifi credentials — and the QR code generates instantly. Download it as a PNG and it is ready to use in presentations, print materials, or anywhere else.

A few practical tips: test your QR code on an actual phone before printing thousands of business cards. Make sure the destination URL works. And if you are printing small, pick a shorter URL or a URL shortener link so the QR code does not become overly dense and hard to scan.

For printed materials, go with a minimum size of about 2cm × 2cm. Any smaller and cheap phone cameras may struggle to read it reliably.
    `,
  },

  {
    slug: 'what-is-base64-encoding',
    title: 'What Is Base64 Encoding? A Plain-English Explanation',
    description: 'Base64 turns binary data into text so it can travel safely through text-only systems. Here is what it actually does, why it exists, and when you should use it.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-02-03',
    readTime: '7 min read',
    tool: { name: 'Base64 Encoder / Decoder', href: '/tools/base64-encoder-decoder', icon: '🔄' },
    keywords: ['base64 encoding', 'base64 encoder decoder', 'what is base64', 'base64 explained', 'encode decode base64'],
    content: `
## The Problem Base64 Solves

Computers store everything as binary — ones and zeros. Text is also binary under the hood, but text systems have agreed-upon rules for which binary patterns mean which characters. The problem is that some binary data — images, audio files, encrypted content — contains byte patterns that collide with special control characters in text systems.

Send an image file through an old email server that treats certain byte sequences as "end of message" and your file arrives corrupted. Or try to embed binary data in a JSON field and the quote characters inside the data break the JSON structure.

Base64 was created to solve this. It converts any binary data into a string that uses only 64 safe characters: the 26 uppercase letters, 26 lowercase letters, digits 0–9, and two symbols (+ and /). No matter what the original data contains, the output is always plain, printable text that can safely pass through any text-only system.

## How the Encoding Actually Works

Base64 takes your input data three bytes at a time. Three bytes is 24 bits. It splits those 24 bits into four groups of 6 bits each. Each 6-bit group becomes an index into the Base64 alphabet, which maps to one of the 64 safe characters.

The result: every 3 bytes of input becomes 4 characters of output. That is why Base64 increases file size by about 33%. You get text-safety in exchange for about a third more data.

If your input is not a multiple of three bytes, padding characters (=) are added at the end to keep the structure consistent.

## Where You See Base64 in the Real World

**Email attachments** — The MIME standard uses Base64 to encode attachments so they survive email systems that only handle plain text. Every PDF you send via email is Base64-encoded in transit.

**Data URLs** — When you see \`<img src="data:image/png;base64,iVBORw...">\` in HTML, that is an entire image encoded as Base64 and embedded directly in the HTML file. No separate image request needed.

**Basic authentication** — HTTP Basic Auth encodes the username and password as Base64 before sending them in the Authorization header. Note: this is encoding, not encryption. Base64 is trivially reversible.

**JWT tokens** — JSON Web Tokens use Base64 URL encoding (a slight variant) for their header and payload sections.

**Storing binary data in JSON** — When an API needs to return an image, certificate, or other binary blob inside a JSON response, Base64 is the standard way to do it.

## Base64 Is Not Encryption

This is the most common misconception. Base64 is encoding — it is a completely reversible transformation with no secret key involved. Anyone can decode it immediately. It is not meant to protect data, just to make it text-safe.

If you need to protect data, use encryption. If you just need to transmit binary data through a text channel, Base64 is the right tool.

## How to Encode and Decode

You can use our free Base64 Encoder/Decoder tool — paste any text or upload a file and get the Base64 output instantly. Paste Base64 back in to decode it. No installation, no account, nothing stored on our end.

In code: JavaScript has \`btoa()\` to encode and \`atob()\` to decode. In Python, it is \`base64.b64encode()\` and \`base64.b64decode()\`. In terminal on Mac or Linux, \`base64\` and \`base64 -d\` handle it.
    `,
  },

  {
    slug: 'how-to-format-and-validate-json',
    title: 'How to Format and Validate JSON — and What to Do When It Breaks',
    description: 'JSON errors are some of the most frustrating bugs. Learn how JSON works, what causes validation errors, and how to format messy JSON into clean readable code instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-02-10',
    readTime: '8 min read',
    tool: { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{ }' },
    keywords: ['json formatter', 'json validator', 'format json online', 'json error', 'pretty print json', 'validate json'],
    content: `
## What JSON Actually Is

JSON stands for JavaScript Object Notation. It is a text format for representing structured data — objects, arrays, strings, numbers, booleans, and null values — in a way that is easy for both humans and machines to read.

It became the standard data format for web APIs because it is simpler than XML, readable without special tools, and natively understood by JavaScript. Today it is used everywhere: REST APIs, config files, databases, log files, browser storage, and more.

A valid JSON document is either an object (\`{...}\`) or an array (\`[...]\`). Everything inside follows strict syntax rules. Unlike JavaScript itself, JSON does not allow trailing commas, single quotes, or comments. These rules are what trip people up most often.

## The Most Common JSON Errors

**Trailing comma** — This is the number one mistake. In JavaScript you can write \`{ "name": "Alice", }\` but in JSON, that trailing comma after the last item is a syntax error.

**Single quotes** — JSON requires double quotes for strings. \`{ 'name': 'Alice' }\` is invalid. \`{ "name": "Alice" }\` is correct.

**Unquoted keys** — JavaScript allows \`{ name: "Alice" }\` but JSON does not. Keys must always be quoted strings.

**Comments** — JSON does not support comments at all. \`// this is a comment\` will break your JSON completely.

**Unclosed brackets** — One missing \`}\` or \`]\` somewhere deep in a large JSON structure will make the whole thing invalid.

**Incorrect nesting** — Opening with \`{\` and closing with \`]\` (or vice versa) causes parse errors that can be hard to spot in long files.

## How to Read a JSON Error Message

JSON parsers typically tell you the line and column where they gave up — but they report the position where they detected the failure, not necessarily where the actual mistake is.

For example: \`SyntaxError: Unexpected token '}' at position 234\` usually means the parser found a closing brace where it did not expect one — which often means you are missing an opening brace or have an extra comma somewhere earlier in the file.

The best approach: paste the broken JSON into a formatter. Good formatters not only show you where the error is but also highlight the surrounding context, making it much easier to spot what is wrong.

## Why Formatting Matters Beyond Readability

Minified JSON (all on one line, no spaces) is smaller — useful for network transfer. But for humans working with it, readable formatting with indentation is essential.

Indented JSON lets you see the nesting structure at a glance. You can immediately see that a key belongs to an inner object rather than the outer one. You can count brackets. You can spot when an array has fewer items than expected.

Well-formatted JSON also makes version control diffs much cleaner. When minified JSON changes, a diff might show one enormous line changed. When formatted JSON changes, the diff shows exactly which key or value was modified.

## Formatting JSON Instantly

Our JSON Formatter tool takes any JSON — even messy, minified, or partially broken — and reformats it with proper indentation. It validates as you type, highlights errors with the exact position, and lets you choose 2-space or 4-space indentation.

Paste your JSON, see it cleaned up in seconds, copy the result. If there are errors, the tool tells you exactly where and what went wrong so you can fix them without guessing.
    `,
  },

  {
    slug: 'what-is-jwt-and-how-it-works',
    title: 'What Is a JWT Token and How Does It Work?',
    description: 'JWT tokens are used by almost every modern web app for authentication. Here is what they contain, how they are verified, and what to watch out for when working with them.',
    category: 'Security',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    date: '2025-02-18',
    readTime: '8 min read',
    tool: { name: 'JWT Decoder', href: '/tools/jwt-decoder', icon: '🔑' },
    keywords: ['jwt token', 'jwt decoder', 'what is jwt', 'json web token', 'jwt authentication', 'decode jwt'],
    content: `
## The Problem JWT Solves

When you log into a website, the server needs a way to remember who you are on subsequent requests. HTTP is stateless — each request is independent with no memory of previous ones.

The old approach was server-side sessions. The server stores your session in memory or a database, gives you a session ID in a cookie, and looks it up on every request. This works, but it means session data must be shared across all servers in a cluster, and it does not work well for APIs called by mobile apps or third-party services.

JWT — JSON Web Token — takes a different approach. Instead of storing session data on the server, the server encodes all the relevant information into a token and sends it to the client. The client sends this token with every subsequent request. The server verifies it cryptographically and extracts the data without hitting a database.

## What a JWT Actually Contains

A JWT looks like three Base64URL-encoded strings joined by dots: \`header.payload.signature\`

The **header** contains the token type (JWT) and the signing algorithm used (typically HS256 or RS256).

The **payload** contains claims — statements about the user and metadata. Standard claims include \`sub\` (subject — the user ID), \`exp\` (expiration timestamp), \`iat\` (issued at timestamp), and \`iss\` (issuer — who created the token). You can also add custom claims like roles, permissions, or any user data your app needs.

The **signature** is what makes the token trustworthy. The header and payload are hashed together with a secret key (for HS256) or signed with a private key (for RS256). The server verifies this on every request. If anyone tampers with the payload, the signature stops matching and the token is rejected.

## What the Payload Looks Like When Decoded

When you decode the payload from Base64, you get a plain JSON object like this:

\`\`\`json
{
  "sub": "user_12345",
  "email": "alice@example.com",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1704153600
}
\`\`\`

The \`exp\` field is a Unix timestamp. When this timestamp is in the past, the token is expired and the server will reject it. This is why JWT authentication errors often look like "token expired" — the token was valid when issued but has a short lifespan by design.

## The Security Considerations You Should Know

**JWTs are not secret.** The header and payload are only Base64-encoded, not encrypted. Anyone who gets your token can decode it and read everything in the payload. Do not put passwords, credit card numbers, or genuinely sensitive data in a JWT payload.

**The signature protects integrity, not confidentiality.** The signature means nobody can modify the token without the server detecting it. But it does not prevent anyone from reading the token.

**Short expiry times matter.** Because JWTs cannot be easily revoked (the server does not track them), short expiration times limit the damage if a token is stolen. Access tokens typically expire in 15 minutes to an hour. Refresh tokens last longer and are used to get new access tokens.

**The "none" algorithm vulnerability.** Some early JWT libraries accepted tokens with the algorithm set to "none" in the header, meaning no signature was required. Modern libraries have fixed this, but it is worth knowing — always explicitly specify which algorithms your server accepts.

## How to Inspect a JWT

If you are debugging an API and need to see what is inside a token, our JWT Decoder tool decodes any JWT instantly. Paste the token and you see the header, payload, and signature breakdown with human-readable timestamps for the \`exp\` and \`iat\` fields.

This is useful for checking whether a token is expired, confirming which user ID or role is encoded, or verifying the token format when debugging authentication issues.
    `,
  },

  {
    slug: 'ideal-word-count-for-blog-posts-seo',
    title: 'How Many Words Should a Blog Post Be? The Real Answer for SEO in 2025',
    description: 'Word count is one of the most misunderstood SEO topics. Here is what actually matters, what the data shows, and how to count words on any piece of content instantly.',
    category: 'Writing',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    date: '2025-03-01',
    readTime: '6 min read',
    tool: { name: 'Word Counter', href: '/tools/word-counter', icon: '📝' },
    keywords: ['word counter', 'word count seo', 'ideal blog post length', 'how many words blog post', 'reading time calculator'],
    content: `
## Does Word Count Actually Matter for SEO

The short answer: yes, but not in the way most people think. Google does not have a minimum word count requirement. A 200-word page can rank #1 if it perfectly answers the search query. A 5,000-word page can sit on page 10 if it is padding and repetition.

What actually matters is that your content covers the topic thoroughly. And comprehensive coverage of most non-trivial topics naturally produces longer content — not the other way around. Word count is a symptom of quality, not a cause.

That said, data from multiple large-scale SEO studies consistently shows that top-ranking pages for competitive keywords tend to have between 1,500 and 2,500 words. This is because high-ranking pages tend to be comprehensive — covering related subtopics, answering follow-up questions, and providing context that thin pages skip.

## What the Numbers Actually Mean

Here is a rough guideline by content type:

**Short informational posts (300–600 words)** — These work well for simple factual queries with a clear, direct answer. "What is the capital of France?" does not need 2,000 words.

**Standard blog posts (800–1,500 words)** — Good for how-to guides, opinion pieces, and news coverage where you need context but not exhaustive depth.

**Long-form content (1,500–3,000 words)** — The sweet spot for most competitive SEO topics. Enough room to cover the main topic and related subtopics thoroughly.

**Comprehensive guides (3,000+ words)** — Reserved for pillar content, ultimate guides, and topics that genuinely require depth. Does not work unless every paragraph earns its place.

## Reading Time and Audience Expectations

The average reader reads about 238 words per minute. That means a 1,000-word article takes roughly four minutes to read. A 2,500-word article is about ten minutes.

Audience expectations matter here. Someone searching for a quick definition wants a 30-second answer. Someone reading a tutorial is prepared to spend 15 minutes. Match your depth to your reader's intent.

This is also why reading time displayed on blog posts ("5 min read") has become standard — it sets expectations upfront so readers do not bounce immediately when they see a long article.

## How to Use a Word Counter Effectively

Our Word Counter tool gives you word count, character count, sentence count, paragraph count, and reading time all at once. Paste your draft in and see everything immediately.

More useful than the raw count: keyword density. If you are writing a post targeting "base64 encoding," the tool can show you how often that phrase appears relative to the total word count. Generally, 1–2% density is natural. Higher than that starts to feel forced, which both readers and Google notice.

Use the word counter at the end of your draft to check length, and also mid-draft to make sure you are not running too long in the introduction before getting to the actual content.
    `,
  },

  {
    slug: 'what-is-lorem-ipsum-and-why-designers-use-it',
    title: 'What Is Lorem Ipsum? Why Designers Still Use Placeholder Text in 2025',
    description: 'Lorem ipsum has been used as placeholder text for over 500 years. Here is where it comes from, why designers rely on it, and how to generate as much as you need.',
    category: 'Design',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '2025-03-08',
    readTime: '5 min read',
    tool: { name: 'Lorem Ipsum Generator', href: '/tools/lorem-ipsum', icon: '✍️' },
    keywords: ['lorem ipsum generator', 'what is lorem ipsum', 'placeholder text', 'dummy text generator', 'lorem ipsum meaning'],
    content: `
## The 500-Year-Old Placeholder

Lorem ipsum text has been used by typesetters since the 1500s. It comes from a work by the Roman philosopher Cicero — specifically "de Finibus Bonorum et Malorum" (On the Ends of Good and Evil), written in 45 BC. The standard lorem ipsum text is a scrambled, Latin-looking excerpt from that work.

It was popularised in the 1960s with the release of Letraset sheets containing lorem ipsum passages. Then desktop publishing software like Aldus PageMaker included it as the default placeholder. When the web arrived, it became the standard for web design mockups too.

The text has survived for centuries for one simple reason: it works perfectly for what it is meant to do.

## Why Not Just Use Real Text?

When you are showing a client a design mockup or testing a layout before the actual copy is written, using real text creates a distraction problem.

If you put real words in a layout mockup, people read the words instead of evaluating the design. They give feedback on the content rather than the visual hierarchy, spacing, and typography. "I don't like the headline" when you wanted them to comment on whether the sidebar is too wide.

Lorem ipsum solves this. It looks like text, takes up space like text, and creates the visual impression of a real document — but nobody reads it. Reviewers focus on what you want them to focus on: the layout.

## The Other Reason: Writing Takes Time

Design and copywriting rarely happen simultaneously. Designers need to show progress while copywriters are still working on the actual content. Lorem ipsum fills the space temporarily so the design can be presented, approved, and refined while the words catch up.

The same applies to developers building UI components. You need realistic-looking text in your components while testing layouts — lorem ipsum is faster than constantly inventing fake content.

## Different Flavours for Different Contexts

Classic lorem ipsum is fine for most cases, but if you want something that feels more contextually appropriate, you can generate placeholder text in different styles:

**Tech / developer-flavoured** — Uses programming terminology for mocking up developer-focused interfaces without the ancient-Latin feel.

**Business copy** — Sounds like marketing copy, appropriate for corporate templates and business website mockups.

**Casual / conversational** — Reads like blog content, good for article and blog layout testing.

Our Lorem Ipsum Generator lets you pick your style, choose paragraphs, sentences, or word count, and get the output instantly. You can also get it wrapped in HTML tags for direct pasting into code.

## One Caveat Worth Knowing

Do not ship lorem ipsum to production. This sounds obvious but it happens more often than you would think — an unfinished section goes live with placeholder text, or a test database entry ends up in a live product. Always search for "lorem" before you ship.
    `,
  },

  {
    slug: 'how-to-pick-perfect-colors-for-your-website',
    title: 'How to Pick the Right Colors for Your Website (Without Being a Designer)',
    description: 'Color choices make or break a website\'s credibility. Learn color theory basics, the difference between HEX, RGB and HSL, and how to build a palette that actually works.',
    category: 'Design',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '2025-03-15',
    readTime: '9 min read',
    tool: { name: 'Color Picker', href: '/tools/color-picker', icon: '🎨' },
    keywords: ['color picker', 'website color palette', 'hex rgb hsl', 'color theory web design', 'color palette generator'],
    content: `
## Why Color Choices Matter More Than You Think

Colors communicate before words do. Within 90 milliseconds of landing on a page, a visitor has formed a visual impression — and color is the dominant factor. That first impression affects credibility, trust, and whether someone stays or leaves.

Research on color and brand perception shows that up to 90% of snap judgments about products are based on color alone. This is not about making things pretty — it is about communicating the right thing to the right audience.

A financial services company and a children's toy company should not have the same color palette. The colors signal completely different things: stability and trust versus fun and playfulness. Getting this wrong does not just look off — it actively undermines what you are trying to communicate.

## The Three Color Formats Explained

You will encounter three main color formats working on the web.

**HEX** — The most common in web development. A \`#\` followed by six characters (0–9 and A–F), like \`#3B82F6\`. The first two characters are red, the next two are green, the last two are blue. All in hexadecimal.

**RGB** — Red, Green, Blue. Each channel is a number from 0 to 255. \`rgb(59, 130, 246)\` is the same blue as \`#3B82F6\`. Easier to understand intuitively — you can roughly picture what 200 red, 100 green, 50 blue would look like.

**HSL** — Hue, Saturation, Lightness. Hue is the color itself (0–360 degrees around a color wheel). Saturation is how vivid it is (0% is grey, 100% is fully saturated). Lightness is how light or dark (0% is black, 100% is white). HSL is the most intuitive for actually adjusting colors — if you want a lighter version of a color, you just increase the L value.

## Color Theory Basics for Non-Designers

You do not need to understand all of color theory, but a few concepts help enormously.

**Complementary colors** sit opposite each other on the color wheel. Blue and orange. Red and green. Purple and yellow. They create high contrast and visual energy — good for calls to action, but overwhelming if overused everywhere.

**Analogous colors** sit next to each other on the color wheel. Blue, blue-green, and teal. These create harmony and cohesion — good for backgrounds and content areas where you want things to feel unified.

**Triadic colors** form a triangle on the color wheel. They are vibrant and balanced, but hard to use well. Usually one color dominates, and the other two are used as accents.

## Building a Practical Web Palette

Most good website color schemes follow this structure:

One **primary color** — your main brand color. Used for primary buttons, links, and key UI elements.

One **secondary color** — complements the primary. Used for secondary buttons, highlights, or accent elements.

**Neutral colors** — greys and near-whites for backgrounds, borders, and text. These make up the bulk of most websites.

**Semantic colors** — green for success, red for errors, yellow for warnings. These follow universal conventions and should not be changed to match your brand — confusion costs more than consistency.

## Accessibility and Contrast

Color contrast is not optional if you want your site to work for everyone — and WCAG standards for contrast are increasingly expected by clients and legally required in some jurisdictions.

The minimum contrast ratio for regular text is 4.5:1 against its background. For large text (18pt+), it is 3:1. Our Color Picker tool shows WCAG compliance grades for both white and black text against your chosen color, so you can verify accessibility as you design.

## Using the Color Picker

Pick a base color, then explore the harmony palettes — complementary, analogous, triadic and more are all generated automatically. The tints and shades tab gives you a 10-step scale from light to dark for that color, perfect for building the kind of consistent color scale that Tailwind CSS popularized.

The curated palette library has 112 hand-picked palettes across categories like Trending 2025, Nature, Neon, Minimal, and more — if you need a starting point rather than building from scratch.
    `,
  },

  {
    slug: 'unix-timestamp-explained',
    title: 'Unix Timestamps Explained — What They Are and How to Convert Them',
    description: 'Unix timestamps appear in logs, APIs, and databases everywhere. Here is what they actually mean, why developers use them, and how to convert them to readable dates instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-03-22',
    readTime: '6 min read',
    tool: { name: 'Timestamp Converter', href: '/tools/timestamp-converter', icon: '⏱️' },
    keywords: ['unix timestamp', 'timestamp converter', 'epoch time', 'convert unix timestamp', 'what is unix timestamp'],
    content: `
## What Is a Unix Timestamp

A Unix timestamp is the number of seconds that have elapsed since January 1, 1970, at 00:00:00 UTC. That specific moment in time is called the Unix epoch, and it was chosen somewhat arbitrarily when Unix operating systems were being developed in the late 1960s.

As of early 2025, the current Unix timestamp is around 1,700,000,000 — meaning about 1.7 billion seconds have passed since the Unix epoch. This number increments by one every second, forever.

Millisecond timestamps — used in JavaScript and many modern systems — are 1,000 times larger. If you see a timestamp like \`1704067200000\`, those last three zeros tell you it is milliseconds. Divide by 1,000 to get seconds.

## Why Developers Use Timestamps Instead of Dates

**They are timezone-neutral.** A Unix timestamp represents a single absolute moment in time. When you store \`1704067200\` in a database, it means exactly the same instant to a server in New York, London, or Tokyo. There is no ambiguity about which timezone applies.

Storing a date-time string like "2024-01-01 12:00:00" without timezone information creates ambiguity. Was that noon UTC? Noon Eastern? Noon in someone's local time? Timestamps eliminate this entire class of bug.

**They are easy to compare and calculate.** Want to know if event A happened before event B? Compare the timestamps. Want to find all events in the last 7 days? Subtract 604,800 (7 days in seconds) from now and filter. Simple arithmetic, no calendar logic needed.

**They are compact.** A 10-digit integer is smaller than a formatted date string and sorts correctly without any special handling.

## The 2038 Problem

Unix timestamps stored as 32-bit signed integers max out at 2,147,483,647 — which corresponds to January 19, 2038, at 03:14:07 UTC. After that second, 32-bit systems that have not been updated will roll over to a large negative number, representing December 13, 1901.

This is the Unix equivalent of Y2K. Most modern systems use 64-bit integers which extend the range to hundreds of billions of years in the future — effectively forever. But embedded systems, legacy hardware, and older software may still be affected.

## Common Timestamp Formats You Will See

**Unix seconds** — \`1704067200\` — 10 digits as of 2024.

**Unix milliseconds** — \`1704067200000\` — 13 digits, used by JavaScript's \`Date.now()\` and many APIs.

**ISO 8601** — \`2024-01-01T00:00:00Z\` — A text format with timezone explicitly included (Z means UTC). The international standard and preferred format for human-readable timestamps in APIs.

**SQL DateTime** — \`2024-01-01 00:00:00\` — Used in databases. Often timezone-naive unless explicitly stored with timezone info.

## Converting Timestamps Quickly

Our Timestamp Converter accepts any format — Unix seconds, milliseconds, ISO 8601, or plain date strings — and converts to all of them simultaneously. It also shows the timestamp across 23 world timezones at once, the day of week, week number, and quarter.

Particularly useful when reading API responses or log files where timestamps appear as raw numbers — paste the number and instantly see what date and time it represents.
    `,
  },

  {
    slug: 'how-to-convert-csv-to-sql',
    title: 'How to Convert CSV Data to SQL INSERT Statements (Any Database)',
    description: 'Moving data from a spreadsheet to a database is a common task. Learn how CSV to SQL conversion works, what to watch out for, and how to do it for any SQL dialect.',
    category: 'Data',
    categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
    date: '2025-03-29',
    readTime: '7 min read',
    tool: { name: 'CSV to SQL Converter', href: '/tools/csv-to-sql', icon: '🗄️' },
    keywords: ['csv to sql', 'convert csv to sql', 'csv to mysql', 'import csv database', 'csv sql insert statements'],
    content: `
## Why CSV to SQL Conversion Is Such a Common Task

CSV is the universal file format for tabular data. Every spreadsheet tool exports it, every database can import from it, and it is simple enough to be generated by almost any software. It is the closest thing the data world has to a universal language.

SQL databases, on the other hand, require structured INSERT statements to load data. The gap between a raw CSV file and a working SQL import is exactly what CSV-to-SQL converters bridge.

Common scenarios: a client sends you data in an Excel file and you need to load it into a MySQL database. You have a dataset exported from one tool and need it in PostgreSQL. You want to seed a development database with realistic-looking test data. In each case, you need to go from rows of comma-separated values to valid SQL syntax.

## What Happens During Conversion

The converter does several things automatically that would take significant time to do by hand.

**Parsing** — It reads the CSV header row to determine column names and reads each subsequent row as a data row. It handles quoted values (fields that contain commas themselves are wrapped in quotes), different delimiters (some files use semicolons or tabs instead of commas), and inconsistent line endings.

**Type detection** — Looking at the actual values in each column, it infers the appropriate SQL data type. A column with values like 28, 34, 45 gets \`INT\`. A column with 75000.00 gets \`DECIMAL(10,2)\`. A column with true/false gets \`TINYINT(1)\` in MySQL or \`BOOLEAN\` in PostgreSQL. Date-shaped strings get \`DATE\` or \`DATETIME\`.

**Dialect-specific syntax** — MySQL uses backtick quoting, PostgreSQL uses double quotes, SQL Server uses square brackets. AUTO_INCREMENT is MySQL syntax; PostgreSQL uses SERIAL; SQL Server uses IDENTITY. The converter handles all of this per-dialect.

**Escaping** — Any single quotes in your data need to be escaped to \`''\` in SQL. Values that contain SQL keywords need proper quoting. The converter handles all of this so your INSERT statements do not break.

## Choosing the Right Insert Mode

**Single INSERT** — One INSERT statement per row. Safest, most compatible with every database and tool. Slower for large datasets.

**Batch INSERT** — Multiple rows per INSERT statement: \`INSERT INTO t (col1, col2) VALUES (a, b), (c, d), (e, f);\`. Much faster for large datasets. Configurable batch size.

**Upsert** — Insert if the row does not exist, update if it does. Implemented differently per database: \`ON DUPLICATE KEY UPDATE\` for MySQL, \`ON CONFLICT DO UPDATE\` for PostgreSQL, \`INSERT OR REPLACE\` for SQLite.

## Common Issues to Watch For

**Empty values** — An empty field in CSV might mean NULL, or it might mean an empty string. Know which your use case requires. Good converters let you choose.

**Encoding** — CSV files from Excel on Windows are often saved in Windows-1252 encoding rather than UTF-8. Special characters like ™, ©, or accented letters may need re-encoding before conversion to avoid garbled data.

**Date formats** — Dates in CSV might be MM/DD/YYYY (US format), DD/MM/YYYY (European), or YYYY-MM-DD (ISO). The converter needs to know which format your data uses to output the right SQL date literals.

Our CSV to SQL tool handles all of this — paste or upload your CSV, choose your target database from MySQL, PostgreSQL, SQLite, SQL Server, MariaDB, or Oracle, configure the options, and get working SQL instantly.
    `,
  },

  {
    slug: 'html-vs-markdown-when-to-use-each',
    title: 'HTML vs Markdown: When to Use Each and How to Convert Between Them',
    description: 'Markdown and HTML serve similar purposes but suit different situations. Learn the key differences, when each one wins, and how to convert HTML to Markdown instantly.',
    category: 'Writing',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    date: '2025-04-05',
    readTime: '6 min read',
    tool: { name: 'HTML to Markdown', href: '/tools/html-to-markdown', icon: '🔄' },
    keywords: ['html to markdown', 'markdown vs html', 'convert html markdown', 'when to use markdown', 'html markdown differences'],
    content: `
## Two Ways to Write Structured Content

HTML and Markdown both let you create structured text — headings, lists, bold text, links, images. But they approach it very differently.

HTML is markup language: you wrap content in opening and closing tags. \`<strong>Bold text</strong>\`. Explicit, verbose, and requires precision. Forget to close a tag and things break in unpredictable ways.

Markdown is shorthand: \`**Bold text**\`. Human-readable even in its raw form. You can read a Markdown file in any text editor and understand what it means without knowing any syntax. A heading is just pound signs before the text. A list is just lines starting with a dash.

## When Markdown Wins

**Writing documentation** — README files, technical docs, wikis. GitHub renders Markdown natively. So does GitLab, Confluence, Notion, Obsidian, and essentially every documentation platform. It is the standard.

**Blog posts** — Most modern blogging platforms and static site generators (Gatsby, Hugo, Jekyll, Astro) take Markdown as input and convert it to HTML automatically. You write in Markdown and the platform handles the HTML.

**Note-taking** — Markdown is fast enough to use while taking notes in real-time. \`#\` for headings, \`-\` for bullet points. When you come back to review later, it is already structured.

**Anywhere with version control** — Markdown in a Git repository diffs cleanly. HTML diffs are full of tag noise that makes it hard to see the actual content changes.

## When HTML Wins

**Complex layouts** — Markdown does not handle multi-column layouts, custom spacing, or complex table structures. For anything beyond basic formatting, you need HTML.

**Email templates** — Email clients have notoriously inconsistent HTML support and do not understand Markdown at all. Email is still an HTML-only zone.

**Fine-grained control** — Want a specific class name on a heading, a custom data attribute, or inline styles? HTML gives you complete control. Markdown abstracts that away.

**Landing pages and web apps** — Full-featured web pages that need interactive elements, forms, and custom styling need HTML and CSS. Markdown is not a replacement for building websites.

## Why You Might Need to Convert

The most common conversion scenario: you have content from a CMS, website scraper, or email newsletter in HTML format, and you want to edit or repurpose it somewhere that uses Markdown — a GitHub wiki, a documentation site, a note-taking app.

Doing this by hand means stripping out \`<p>\` tags, replacing \`<strong>\` with \`**\`, converting \`<a href="...">\` to \`[text](url)\`, and so on for dozens of HTML elements. For any substantial amount of content, this is tedious and error-prone.

Our HTML to Markdown converter handles the entire translation automatically, with support for tables, code blocks, nested lists, blockquotes, and GitHub Flavored Markdown. Paste the HTML, get Markdown, done.
    `,
  },

  {
    slug: 'why-code-formatting-matters',
    title: 'Why Code Formatting Matters More Than You Think',
    description: 'Sloppy code formatting slows down every developer on your team. Here is why consistent formatting matters, what tools handle it automatically, and how to format any code in seconds.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-04-12',
    readTime: '6 min read',
    tool: { name: 'Code Formatter', href: '/tools/code-formatter', icon: '✨' },
    keywords: ['code formatter', 'code formatting', 'why format code', 'javascript formatter', 'code beautifier online'],
    content: `
## The Hidden Cost of Messy Code

When code is inconsistently formatted, every developer reading it carries an extra cognitive load. Eyes have to parse irregular indentation. Brains have to decide if an unusual spacing pattern is meaningful or just inconsistency. Time that should go toward understanding the logic goes toward decoding the formatting.

Studies on code review productivity consistently show that formatting inconsistencies cause more comments — and more time spent — than actual logic errors. Developers debate tabs versus spaces, brace placement, and line length when they should be reviewing whether the algorithm is correct.

There is also a practical maintenance cost. When formatting is inconsistent, version control diffs get polluted with whitespace changes. A refactor that changes ten lines of logic might show up as 200 changed lines in the diff because everything got reformatted differently. Tracking down when a specific logic change happened becomes much harder.

## What Consistent Formatting Actually Achieves

**Readability at a glance** — Well-indented code shows structure visually. Nesting depth is immediately obvious. The body of a function is visually distinct from what surrounds it.

**Faster onboarding** — New developers on a project can focus on understanding the codebase rather than the formatting conventions. When formatting is automatic and consistent, there is nothing to learn — it just looks the same everywhere.

**Cleaner diffs** — When formatting is automated, everyone's formatter produces identical output. Diffs show only logical changes, not formatting changes. Code review gets faster and more focused.

**Less bikeshedding** — The tabs-vs-spaces debate is one of the oldest and most pointless discussions in software. Configure a formatter once, make it mandatory, and the debate is over forever. Machines make better consistency enforcers than humans.

## What Good Formatters Handle

A proper code formatter is not just about indentation. It handles spacing around operators, line breaks between logical sections, consistent quote style, trailing whitespace removal, bracket placement, import ordering, and more.

Modern formatters like Prettier for JavaScript and CSS, Black for Python, and gofmt for Go are opinionated — they make specific choices and do not offer much configuration. This is intentional. The fewer choices a formatter offers, the less there is to debate and the more consistent the output across teams.

## Formatting Without Installing Anything

Our Code Formatter supports JavaScript, TypeScript, HTML, CSS, SCSS, JSON, and XML. Paste your code, pick the language, and it formats immediately. No npm install, no config file, no editor plugin needed.

Useful for quick fixes, one-off formatting jobs, or formatting code from a context where you do not have your usual tools — a remote server, a colleagues machine, or just quickly cleaning up a snippet before pasting it somewhere.

The minify mode is the opposite — it strips all whitespace and comments to produce the smallest possible output, useful for production JavaScript and CSS before deployment.
    `,
  },

  {
    slug: 'how-to-compare-files-with-diff',
    title: 'How to Compare Two Files and Find Differences — Diff Tools Explained',
    description: 'Spotting changes between two versions of a document or codebase is a daily developer task. Here is how diff tools work, what the output means, and how to compare any text instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-04-19',
    readTime: '7 min read',
    tool: { name: 'Diff Checker', href: '/tools/diff-checker', icon: '↔️' },
    keywords: ['diff checker', 'compare text online', 'text diff tool', 'file diff', 'compare two files', 'code diff viewer'],
    content: `
## What a Diff Tool Does

A diff tool compares two versions of text — file A and file B — and outputs a list of differences between them. Which lines were added (in B but not A), which were removed (in A but not B), and which are the same in both.

The name comes from the Unix \`diff\` command, which has been a standard part of Unix systems since 1974. Every modern development workflow relies on diff in some form — Git's \`git diff\` command, code review tools on GitHub and GitLab, merge conflict resolution in every IDE, and online tools for quick comparisons.

## Understanding Diff Output

The two main display formats are unified diff and split diff.

**Unified diff** shows both versions in a single column, with removed lines marked with a minus sign and a red background, and added lines with a plus sign and a green background. This is the format Git uses in the terminal. It is compact and good for following the flow of changes.

**Split diff** shows the two versions side by side — the original on the left, the modified on the right. Changed sections are aligned with each other. This format makes it easier to see exactly what was before and what replaced it, especially for complex changes.

Beyond line-level diff, modern diff tools also do word-level (or character-level) inline diff. When a line is modified rather than entirely replaced, the specific words that changed are highlighted within the line. So instead of just seeing the whole old line and whole new line, you see exactly which words were added or removed.

## The Algorithm Behind It

Most diff tools use the Myers diff algorithm (published by Eugene Myers in 1986), which finds the minimum number of insert and delete operations needed to transform one sequence into another. This is called the shortest edit script or the longest common subsequence (LCS) problem.

The algorithm works on sequences of lines. It finds the longest sequence of lines that appear in both files (in the same order) — those are the unchanged lines. Everything else is either an insertion or a deletion.

This is why diff output sometimes looks surprising. The algorithm optimizes for fewest total changes, which occasionally groups them differently than a human would. Large refactors where lines move around rather than change in place can look messier than they are.

## Practical Uses for Diff Checking

**Code review** — Comparing a feature branch to the main branch to understand what changed before merging.

**Document revision** — Comparing two versions of a contract, report, or legal document to see exactly what was modified between drafts.

**Configuration auditing** — Comparing server configuration files to spot unauthorized changes or drift from the expected baseline.

**Debugging regressions** — Finding what changed between a working version and a broken version of code when a bug was introduced.

**Content changes** — Comparing two versions of a webpage, article, or API response to see what changed over time.

## Using the Diff Checker Tool

Paste your original text in the left panel and your modified text in the right. Click Compare. The tool uses the LCS algorithm to produce a line-level diff with inline word-level highlighting for changed lines.

Switch between Split view, Unified view, and Summary view. Toggle Ignore Whitespace to skip formatting-only differences. Toggle Ignore Case for case-insensitive comparison. Adjust context lines to show more or fewer unchanged lines around changes. Export the full diff as a standard .txt file.
    `,
  },

  {
    slug: 'when-to-use-base64-images',
    title: 'When Should You Use Base64-Encoded Images? (And When You Absolutely Should Not)',
    description: 'Embedding images as Base64 in HTML or CSS eliminates HTTP requests but comes with tradeoffs. Here is when it helps performance and when it hurts it.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-04-26',
    readTime: '6 min read',
    tool: { name: 'Image to Base64', href: '/tools/image-to-base64', icon: '🖼️' },
    keywords: ['image to base64', 'base64 image', 'inline images', 'png to base64', 'base64 image encoder', 'data url image'],
    content: `
## What Base64 Images Actually Are

When you convert an image to Base64, you transform the raw binary data of the image file into a text string. That string can then be embedded directly in HTML, CSS, or JSON rather than being hosted as a separate file.

Instead of \`<img src="/images/logo.png">\`, you write \`<img src="data:image/png;base64,iVBORw0KGgoAAAANS...">\` — where the source is the entire image encoded as text.

The browser decodes the Base64 string and renders the image exactly as it would a file served from a URL. From the user's perspective, there is no visible difference.

## When Base64 Images Help

**Small icons and UI elements** — Tiny images like 16×16 or 32×32 icons cost more in HTTP request overhead than they do in file size. Base64-encoding a 500-byte icon and inlining it in CSS eliminates the request entirely. The saving is real.

**Above-the-fold critical images** — Images needed immediately for the initial render can be inlined in the HTML to avoid a render-blocking network request. The browser has everything it needs to render the initial view without making additional requests.

**Email templates** — Many email clients block external images by default. Embedding images as Base64 ensures they display even when external image loading is disabled.

**Single-file apps and exports** — When you need a self-contained HTML file — a report, an exported document, a portable demo — Base64 images mean nothing breaks when the file is moved or opened without internet access.

**API payloads** — When an API needs to return an image in a JSON response, Base64 is the standard approach. There is no other practical way to include binary data in a JSON field.

## When Base64 Images Hurt

**Large images** — Base64 encoding increases file size by about 33%. A 100KB image becomes ~133KB as Base64. For large images, this overhead outweighs the request savings. The increased HTML or CSS file size also pushes everything else down — other resources have to wait for a larger initial document.

**Cached images** — When an image is served as a separate file with proper cache headers, browsers cache it. Next visit, the image loads instantly from cache. When the same image is embedded as Base64 in HTML, it gets downloaded again on every page load because it is part of the document, not a separate cached resource.

**Multiple pages using the same image** — If your logo appears on every page and it is embedded as Base64 in each page's HTML, it gets downloaded on every page load. As a separate file, it is downloaded once and cached everywhere.

**Large documents in general** — Every byte added to your HTML or CSS increases parse time. Embedding several large images bloats the document significantly and slows initial parsing.

## The Practical Rule of Thumb

Use Base64 for images under 2–3KB that appear on only one page and are not reused elsewhere. Everything else is usually better served as a separate file with proper caching.

Our Image to Base64 tool converts any image format (PNG, JPG, GIF, WebP, SVG, BMP) to Base64 instantly. Choose from six output formats: Data URL, raw Base64, HTML img tag, CSS background-image, Markdown, or JSON field. It also decodes Base64 strings back to downloadable images.
    `,
  },

  {
    slug: 'how-to-test-rest-apis-for-beginners',
    title: 'How to Test REST APIs Without Writing Any Code',
    description: 'API testing does not require Postman or any installation. Learn what REST APIs are, how to read API documentation, and how to send real requests from your browser for free.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-05-03',
    readTime: '8 min read',
    tool: { name: 'API Request Tester', href: '/tools/api-request-tester', icon: '📡' },
    keywords: ['api testing', 'test rest api', 'api tester online', 'postman alternative', 'rest api beginner', 'how to test api'],
    content: `
## What Is a REST API

An API (Application Programming Interface) is a way for programs to talk to each other. A REST API specifically uses HTTP — the same protocol web browsers use — which means you can test REST APIs with the same tools you use to browse the web.

When you visit a website, your browser sends a GET request to a server and gets back HTML. REST APIs work the same way, except instead of HTML, you get back data — usually in JSON format.

Every time you open a weather app, it is sending an API request to a weather service. Every time you log in with Google, an API call verifies your identity. APIs power virtually every modern software product.

## The HTTP Methods

REST APIs use different HTTP methods to signal what kind of operation you want to perform.

**GET** — Retrieve data. No side effects. The most common method. "Give me the list of users." "Give me the details for product #42."

**POST** — Create something new. Send data in the request body. "Create a new user with these details." "Submit this order."

**PUT** — Replace an entire resource. Send the full updated version. "Replace user #5 with this new data."

**PATCH** — Update part of a resource. Send only the fields you want to change. "Update just the email address for user #5."

**DELETE** — Remove something. "Delete user #5."

## Reading the Response

Every API response includes a status code that tells you whether it worked.

**200-299** mean success. 200 OK is the standard success. 201 Created means something new was created. 204 No Content means success with no response body.

**400-499** mean you made a mistake. 400 Bad Request usually means the data you sent was invalid. 401 Unauthorized means you need to authenticate. 403 Forbidden means you are authenticated but do not have permission. 404 Not Found means the resource does not exist.

**500-599** mean the server made a mistake. 500 Internal Server Error means something crashed on the server's end. These are not your fault.

The response body — usually JSON — contains the actual data or error details. Learning to read both the status code and the JSON response together tells you exactly what happened and why.

## Authentication Methods

Most real APIs require authentication — proof that you have permission to access them.

**Bearer tokens** — The most common. You put the token in the Authorization header: \`Authorization: Bearer your-token-here\`. You get the token by logging in or creating an API key in the service's dashboard.

**Basic Auth** — Sends your username and password encoded as Base64 in the Authorization header. Older but still widely used for internal APIs and simple services.

**API keys** — A unique key string sent in a header or as a query parameter. Common with services like OpenWeatherMap, Google Maps, or Stripe.

## Why You Do Not Need Postman

Postman is a great tool but it requires installation, an account, and learning a fairly complex interface. For quick API testing and learning, a browser-based tool is faster to get started with.

Our API Request Tester handles all HTTP methods, custom headers, query parameters, request body (JSON, form data, raw text), Bearer/Basic/API Key authentication, and shows the response with a JSON tree view. You can save requests to a collection, track history, and export any request as a cURL command.

Try it with public APIs that require no authentication — JSONPlaceholder, Open-Meteo weather, or the Cat Facts API are all preloaded as one-click examples to get started immediately.
    `,
  },

  {
    slug: 'url-encoding-explained',
    title: 'URL Encoding Explained — Why %20 Means Space and How It Works',
    description: 'URLs can only contain certain characters. Everything else gets percent-encoded. Here is why this exists, what the rules are, and how to encode and decode URLs instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-01-28',
    readTime: '5 min read',
    tool: { name: 'URL Encoder / Decoder', href: '/tools/url-encoder-decoder', icon: '🔗' },
    keywords: ['url encoding', 'url encoder decoder', 'percent encoding', 'url encode online', 'what is url encoding'],
    content: `
## Why URLs Cannot Contain Every Character

A URL is text, but it is special text. The URL specification (RFC 3986) defines a strict set of characters that are allowed — letters, digits, and a handful of special characters like \`-\`, \`_\`, \`.\`, and \`~\`. Characters outside this set must be encoded before they appear in a URL.

The reason is ambiguity. Some characters have special meaning in URL syntax. The \`?\` separates the path from the query string. The \`&\` separates query parameters from each other. The \`=\` separates parameter names from values. The \`#\` starts a fragment identifier.

If your query parameter value contains a \`&\`, the URL parser would interpret it as the end of that parameter and the start of the next one. To include these characters literally, they must be encoded in a way that tells the parser "this is data, not structure."

## How Percent Encoding Works

Percent encoding replaces each unsafe character with a \`%\` sign followed by the two-digit hexadecimal ASCII code for that character.

Space is ASCII 32. In hexadecimal, 32 is 20. So a space becomes \`%20\`. That is all. You can verify any character: look up its ASCII code, convert to hex, add a \`%\` in front.

A few common encodings worth knowing:
- Space → \`%20\` (or \`+\` in form encoding)
- \`@\` → \`%40\`
- \`:\` → \`%3A\`
- \`/\` → \`%2F\`
- \`?\` → \`%3F\`
- \`=\` → \`%3D\`
- \`&\` → \`%26\`

Non-ASCII characters (accented letters, Chinese characters, emoji) are first converted to their UTF-8 byte sequences, and then each byte is percent-encoded. An emoji might become several \`%xx\` sequences in a URL.

## The Two Types of URL Encoding

**URL encoding** (also called percent encoding) — encodes everything that is not in the allowed set of unreserved characters. Used for encoding entire URLs or URI components.

**Form encoding** — Used specifically for HTML form data submitted via GET or POST. Nearly identical to percent encoding but uses \`+\` instead of \`%20\` for spaces. This is what browsers use when you submit a form.

You see both in the wild. An API endpoint might use \`%20\` for spaces in its URL structure, while form submissions use \`+\`. Knowing the difference prevents subtle bugs when building or debugging APIs.

## Practical Uses for URL Encoding

**Building API requests** — Any query parameter that might contain special characters needs to be URL-encoded before being appended to a URL. Most HTTP libraries do this automatically, but knowing what is happening helps when debugging raw requests.

**Reading server logs** — Log files show encoded URLs. Decoding them makes the actual paths and parameters readable.

**Debugging redirects** — Redirect chains often involve URL-encoded destination URLs nested inside other URL parameters. Decoding these step by step reveals the actual redirect target.

Our URL Encoder/Decoder tool handles both encoding and decoding instantly. Paste a URL or text string and get the encoded or decoded result immediately, no installation required.
    `,
  },

  {
    slug: 'how-to-write-clean-sql-queries',
    title: 'How to Write Clean, Readable SQL Queries That Your Team Will Thank You For',
    description: 'SQL formatting makes a bigger difference than most developers realize. Learn the conventions for writing clean SQL, why readability matters, and how to format queries automatically.',
    category: 'Data',
    categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
    date: '2025-02-05',
    readTime: '7 min read',
    tool: { name: 'SQL Formatter', href: '/tools/sql-formatter', icon: '🗄️' },
    keywords: ['sql formatter', 'clean sql queries', 'sql formatting', 'sql best practices', 'format sql query online'],
    content: `
## Why SQL Formatting Actually Matters

A SQL query that returns the correct result is not enough. A query someone else cannot understand — or that you yourself cannot understand three months later — is a liability.

SQL queries live in codebases for years. A query written today to pull a report will likely still be running in five years, possibly modified by four different people who did not write the original. If the formatting is inconsistent, understanding what it does requires reconstructing intent from a wall of text.

Badly formatted SQL also makes bugs easier to miss. A subquery buried in the middle of an unindented SELECT clause is easy to misread. A missing parenthesis around a set of OR conditions changes the logic dramatically — and is much harder to spot in messy SQL than in well-formatted SQL.

## The Core SQL Formatting Conventions

**Uppercase keywords** — Write SQL keywords in UPPERCASE: SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, HAVING. Keep column names and table names in their original case. This visual distinction makes the structure of the query immediately obvious.

**One clause per line** — Each major clause starts on a new line. SELECT, FROM, WHERE, GROUP BY, ORDER BY each get their own line. This makes it trivial to add, remove, or comment out individual clauses.

**Indent column lists and conditions** — List selected columns one per line, indented under SELECT. List WHERE conditions one per line, indented under WHERE. Align AND and OR at the start of each condition line (not at the end of the previous line).

**Explicit JOIN syntax** — Use explicit JOIN ... ON ... rather than comma-separated tables in the FROM clause with conditions in WHERE. It is clearer, easier to read, and avoids accidental cross joins.

**Meaningful aliases** — Table aliases should be meaningful abbreviations, not single letters. \`u\` for users is fine when there is only one table, but in a complex query with eight JOINs, \`user_orders uo\` is far clearer than just \`o\`.

## Example: Unformatted vs Formatted

Unformatted:
\`\`\`sql
select u.name,count(o.id) as order_count,sum(o.total) as revenue from users u inner join orders o on u.id=o.user_id where o.created_at > '2024-01-01' and o.status='completed' group by u.id,u.name having count(o.id)>5 order by revenue desc limit 10
\`\`\`

Formatted:
\`\`\`sql
SELECT
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS revenue
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE
  o.created_at > '2024-01-01'
  AND o.status = 'completed'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY revenue DESC
LIMIT 10
\`\`\`

Same query. The formatted version takes a second to understand. The unformatted version takes a minute, and that is for a relatively simple query.

## Using a SQL Formatter

Our SQL Formatter tool takes any SQL query and formats it according to standard conventions. It handles SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, and complex nested subqueries. Paste messy SQL and get clean, readable output instantly.

Useful for cleaning up queries copied from logs, reformatting auto-generated SQL from ORMs, or just standardizing formatting across a team's shared query library.
    `,
  },

  {
    slug: 'how-url-shorteners-work',
    title: 'How URL Shorteners Work — The Technology Behind the Short Link',
    description: 'Short URLs are everywhere but most people do not know what actually happens when you click one. Here is the full technical explanation and how to create short links for free.',
    category: 'Utility',
    categoryColor: 'bg-slate-50 text-slate-700 border-slate-200',
    date: '2025-02-15',
    readTime: '6 min read',
    tool: { name: 'URL Shortener', href: '/tools/url-shortener', icon: '✂️' },
    keywords: ['url shortener', 'how url shorteners work', 'shorten url free', 'short link', 'link shortener'],
    content: `
## What Actually Happens When You Click a Short Link

You click \`https://toolbeans.com/s/ab3x\` and end up at a completely different, much longer URL. The process behind this takes milliseconds and involves a few specific steps.

Your browser sends a GET request to the URL shortener's server. The server looks up the short code (\`ab3x\` in this case) in its database. If found, the server responds with an HTTP 301 (permanent redirect) or 302 (temporary redirect) that includes the destination URL in the Location header. Your browser automatically follows the redirect and loads the destination page.

The whole process happens so fast that users rarely notice the intermediate step. From their perspective, they clicked a link and the page loaded.

## 301 vs 302 Redirects — Why It Matters

This distinction is important and often gets glossed over.

A **301 Permanent Redirect** tells browsers and search engines that the original URL has permanently moved to the destination. After the first visit, most browsers cache this redirect — meaning subsequent clicks skip the shortener server entirely and go straight to the destination. This is faster for users but means the shortener loses the ability to track clicks or change the destination URL.

A **302 Temporary Redirect** tells browsers this is a temporary forward. Browsers do not cache it (or cache it briefly). Every click goes through the shortener server. This allows click tracking, analytics, and the ability to update the destination URL after the short link is already published. Most URL shorteners use 302 for this reason.

## How the Short Codes Are Generated

The short code — that 4–7 character string after the domain — is generated in one of two ways.

**Random generation** — A random string of characters from a defined alphabet (usually letters and digits, case-sensitive or not) is generated and checked against existing codes for uniqueness. This is simple and scales well.

**Sequential ID encoding** — The database auto-increments an integer ID for each new URL. That integer is then encoded in a short base (base 62 using letters and digits is common). The number 1,000,000 in base 62 is just "4c92" — four characters. This approach is predictable, guaranteed unique, and efficient.

## URL Shorteners and Privacy

When you click a short link, the shortener knows your IP address, browser, operating system, referring page, and the time of the click — even before you arrive at the destination. Commercial URL shorteners use this data for analytics.

This is worth knowing both when using short links and when sharing them. The link creator often sees aggregated click data. Some shorteners sell or share this data.

## Creating Short URLs

Our URL Shortener tool creates short links instantly. Paste any long URL and get a short, copyable link. No account, no tracking by us — just a shorter link that is easier to share, especially in contexts where long URLs get truncated or look unwieldy.
    `,
  },

  {
    slug: 'what-is-hashing-md5-sha256-explained',
    title: 'What Is Hashing? MD5, SHA-256, and Why They Matter for Security',
    description: 'Hashing is fundamental to passwords, file integrity, and digital signatures. Learn how hash functions work, the difference between MD5 and SHA-256, and when to use each.',
    category: 'Security',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    date: '2025-02-22',
    readTime: '7 min read',
    tool: { name: 'Hash Generator', href: '/tools/hash-generator', icon: '#️⃣' },
    keywords: ['hash generator', 'md5 hash', 'sha256', 'what is hashing', 'md5 sha256 difference', 'hash function explained'],
    content: `
## What a Hash Function Does

A hash function takes any input — a word, a file, an entire database — and produces a fixed-length output called a hash, digest, or checksum. SHA-256 always produces a 256-bit (64 hexadecimal character) output, no matter if the input is one character or one gigabyte.

Three properties make hash functions useful for security.

**Deterministic** — The same input always produces the same output. Hash "hello" with SHA-256 and you always get \`2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\`. Every time.

**One-way** — Given a hash output, it is computationally infeasible to find the original input. You cannot run SHA-256 "backwards." The only practical way to find the input for a given hash is to try possible inputs and hash them until you find a match.

**Avalanche effect** — A tiny change in the input creates a completely different output. Change one letter in a sentence, and the hash changes entirely — not slightly. This means you cannot partially reverse-engineer the input from the hash.

## MD5 vs SHA-256 — The Important Difference

Both are hash functions, but they are not equally secure.

**MD5** produces a 128-bit (32-character) hash. It was widely used for password hashing and file integrity in the 1990s. The problem: MD5 is cryptographically broken. Researchers have found collision attacks — ways to produce two different inputs with the same MD5 hash. This makes it unsuitable for security applications. Do not use MD5 for passwords or security-critical purposes.

**SHA-256** is part of the SHA-2 family of hash functions. It produces a 256-bit hash and is considered cryptographically strong as of 2025. It is used in Bitcoin, SSL certificates, code signing, and virtually every modern security application.

MD5 is still used for non-security purposes — quick file checksums where the goal is detecting accidental corruption, not resisting deliberate attack. For anything security-related, use SHA-256 or better.

## How Password Hashing Works

Websites do not store your password — they store a hash of it. When you log in, the website hashes the password you entered and compares it to the stored hash. If they match, you are authenticated.

This way, even if the database is stolen, attackers do not get plaintext passwords — they get hashes. To crack them, they have to guess passwords and hash each guess until they find a match. This is why long, random passwords are hard to crack — there are too many possibilities to guess efficiently.

Good systems add a unique random value (a salt) to each password before hashing, preventing attackers from cracking multiple hashes simultaneously using precomputed lookup tables (rainbow tables).

## File Integrity Verification

Hashing is how you verify that a file has not been tampered with. When you download software, the download page often lists the SHA-256 hash of the expected file. After downloading, you hash the file yourself and compare. If the hashes match, the file arrived intact and unmodified.

Our Hash Generator produces MD5, SHA-1, SHA-256, and SHA-512 hashes for any text or file. Useful for verifying downloads, generating checksums, or understanding how different algorithms compare on the same input.
    `,
  },

  {
    slug: 'regex-basics-beginners-guide',
    title: 'Regex for Beginners — How Regular Expressions Work (With Real Examples)',
    description: 'Regular expressions look intimidating but follow logical rules. Learn the core syntax, common patterns for email and phone validation, and how to test regex patterns instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-03-05',
    readTime: '9 min read',
    tool: { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
    keywords: ['regex tester', 'regular expressions', 'regex tutorial', 'regex for beginners', 'regex email validation', 'learn regex'],
    content: `
## Why Regular Expressions Seem Hard (And Why They Are Not)

Regular expressions — regex — look like line noise. \`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$\` is not exactly welcoming. But once you understand that each piece has a specific meaning that follows consistent rules, regex becomes a powerful readable tool rather than an intimidating string of symbols.

Regex is supported in virtually every programming language and many text editors. Learning the basics pays dividends across your entire career because the same patterns work everywhere.

## The Core Building Blocks

**Literal characters** — Most characters match themselves. The pattern \`cat\` matches the string "cat" exactly. Simple.

**The dot** — \`.\` matches any single character except a newline. The pattern \`c.t\` matches "cat", "cot", "cut", "c3t", anything with any character between 'c' and 't'.

**Character classes** — Square brackets define a set of characters to match. \`[aeiou]\` matches any vowel. \`[a-z]\` matches any lowercase letter. \`[0-9]\` matches any digit. \`[^aeiou]\` matches any character that is not a vowel (the caret inside brackets means NOT).

**Quantifiers** — Control how many times something matches.
- \`*\` — zero or more
- \`+\` — one or more
- \`?\` — zero or one (optional)
- \`{3}\` — exactly three times
- \`{2,5}\` — between two and five times

**Anchors** — \`^\` matches the start of a string. \`$\` matches the end. Without anchors, a pattern can match anywhere in a string. With them, you can ensure the entire string matches your pattern.

## Common Patterns You Will Actually Use

**Email validation** (simplified):
\`\`\`
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
\`\`\`
Reads as: Start of string, one or more email-valid characters, an @ sign, one or more domain characters, a dot, two or more letters for the TLD, end of string.

**Phone number (US)**:
\`\`\`
^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$
\`\`\`
Handles 555-1234, (555) 123-4567, +1 555.123.4567, and other common US formats.

**URL detection**:
\`\`\`
https?://[^\s]+
\`\`\`
The \`s?\` makes the 's' in 'https' optional (matches both http and https). Then matches any non-whitespace characters after the domain.

**Only digits**:
\`\`\`
^\d+$
\`\`\`
\`\d\` is shorthand for \`[0-9]\`. Combined with anchors, this matches strings containing only digits.

## The Flags That Change Behavior

Regex flags modify how the pattern is interpreted.

**i** (case-insensitive) — \`/cat/i\` matches "cat", "Cat", "CAT", "cAt".

**g** (global) — Find all matches, not just the first one.

**m** (multiline) — Makes \`^\` and \`$\` match the start and end of each line rather than the whole string.

## Testing Regex Without Frustration

The best way to learn regex is to write a pattern and immediately see what it matches and what it misses. Our Regex Tester lets you write the pattern, paste test text, and highlights all matches in real time.

When a pattern does not match what you expect, you can change it character by character and see the effect immediately — much faster than running code in a terminal and much more visual than reading documentation.
    `,
  },

  {
    slug: 'text-case-formats-explained',
    title: 'camelCase, snake_case, PascalCase: Every Naming Convention Explained',
    description: 'Naming conventions exist to make code readable and consistent. Here is what each case format means, where each is used, and how to convert between them instantly.',
    category: 'Developer',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '2025-03-12',
    readTime: '5 min read',
    tool: { name: 'Text Case Converter', href: '/tools/text-case-converter', icon: 'Aa' },
    keywords: ['text case converter', 'camelcase', 'snake_case', 'pascalcase', 'naming conventions', 'convert text case'],
    content: `
## Why Naming Conventions Exist

Every programming team eventually faces the same question: should the variable be named \`userEmail\`, \`user_email\`, \`UserEmail\`, or \`USER_EMAIL\`? The answer depends on the language, the context, and the team's conventions.

Naming conventions are not about aesthetics — they are about communication. When everyone on a team follows the same conventions, the name of something tells you what type of thing it is. Constants look different from variables. Class names look different from function names. You can glance at a piece of code and immediately orient yourself.

Inconsistent naming in a codebase is like a book that switches between English and French mid-sentence. Technically readable, but slower and more effortful than it should be.

## Every Major Naming Convention Explained

**camelCase** — First word lowercase, each subsequent word starts with a capital. \`getUserById\`, \`totalOrderCount\`, \`isLoggedIn\`. Used for variable names and function names in JavaScript, Java, C#, and many other languages.

**PascalCase** (also called UpperCamelCase) — Every word starts with a capital, including the first. \`UserProfile\`, \`ShoppingCart\`, \`GetUserById\`. Used for class names in most object-oriented languages, and for component names in React.

**snake_case** — All lowercase, words separated by underscores. \`user_email\`, \`total_order_count\`, \`get_user_by_id\`. The standard in Python for function names and variables. Also used in database column names, Ruby, and Rust.

**SCREAMING_SNAKE_CASE** — All uppercase with underscores. \`MAX_RETRIES\`, \`DATABASE_URL\`, \`API_KEY\`. Used universally for constants and environment variables.

**kebab-case** — All lowercase, words separated by hyphens. \`user-profile\`, \`main-container\`, \`primary-button\`. Not valid in most programming languages (the hyphen would be interpreted as subtraction), but standard for CSS class names, HTML attributes, URL slugs, and file names.

**Title Case** — Each word starts with a capital. Used in headings, titles, and displayed text: "User Profile Settings."

**UPPERCASE / lowercase** — Self-explanatory. Used for SQL keywords (uppercase), file extensions, and abbreviations.

## Language Conventions Quick Reference

- **JavaScript** — camelCase for variables/functions, PascalCase for classes/components
- **Python** — snake_case for functions/variables, PascalCase for classes, SCREAMING_SNAKE_CASE for constants
- **Java / C#** — camelCase for variables/methods, PascalCase for classes and interfaces
- **CSS** — kebab-case for class names and custom properties
- **SQL** — UPPERCASE for keywords, snake_case for column and table names
- **URLs** — kebab-case for paths and slugs
- **Environment variables** — SCREAMING_SNAKE_CASE

## Converting Between Formats

Our Text Case Converter transforms any text between all major formats instantly. Paste a sentence or a variable name, and convert to camelCase, PascalCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, or any standard text case format.

Useful when renaming variables during refactoring, converting database column names to JavaScript property names, or preparing text for different contexts — CSS class, URL slug, or display heading.
    `,
  },
];

export const blogCategories = [
  { key: 'All',       color: 'bg-slate-100 text-slate-700 border-slate-200'    },
  { key: 'Developer', color: 'bg-blue-50 text-blue-700 border-blue-200'        },
  { key: 'Security',  color: 'bg-rose-50 text-rose-700 border-rose-200'        },
  { key: 'Design',    color: 'bg-purple-50 text-purple-700 border-purple-200'  },
  { key: 'Writing',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  { key: 'Data',      color: 'bg-teal-50 text-teal-700 border-teal-200'        },
  { key: 'Utility',   color: 'bg-slate-50 text-slate-600 border-slate-200'     },
];