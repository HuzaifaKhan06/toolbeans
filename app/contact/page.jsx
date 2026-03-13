// app/contact/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Are all 21 tools completely free?',
    a: 'Yes. Every tool on TOOLBeans is 100% free with no usage limits. No account, no credit card, no subscription ever.',
  },
  {
    q: 'Do you store the data I enter into tools?',
    a: 'Never. All tools run entirely in your browser. Your data never leaves your device or touches our servers.',
  },
  {
    q: 'Can I request a new tool?',
    a: 'Absolutely. Use the contact form and describe the tool you need. We review every request and build the most-requested ones.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed. Open any tool and start using it immediately no sign-up, no login required.',
  },
];

export default function ContactPage() {
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq]   = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Contact</span>
          </nav>
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Contact
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Get in{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto">
            Have a question, found a bug or want to request a new tool? Fill out the form
            and we will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3 select-none">⏱️</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Response Time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We respond within <strong className="text-slate-600">24 business hours</strong>.
                Write URGENT in the subject for critical issues.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3 select-none">🕐</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Support Hours</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monday to Friday<br />
                <strong className="text-slate-600">9:00 AM – 6:00 PM UTC</strong>
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3 select-none">🐛</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Found a Bug?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Include the tool name, what you were doing and what went wrong.
                Screenshots help a lot.
              </p>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-6 shadow-sm text-white">
              <div className="text-3xl mb-3 select-none">💡</div>
              <h3 className="font-bold text-sm mb-1">Request a Tool</h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Missing something from our 21 free tools? Tell us what you need
                and we will consider building it next.
              </p>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Send us a Message</h2>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-3xl mb-4 select-none">
                    ✅
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-400 max-w-sm mb-6">
                    We received your message and will reply within 24 hours.
                    Check your inbox for a confirmation email.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-sm text-indigo-600 font-semibold hover:underline"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {status === 'error' && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text" name="name" value={form.name}
                        onChange={handleChange} required placeholder="John Doe"
                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email" name="email" value={form.email}
                        onChange={handleChange} required placeholder="you@example.com"
                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Subject <span className="text-rose-400">*</span>
                    </label>
                    <select
                      name="subject" value={form.subject}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-slate-600 bg-white"
                    >
                      <option value="">Select a subject…</option>
                      <option value="general">General Question</option>
                      <option value="bug">Bug Report</option>
                      <option value="tool-request">Tool Request</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      name="message" value={form.message}
                      onChange={handleChange} required rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none placeholder:text-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending…
                      </>
                    ) : '📨 Send Message'}
                  </button>

                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <span className="text-slate-400 text-lg ml-4 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-4 text-sm text-slate-400 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-extrabold mb-3">Ready to Explore the Tools?</h3>
          <p className="text-indigo-100 text-sm font-light mb-8 max-w-md mx-auto">
            21 free developer tools waiting for you no sign-up, no limits, no cost.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
          >
            ⚡ Browse All 21 Tools
          </Link>
        </div>
      </section>

    </div>
  );
}