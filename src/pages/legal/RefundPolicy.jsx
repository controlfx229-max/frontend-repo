import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',      label: 'Overview' },
  { id: 'trial',      label: 'Free trial cancellation' },
  { id: 'pending',    label: 'Cancelling a pending payment' },
  { id: 'refunds',    label: 'Refunds after payment' },
  { id: 'sms',        label: 'SMS credit bundles' },
  { id: 'branches',   label: 'Additional branches' },
  { id: 'downgrade',  label: 'Cancelling a subscription' },
  { id: 'contact',    label: 'Contact us' },
]

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      tagline="How trials, subscriptions, and SMS credit purchases can be cancelled — and when a refund applies."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Overview</h2>
        <p>
          MinistryOS is billed via Mobile Money (MoMo), verified manually by our team. Because of this
          payment method, our refund process is straightforward: <strong>you can cancel a payment request
          before it is approved at no cost</strong>. This policy explains what happens at each stage.
        </p>
      </section>

      <section id="trial">
        <h2>2. Free trial cancellation</h2>
        <p>
          Your 30-day free trial requires no payment method to start, so there is nothing to refund if you
          decide not to continue. Simply stop using the platform, or contact us to request account and data
          deletion.
        </p>
      </section>

      <section id="pending">
        <h2>3. Cancelling a pending payment</h2>
        <p>
          After requesting a subscription, branch, or SMS bundle, a payment request is created with status
          <strong> "Awaiting Payment."</strong> At this stage:
        </p>
        <ul>
          <li>You can cancel the request at any time from your Billing → History tab before sending money.</li>
          <li>If you have already sent MoMo payment but haven't submitted your transaction ID yet, contact support immediately to arrange a refund via MoMo to your original sending number.</li>
        </ul>
      </section>

      <section id="refunds">
        <h2>4. Refunds after payment is approved</h2>
        <p>
          Once a payment is <strong>submitted with a transaction ID and approved</strong> by our team, the
          associated subscription period, branch, or SMS credits are activated immediately. Because MoMo
          transfers cannot be automatically reversed and credits/access are granted right away:
        </p>
        <ul>
          <li>Subscription payments are <strong>non-refundable</strong> once approved and activated, except where required by Ghanaian consumer protection law or where MinistryOS is at fault (e.g. a billing error on our part).</li>
          <li>If you believe you were charged in error, contact support within 7 days of the transaction — we will investigate and issue a refund via MoMo if a genuine error is confirmed.</li>
        </ul>
      </section>

      <section id="sms">
        <h2>5. SMS credit bundles</h2>
        <p>
          SMS credit bundles are consumable and generally non-refundable once purchased, since credits may
          be used immediately for outgoing messages. Unused credits do not expire and roll over between
          billing periods.
        </p>
      </section>

      <section id="branches">
        <h2>6. Additional branches</h2>
        <p>
          Additional branch subscriptions follow the same rules as your main subscription (Section 4). If
          you close an additional branch mid-cycle, it will remain active until the end of the period already
          paid for, after which it will not be renewed.
        </p>
      </section>

      <section id="downgrade">
        <h2>7. Cancelling an active subscription</h2>
        <p>
          You may cancel future renewals at any time — your current paid period remains active until its
          expiry date, after which your account moves to a restricted "Billing only" state. Your data is
          preserved (see our <a href="/terms-of-service">Terms of Service</a>, Section 6) so you can resume
          at any time by subscribing again.
        </p>
      </section>

      <section id="contact">
        <h2>8. Contact us</h2>
        <p>
          For billing disputes or refund requests, contact us at{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a> or via WhatsApp at{' '}
          <a href="https://wa.me/233553951396" target="_blank" rel="noopener noreferrer">+233 55 395 1396</a>.
        </p>
      </section>
    </LegalLayout>
  )
}