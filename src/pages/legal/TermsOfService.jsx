import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',        label: 'Agreement to terms' },
  { id: 'accounts',     label: 'Account registration' },
  { id: 'trial',        label: 'Free trial & SMS credits' },
  { id: 'subscriptions', label: 'Subscriptions & billing' },
  { id: 'suspension',   label: 'Suspension & termination' },
  { id: 'data',         label: 'Data ownership & preservation' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'ip',           label: 'Intellectual property' },
  { id: 'liability',    label: 'Limitation of liability' },
  { id: 'law',          label: 'Governing law' },
  { id: 'contact',      label: 'Contact us' },
]

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      tagline="The agreement between your church and MinistryOS, covering accounts, billing, and how the platform may be used."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Agreement to terms</h2>
        <p>
          These Terms of Service ("Terms") form a binding agreement between <strong>EM Control IT Solutions</strong>,
          operator of MinistryOS ("we", "us"), and the church or organization registering for an account
          ("Organization", "you"). By creating an account, you confirm that you are authorized to accept
          these Terms on behalf of your Organization.
        </p>
      </section>

      <section id="accounts">
        <h2>2. Account registration</h2>
        <ul>
          <li>You must provide accurate church and administrator information during registration.</li>
          <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
          <li>Administrator accounts may invite additional staff (Pastor, Admin/Secretary, Treasurer, Cell Leader) with role-based access.</li>
          <li>You must notify us promptly of any unauthorized use of your account.</li>
        </ul>
      </section>

      <section id="trial">
        <h2>3. Free trial & SMS credits</h2>
        <ul>
          <li>New Organizations receive a <strong>30-day free trial</strong> with full platform access.</li>
          <li><strong>200 free SMS credits</strong> are included with every new registration.</li>
          <li>No credit card is required to start a trial.</li>
          <li>At the end of the trial period, you must subscribe to a paid plan to retain full access. Your data is not deleted if you do not subscribe immediately — see Section 6.</li>
        </ul>
      </section>

      <section id="subscriptions">
        <h2>4. Subscriptions & billing</h2>
        <h3>4.1 Plans</h3>
        <p>
          MinistryOS offers Starter, Growth, and Enterprise plans, each with different member, staff, and
          branch limits, described on our <a href="/learn-more#pricing">Pricing page</a>. Additional branches
          and SMS credit top-ups may be purchased separately.
        </p>
        <h3>4.2 Payment method</h3>
        <p>
          Subscriptions are billed monthly via Mobile Money (MoMo). After submitting payment, you provide
          your transaction ID as proof; our team verifies and activates your subscription, typically within
          24 hours.
        </p>
        <h3>4.3 Renewal</h3>
        <p>
          Subscriptions do not auto-renew via saved card details — you submit a new MoMo payment each billing
          period. We will notify you before your subscription is due to expire.
        </p>
        <h3>4.4 Upgrades & downgrades</h3>
        <p>
          You may upgrade your plan at any time; the new plan takes effect once payment is verified. Downgrade
          requests are handled via our support team to ensure your usage fits within the new plan's limits.
        </p>
        <p>See also our <a href="/refund-policy">Refund & Cancellation Policy</a> for details on cancelling a pending payment.</p>
      </section>

      <section id="suspension">
        <h2>5. Suspension & termination</h2>
        <ul>
          <li>We may suspend accounts that violate these Terms, our <a href="/acceptable-use-policy">Acceptable Use Policy</a>, or applicable law.</li>
          <li>Accounts with an expired subscription are moved to a restricted "Billing only" state — your data remains intact and safe, but day-to-day features are paused until renewal.</li>
          <li>You may close your account at any time by contacting support.</li>
          <li>We reserve the right to terminate accounts used for illegal activity, fraud, or platform abuse, without refund of unused credits.</li>
        </ul>
      </section>

      <section id="data">
        <h2>6. Data ownership & preservation</h2>
        <ul>
          <li>Your Organization owns all data you enter into MinistryOS, including member records, attendance, and financial data.</li>
          <li>If your subscription expires or is suspended, <strong>your data is securely preserved</strong>, not deleted. Full access is restored automatically once your subscription is renewed.</li>
          <li>You may request an export of your data at any time by contacting support.</li>
          <li>On permanent account closure and a written deletion request, we will delete your Organization's data within a reasonable period, subject to legal retention obligations.</li>
        </ul>
      </section>

      <section id="acceptable-use">
        <h2>7. Acceptable use</h2>
        <p>
          Use of MinistryOS is subject to our <a href="/acceptable-use-policy">Acceptable Use Policy</a>,
          which prohibits spam SMS, illegal content, unauthorized access attempts, and other abuse of the
          platform.
        </p>
      </section>

      <section id="ip">
        <h2>8. Intellectual property</h2>
        <p>
          MinistryOS, its software, design, logos, and branding are the property of EM Control IT Solutions.
          These Terms do not grant you any ownership rights in the platform itself — only a right to use it
          in accordance with your subscription plan.
        </p>
      </section>

      <section id="liability">
        <h2>9. Limitation of liability</h2>
        <p>
          MinistryOS is provided "as is." To the maximum extent permitted by law, EM Control IT Solutions
          shall not be liable for indirect, incidental, or consequential damages arising from use of the
          platform, including but not limited to loss of data, revenue, or ministry opportunities, except
          where such loss results from our gross negligence or willful misconduct.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot lawfully be excluded, including liability for
          fraud or for death or personal injury caused by negligence.
        </p>
      </section>

      <section id="law">
        <h2>10. Governing law</h2>
        <p>
          These Terms are governed by the laws of the <strong>Republic of Ghana</strong>. Any disputes shall
          be subject to the exclusive jurisdiction of the courts of Ghana, unless otherwise required by
          applicable local law in your jurisdiction.
        </p>
      </section>

      <section id="contact">
        <h2>11. Contact us</h2>
        <p>
          Questions about these Terms can be sent to{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a> or via WhatsApp at{' '}
          <a href="https://wa.me/233553951396" target="_blank" rel="noopener noreferrer">+233 55 395 1396</a>.
        </p>
      </section>
    </LegalLayout>
  )
}