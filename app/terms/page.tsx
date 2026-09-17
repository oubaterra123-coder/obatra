import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-gray-900"
          >
            Obatra
          </Link>

          <Link
            href="/"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
            Terms of Service
          </h1>

          <p className="mt-4 text-gray-500">
            Last updated: September 16, 2026
          </p>

          <div className="mt-10 space-y-10 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3 leading-7">
                By accessing or using Obatra, you agree to these Terms of
                Service. If you do not agree with these terms, please do not
                use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                2. Description of the Service
              </h2>
              <p className="mt-3 leading-7">
                Obatra provides AI-powered tools that may include chat,
                writing, image generation, PDF analysis, and translation
                features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                3. Accounts
              </h2>
              <p className="mt-3 leading-7">
                Some Obatra features require an account. You are responsible
                for providing accurate information and for keeping your account
                credentials secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                4. Acceptable Use
              </h2>
              <p className="mt-3 leading-7">
                You agree to use Obatra lawfully and responsibly. You must not
                use the service to violate applicable laws, infringe the rights
                of others, abuse the service, interfere with its operation, or
                attempt to gain unauthorized access to systems or data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                5. AI-Generated Content
              </h2>
              <p className="mt-3 leading-7">
                Obatra uses automated AI systems to generate responses and
                other content. AI-generated content may contain errors,
                omissions, or inaccurate information and should be reviewed
                before being relied upon.
              </p>

              <p className="mt-3 leading-7">
                You are responsible for evaluating and using AI-generated
                content appropriately for your intended purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                6. User Content
              </h2>
              <p className="mt-3 leading-7">
                You remain responsible for the content you submit to Obatra,
                including prompts, documents, messages, images, and other
                materials.
              </p>

              <p className="mt-3 leading-7">
                You should only submit content that you have the right to use
                and process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                7. Intellectual Property
              </h2>
              <p className="mt-3 leading-7">
                Obatra and its underlying software, design, branding, and
                technology are protected by applicable intellectual property
                laws. These Terms do not transfer ownership of Obatra's
                platform or technology to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                8. Availability
              </h2>
              <p className="mt-3 leading-7">
                We aim to keep Obatra available and reliable, but we do not
                guarantee uninterrupted or error-free operation. Features may
                occasionally be changed, suspended, or unavailable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                9. Third-Party Services
              </h2>
              <p className="mt-3 leading-7">
                Obatra may use third-party services for authentication,
                infrastructure, AI processing, payments, hosting, advertising,
                or other functionality. Their services may be subject to their
                own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                10. Prohibited Activities
              </h2>
              <p className="mt-3 leading-7">
                You must not attempt to misuse, disrupt, reverse engineer,
                attack, overload, or gain unauthorized access to Obatra or its
                infrastructure. You must not use automated methods to abuse
                service limits or interfere with other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                11. Account Suspension or Termination
              </h2>
              <p className="mt-3 leading-7">
                We may restrict or terminate access when necessary to protect
                the service, other users, or comply with applicable law,
                including in cases of abuse or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                12. Disclaimer
              </h2>
              <p className="mt-3 leading-7">
                Obatra is provided on an available basis. To the extent
                permitted by applicable law, we do not guarantee that the
                service or AI-generated results will always be accurate,
                complete, secure, or suitable for a particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                13. Limitation of Liability
              </h2>
              <p className="mt-3 leading-7">
                To the extent permitted by applicable law, Obatra will not be
                responsible for indirect, incidental, special, or consequential
                losses arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                14. Changes to These Terms
              </h2>
              <p className="mt-3 leading-7">
                We may update these Terms from time to time. Updated Terms will
                be posted on this page with a new update date. Continued use of
                Obatra after an update means you accept the revised Terms to
                the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                15. Contact
              </h2>
              <p className="mt-3 leading-7">
                If you have questions about these Terms, please visit our{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
