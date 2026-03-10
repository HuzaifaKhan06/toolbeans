import Link from 'next/link';

export const metadata = {
  title: 'About — TOOLBeans',
  description: 'Learn about TOOLBeans — who we are, why we built this platform, and our mission.',
};

const stats = [
  { value: '7+', label: 'Free Tools', icon: '🛠️' },
  { value: '0', label: 'Accounts Needed', icon: '🔓' },
  { value: '100%', label: 'Client-Side', icon: '🖥️' },
  { value: '∞', label: 'Always Free', icon: '♾️' },
];

const values = [
  {
    icon: '⚡',
    title: 'Speed First',
    desc: 'Every tool is optimized to run instantly in the browser. No loading screens, no server round-trips.',
  },
  {
    icon: '🔒',
    title: 'Privacy by Default',
    desc: 'We never collect, store, or transmit the data you enter into our tools. What you type stays on your device.',
  },
  {
    icon: '🆓',
    title: 'Free Forever',
    desc: 'TOOLBeans tools are and always will be free. We sustain the platform through non-intrusive advertising.',
  },
  {
    icon: '🎯',
    title: 'Simplicity',
    desc: 'No bloated features, no confusing UI. Each tool does one thing and does it really well.',
  },
  {
    icon: '🌍',
    title: 'Accessible to All',
    desc: 'No sign-up, no paywall, no region restrictions. Anyone with a browser can use TOOLBeans.',
  },
  {
    icon: '🔄',
    title: 'Constantly Improving',
    desc: 'We listen to user feedback and continuously add new tools and improve existing ones.',
  },
];

const stack = [
  { name: 'Next.js 16', desc: 'Fast, SEO-friendly React framework', color: 'bg-slate-50 border-slate-200' },
  { name: 'React', desc: 'Component-based UI library', color: 'bg-blue-50 border-blue-200' },
  { name: 'Tailwind CSS', desc: 'Utility-first modern styling', color: 'bg-cyan-50 border-cyan-200' },
  { name: 'Vercel', desc: 'Zero-config deployment platform', color: 'bg-indigo-50 border-indigo-200' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
            Built by Developers,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              for Developers
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            TOOLBeans is a free online utility platform designed to help developers, data professionals,
            and everyday users get things done — faster and simpler than ever before.
          </p>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">

          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Who We Are
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-5">
            Our Story
          </h2>
          <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-light">
            <p>
              We&apos;re a small team of developers and data professionals who got tired of bloated,
              ad-heavy, account-requiring tools that should be simple. Every day We&apos;d reach for
              quick utilities — format a JSON response, generate a secure password, encode a URL —
              and waste time hunting through sketchy websites.
            </p>
            <p>
              <strong className="text-slate-700 font-semibold">TOOLBeans was born out of that frustration.</strong> We wanted
              a single platform for the developer utilities we reach for every single day. Clean,
              fast, private, and completely free.
            </p>
            <p>
              Today TOOLBeans offers 7 free tools used by developers, data analysts, students,
              and productivity-focused professionals. And We&apos;re just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* ── OUR MISSION ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Our Mission
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto text-sm">
              Our mission is to provide reliable, private, and free developer utilities to everyone —
              no gatekeeping, no sign-ups, no paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Technology
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            How TOOLBeans is Built
          </h2>
          <p className="text-slate-400 font-light text-sm max-w-lg mx-auto">
            We use modern, battle-tested technologies to ensure speed, reliability, and a great developer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stack.map((s) => (
            <div
              key={s.name}
              className={`border rounded-2xl p-5 flex items-center gap-4 ${s.color}`}
            >
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
              </div>
              <span className="text-xs bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIVACY NOTE ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-3xl p-10">
          <div className="flex items-start gap-5">
            <div className="text-4xl">🔒</div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                Our Privacy Commitment
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light mb-4">
                All tools on TOOLBeans process your data locally inside your browser.
                We do not transmit, store, or log any information you enter.
                Your sensitive data — passwords, API keys, private text — never touches our servers.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Read our full Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-extrabold mb-3">Start Using TOOLBeans Today</h3>
          <p className="text-indigo-100 text-sm font-light mb-8 max-w-md mx-auto">
            Free tools, no sign-up, no limits. Built for people who value their time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
            >
              ⚡ Explore All Tools
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-transparent text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-all duration-200 text-sm"
            >
              💬 Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}