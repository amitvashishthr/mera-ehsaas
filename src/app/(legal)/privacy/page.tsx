"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Privacy Policy</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
        <p><strong>Effective Date:</strong> July 1, 2026</p>
        <p>MeraEhsaas (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy explains how we collect, use, and protect your information.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> name, email, username, profile picture</li>
          <li><strong>Content:</strong> posts, comments, collections you create</li>
          <li><strong>Usage data:</strong> pages viewed, features used, device information</li>
          <li><strong>Order information:</strong> shipping address for print orders</li>
        </ul>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and improve our services</li>
          <li>Process print orders and deliveries</li>
          <li>Send notifications about activity on your content</li>
          <li>Ensure security and prevent abuse</li>
        </ul>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Data Storage</h2>
        <p>Your data is stored securely using Supabase (hosted on AWS). We use industry-standard encryption for data in transit and at rest.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with service providers who help us operate (hosting, email delivery, payment processing).</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Your Rights</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and data</li>
          <li>Export your content</li>
        </ul>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Account Deletion</h2>
        <p>You can delete your account at any time from Settings. All your data will be permanently removed within 30 days.</p>

        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mt-6">Contact</h2>
        <p>For privacy questions, contact us at: <strong>privacy@meraehsaas.com</strong></p>
      </div>
    </div>
  );
}
