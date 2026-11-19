import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',      label: 'Overview' },
  { id: 'trial',      label: 'Free trial' },
  { id: 'paying',     label: 'How you pay' },
  { id: 'delivery',   label: 'Delivery' },
  { id: 'pending',    label: 'Cancelling a pending payment' },
  { id: 'refunds',    label: 'Refunds' },
  { id: 'disputes',   label: 'Payment disputes' },
  { id: 'sms',        label: 'SMS credit bundles' },
  { id: 'branches',   label: 'Additional branches' },
  { id: 'cancel',     label: 'Cancelling & renewals' },
  { id: 'contact',    label: 'Contact us' },
]

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      tagline="How payments, delivery, cancellations and refunds work for MinistryOS subscriptions and SMS credits."
      updated="11 November 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Overview</h2>
        <p>
          MinistryOS is church management software sold as a subscription, with optional SMS credit bundles
          and extra branches. This policy explains how you pay, what you receive, how to cancel, and when a
          refund applies. It applies to every church using MinistryOS, in addition to our{' '}
          <a href="/terms-of-service">Terms of Service</a>.
        </p>
      </section>

      <section id="trial">
        <h2>2. Free trial</h2>
        <p>
          Every new church gets a 30-day free trial. No payment method is needed to start, so there is
          nothing to refund if you decide not to continue. Simply stop using the platform, or contact us to
          request account and data deletion.
        </p>
      </section>

      <section id="paying">
        <h2>3. How you pay</h2>
        <ul>
          <li>
            <strong>Online (Mobile Money or card):</strong> payments are processed securely by Paystack.
            MTN, Telecel and AirtelTigo Mobile Money and Visa/Mastercard cards are supported. We never see or
            store your card number or Mobile Money PIN — these are handled by Paystack and your provider.
            Your plan activates automatically as soon as Paystack confirms the payment.
          </li>
          <li>
            <strong>Manual payment:</strong> you may instead pay by Mobile Money or bank transfer (or PayPal,
            where offered) and submit your transaction ID. Our team verifies it and activates your plan,
            usually within 24 hours.
          </li>
          <li>
            Prices are shown in Ghana cedis (GHS) or US dollars (USD) before you pay. Online payment may not
            be available in every currency; manual payment is always available.
          </li>
        </ul>
      </section>

      <section id="delivery">
        <h2>4. Delivery</h2>
        <p>
          MinistryOS is a digital service, so nothing is shipped. Your subscription period, SMS credits or
          extra branch are added to your account <strong>immediately</strong> after an online payment is
          confirmed, or once we verify a manual payment. You will see the change on your Billing page and
          the payment in your Billing → History tab.
        </p>
      </section>

      <section id="pending">
        <h2>5. Cancelling a pending payment</h2>
        <p>
          After you choose a plan, branch or SMS bundle, a payment request is created with the status
          <strong> "Awaiting Payment"</strong>. At this stage:
        </p>
        <ul>
          <li>You can cancel it at any time from Billing → History at no cost.</li>
          <li>If you paid but the payment is not showing, contact us straight away with your reference (for example MOS-1001). If money left your account and nothing was activated, we will fix it or refund it.</li>
        </ul>
      </section>

      <section id="refunds">
        <h2>6. Refunds</h2>
        <p>
          Once a payment is confirmed and your plan, credits or branch are activated, payments are
          <strong> non-refundable</strong>, except in these cases:
        </p>
        <ul>
          <li><strong>Duplicate or wrong charge:</strong> you were charged twice, or for the wrong amount.</li>
          <li><strong>Not delivered:</strong> you paid but your plan, credits or branch were not activated and we cannot fix it.</li>
          <li><strong>Our error:</strong> a billing mistake on our side, or a failure of the service that stopped you using what you paid for.</li>
          <li><strong>Where the law requires it:</strong> including Ghanaian consumer protection law.</li>
        </ul>
        <p>
          To request a refund, contact us within <strong>7 days</strong> of the payment with your reference
          number. We aim to respond within 2 business days. Approved refunds are returned to the original
          payment method (your card or Mobile Money wallet, or the account you paid from). After we issue a
          refund, your bank or Mobile Money provider may take several business days to show it.
        </p>
      </section>

      <section id="disputes">
        <h2>7. Payment disputes</h2>
        <p>
          If you do not recognise a charge or have a problem, please contact us first — we can usually
          resolve it quickly and with less trouble than a card dispute. Unfounded chargebacks may lead to
          suspension of the account.
        </p>
      </section>

      <section id="sms">
        <h2>8. SMS credit bundles</h2>
        <p>
          SMS credits are consumable and non-refundable once purchased, because they can be used right away.
          Credits do not expire. <strong>Long messages use more than one credit</strong>: a message is sent
          in parts of up to 160 characters (153 per part when a message has more than one part; 70 / 67 if it
          contains emoji or special characters), and one credit is used per part, per recipient. The compose
          screen shows how many parts and credits a message will use before you send it.
        </p>
      </section>

      <section id="branches">
        <h2>9. Additional branches</h2>
        <p>
          Additional branches follow the same rules as your main subscription. If you stop using an extra
          branch mid-cycle, it stays active until the end of the period already paid for and is then not
          renewed.
        </p>
      </section>

      <section id="cancel">
        <h2>10. Cancelling & renewals</h2>
        <p>
          <strong>We never charge you automatically.</strong> MinistryOS does not save your card or Mobile
          Money details and does not renew on its own. Each billing period you choose to pay again. To
          stop, simply do not renew — your paid period stays active until its end date, after which your
          account moves to a restricted "Billing only" state. Your data is preserved (see our{' '}
          <a href="/terms-of-service">Terms of Service</a>, section 6), and you can resume any time by
          subscribing again. You may also ask us to close your account or delete your data at any time.
        </p>
      </section>

      <section id="contact">
        <h2>11. Contact us</h2>
        <p>
          For billing questions or refund requests, contact us at{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a> or on WhatsApp at{' '}
          <a href="https://wa.me/233553951396" target="_blank" rel="noopener noreferrer">+233 55 395 1396</a>.
          See our <a href="/contact">Contact page</a> for our address and other details.
        </p>
      </section>
    </LegalLayout>
  )
}
