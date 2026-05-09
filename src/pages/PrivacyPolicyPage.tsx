import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-12">
          <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-3 block">
            Legal
          </span>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm">
            Last updated: May 3, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>JT Collections</strong> ("we", "us", or "our"). We are committed to
              protecting your personal information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit
              our website and make purchases.
            </p>
            <p className="mt-2">
              Please read this policy carefully. If you disagree with its terms, please discontinue
              use of the site.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly when you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create an account (name, email address, password)</li>
              <li>Place an order (billing/shipping address, phone number)</li>
              <li>Contact our support team</li>
            </ul>
            <p className="mt-3">We also collect information automatically, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on the site</li>
              <li>Referring URLs and search terms</li>
              <li>Device identifiers (via cookies and similar technologies)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              3. Cookies &amp; Tracking Technologies
            </h2>
            <p>
              We use cookies, pixel tags, and similar tracking technologies to enhance your
              experience, analyse site traffic, and deliver targeted advertisements.
            </p>
            <p className="mt-3">
              <strong>Meta Pixel (Facebook Pixel):</strong> Our website uses the Meta Pixel, a
              tracking code provided by Meta Platforms, Inc. The Pixel allows us to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Measure the effectiveness of our Facebook and Instagram advertisements</li>
              <li>
                Track standard events such as <em>ViewContent</em>, <em>AddToCart</em>,{' '}
                <em>InitiateCheckout</em>, and <em>Purchase</em>
              </li>
              <li>Build custom audiences for retargeting campaigns</li>
            </ul>
            <p className="mt-3">
              Event data (including product value in PKR, product IDs, and order totals) is shared
              with Meta via both the browser Pixel and the Meta Conversions API (server-side) to
              improve measurement accuracy and reduce data loss. A unique <em>event_id</em> is used
              for deduplication so events are not counted twice.
            </p>
            <p className="mt-3">
              You can opt out of Meta's personalised advertising at any time through{' '}
              <a
                href="https://www.facebook.com/ads/preferences"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Facebook Ad Preferences
              </a>{' '}
              or the{' '}
              <a
                href="https://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Digital Advertising Alliance opt-out
              </a>
              .
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and fulfil your orders</li>
              <li>Send order confirmations and shipping updates via email</li>
              <li>Respond to customer service requests</li>
              <li>Improve our website and product offerings</li>
              <li>Show you relevant advertisements on Meta platforms (Facebook/Instagram)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              5. Sharing Your Information
            </h2>
            <p>We do <strong>not</strong> sell your personal data. We may share it with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Meta Platforms, Inc.</strong> — for advertising measurement via the Meta
                Pixel and Conversions API
              </li>
              <li>
                <strong>Supabase</strong> — our database provider (stores your account and order
                data securely)
              </li>
              <li>
                <strong>Email service providers</strong> — to send transactional emails
              </li>
              <li>
                <strong>Law enforcement</strong> — when required by applicable law
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to
              provide services. Order records are retained for a minimum of 5 years for tax and
              legal compliance. You may request deletion of your account at any time by contacting
              us.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a
                href="mailto:tayyabjavaid71@gmail.com"
                className="text-primary underline"
              >
                tayyabjavaid71@gmail.com
              </a>
              .
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">8. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption,
              row-level security on our database, and JWT-based authentication to protect your
              personal information. No method of transmission over the internet is 100% secure,
              however we strive to use commercially acceptable means to protect your data.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              9. Third-Party Links
            </h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the
              privacy practices of those sites and encourage you to review their privacy policies.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              10. Children's Privacy
            </h2>
            <p>
              Our services are not directed to children under the age of 13. We do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal data, please contact us so we can delete it.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be
              indicated by the "Last updated" date at the top of this page. Continued use of the
              site after changes constitutes your acceptance of the revised policy.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-2xl font-black text-slate-800 mb-3">12. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact:</p>
            <div className="mt-3 p-6 bg-slate-50 rounded-2xl space-y-1">
              <p className="font-black text-slate-800">JT Collections</p>
              <p>
                Email:{' '}
                <a href="mailto:tayyabjavaid71@gmail.com" className="text-primary underline">
                  tayyabjavaid71@gmail.com
                </a>
              </p>
              <p>Pakistan</p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
