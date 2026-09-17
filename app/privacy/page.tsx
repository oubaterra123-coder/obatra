import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-gray-500">
            Last updated: September 16, 2026
          </p>

          <div className="mt-10 space-y-10 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                1. Introduction
              </h2>
              <p className="mt-3 leading-7">
                Welcome to Obatra. This Privacy Policy explains how information
                is collected, used, stored, and protected when you use the
                Obatra website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                2. Information We Collect
              </h2>
              <p className="mt-3 leading-7">
                When you create and use an Obatra account, we may collect
                information such as your name, email address, account
                identifier, and account plan.
              </p>

              <p className="mt-3 leading-7">
                When you use Obatra features, we may also process content you
                choose to provide, including chat messages, generated content,
                translation requests, prompts, images, and documents or PDF
                content submitted for analysis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                3. How We Use Information
              </h2>
              <p className="mt-3 leading-7">
                We use information to provide and operate Obatra, authenticate
                users, save conversations and generated content, provide AI
                features, maintain security, troubleshoot technical problems,
                and improve the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                4. AI Services
              </h2>
              <p className="mt-3 leading-7">
                Some Obatra features use third-party AI services, including
                Google Gemini. Content submitted to AI-powered features may be
                processed by these providers to generate the requested result.
              </p>

              <p className="mt-3 leading-7">
                You should avoid submitting confidential, highly sensitive, or
                unnecessary personal information to AI features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                5. Data Storage and Authentication
              </h2>
              <p className="mt-3 leading-7">
                Obatra uses Supabase for authentication and data storage.
                Account information, profiles, conversations, messages, and
                certain generated content may be stored securely through these
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                6. Cookies and Similar Technologies
              </h2>
              <p className="mt-3 leading-7">
                Obatra may use cookies, browser storage, authentication
                sessions, and similar technologies to keep users signed in,
                maintain preferences, and operate the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                7. Advertising
              </h2>
              <p className="mt-3 leading-7">
                Obatra may display advertising in the future. Third-party
                advertising providers may use cookies or similar technologies
                according to their own privacy policies and applicable
                requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                8. Data Security
              </h2>
              <p className="mt-3 leading-7">
                We take reasonable measures to protect information processed
                through Obatra. However, no internet service or method of
                electronic storage can be guaranteed to be completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                9. Data Retention and Deletion
              </h2>
              <p className="mt-3 leading-7">
                Information may be retained for as long as reasonably necessary
                to provide the service, maintain account functionality, comply
                with legal obligations, resolve disputes, and protect the
                service.
              </p>

              <p className="mt-3 leading-7">
                If you want to request deletion of your account or personal
                information, please contact us through the Contact page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                10. Third-Party Services
              </h2>
              <p className="mt-3 leading-7">
                Obatra may rely on third-party providers for infrastructure,
                authentication, AI processing, payments, analytics, hosting,
                security, or advertising. These providers may process
                information as necessary to provide their services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                11. Your Choices
              </h2>
              <p className="mt-3 leading-7">
                You may choose what information and content you submit to
                Obatra. You can also contact us regarding questions or
                requests concerning your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                12. Changes to This Policy
              </h2>
              <p className="mt-3 leading-7">
                We may update this Privacy Policy from time to time. When
                changes are made, the updated version will be posted on this
                page with a new update date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                13. Contact
              </h2>
              <p className="mt-3 leading-7">
                If you have questions about this Privacy Policy or how Obatra
                handles information, please visit our{" "}
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
