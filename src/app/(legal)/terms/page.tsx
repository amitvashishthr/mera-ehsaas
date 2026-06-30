"use client";

export default function TermsPage() {
  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Terms of Service</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
        <p><strong>Effective Date:</strong> July 1, 2026</p>
        <p>By using MeraEhsaas, you agree to these terms.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Eligibility</h2>
        <p>You must be at least 13 years old to use MeraEhsaas. By creating an account, you confirm you meet this requirement.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Your Content</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You retain ownership of all content you post</li>
          <li>You grant us a license to display your content on our platform</li>
          <li>You are responsible for your content — do not post illegal, harmful, or plagiarized material</li>
        </ul>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Prohibited Conduct</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Harassment, hate speech, or threats</li>
          <li>Spam or automated posting</li>
          <li>Impersonation of others</li>
          <li>Circumventing security measures</li>
          <li>Posting explicit or harmful content</li>
        </ul>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Print Orders</h2>
        <p>Print orders are subject to production timelines. Delivery estimates are approximate. We reserve the right to refuse orders that violate our content policies.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Termination</h2>
        <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Limitation of Liability</h2>
        <p>MeraEhsaas is provided &quot;as is&quot; without warranties. We are not liable for content posted by users or service interruptions.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Contact</h2>
        <p>Questions about these terms: <strong>legal@meraehsaas.com</strong></p>
      </div>
    </div>
  );
}
