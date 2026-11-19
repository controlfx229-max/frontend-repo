import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'support',  label: 'Customer support' },
  { id: 'business', label: 'Business details' },
  { id: 'billing',  label: 'Billing & refunds' },
  { id: 'privacy',  label: 'Privacy & security' },
]

export default function Contact() {
  return (
    <LegalLayout
      title="Contact us"
      tagline="Questions about MinistryOS, your account or a payment? Here is how to reach us."
      updated="11 November 2026"
      sections={sections}
    >
      <section id="support">
        <h2>1. Customer support</h2>
        <p>We are happy to help churches get set up and answer any question about the platform.</p>
        <ul>
          <li>Email: <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a></li>
          <li>WhatsApp / phone: <a href="https://wa.me/233553951396" target="_blank" rel="noopener noreferrer">+233 55 395 1396</a></li>
        </ul>
        <p>We aim to reply within 1–2 business days.</p>
      </section>

      <section id="business">
        <h2>2. Business details</h2>
        <ul>
          <li><strong>Product:</strong> MinistryOS — church management software (members, attendance, giving, SMS and reports)</li>
          <li><strong>Operated by:</strong> EM Control IT Solutions</li>
          <li><strong>Address:</strong> 20 Sarfo Lane, Accra, Greater Accra Region, Ghana</li>
          <li><strong>Website:</strong> <a href="https://ministryosapp.com">ministryosapp.com</a></li>
        </ul>
      </section>

      <section id="billing">
        <h2>3. Billing & refunds</h2>
        <p>
          For payment problems, receipts or refund requests, email or message us with your payment reference
          (for example MOS-1001). Please read our <a href="/refund-policy">Refund & Cancellation Policy</a> first
          — it explains how payments, delivery and cancellations work.
        </p>
      </section>

      <section id="privacy">
        <h2>4. Privacy & security</h2>
        <p>
          For privacy requests or to report a security concern, contact us at the email above. See our{' '}
          <a href="/privacy-policy">Privacy Policy</a> and <a href="/data-security">Data Security</a> pages.
        </p>
      </section>
    </LegalLayout>
  )
}
