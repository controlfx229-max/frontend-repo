import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',        label: 'Introduction' },
  { id: 'info-we-collect', label: 'Information we collect' },
  { id: 'how-we-use',   label: 'How we use information' },
  { id: 'sharing',      label: 'Sharing & third parties' },
  { id: 'retention',    label: 'Data retention' },
  { id: 'security',     label: 'How we protect data' },
  { id: 'rights',       label: 'Your rights' },
  { id: 'children',     label: "Children's data" },
  { id: 'changes',      label: 'Changes to this policy' },
  { id: 'contact',      label: 'Contact us' },
]

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      tagline="How MinistryOS collects, uses, and protects the information your church and its members trust us with."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Introduction</h2>
        <p>
          MinistryOS is a church management platform operated by <strong>EM Control IT Solutions</strong>
          ("MinistryOS", "we", "us", "our"). This Privacy Policy explains what information we collect
          when a church ("Organization") and its staff, leaders, and members use MinistryOS, why we
          collect it, and how it is stored and protected.
        </p>
        <p>
          By registering for or using MinistryOS, you agree to the collection and use of information
          as described in this policy. If you do not agree, please do not use the platform.
        </p>
      </section>

      <section id="info-we-collect">
        <h2>2. Information we collect</h2>
        <h3>2.1 Account & organization information</h3>
        <ul>
          <li>Church name, denomination, country/region, church email, and phone number</li>
          <li>Administrator name, email, phone number, and password (stored encrypted)</li>
          <li>Branch information, if your church operates multiple locations</li>
        </ul>

        <h3>2.2 Member data (entered by your church)</h3>
        <ul>
          <li>Names, phone numbers, WhatsApp numbers, gender, date of birth, and marital status</li>
          <li>Department, cell group, and baptism status</li>
          <li>Attendance records for services and events</li>
          <li>Giving and pledge records (tithes, offerings, pledges)</li>
        </ul>
        <div className="legal-callout">
          <p>
            Member data is entered and controlled by your church. MinistryOS acts as a data processor
            for this information — your church remains the data controller responsible for the accuracy
            and lawful collection of member details.
          </p>
        </div>

        <h3>2.3 Payment information</h3>
        <p>
          We do not store full Mobile Money (MoMo) account details or card numbers. Subscription and SMS
          bundle payments are verified using the transaction reference and ID you submit, which we use
          solely to confirm payment before activating your subscription.
        </p>

        <h3>2.4 Technical & usage information</h3>
        <ul>
          <li>Login timestamps, device/browser type, and IP address (for security and fraud prevention)</li>
          <li>Feature usage, to help us improve the platform</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>3. How we use information</h2>
        <ul>
          <li>To provide, operate, and maintain the MinistryOS platform for your church</li>
          <li>To send SMS communications your church initiates (e.g. birthday messages, absence follow-ups, event reminders) via our SMS provider</li>
          <li>To process and verify subscription and SMS credit payments</li>
          <li>To provide customer support and respond to enquiries</li>
          <li>To detect, prevent, and address fraud, abuse, or security issues</li>
          <li>To send important account or billing notices (e.g. trial ending, low SMS credits)</li>
        </ul>
        <p>
          We do <strong>not</strong> sell church or member data to third parties, and we do not use member
          data for advertising.
        </p>
      </section>

      <section id="sharing">
        <h2>4. Sharing & third-party services</h2>
        <p>We share information only with service providers that help us operate MinistryOS, under confidentiality obligations:</p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr><th>Provider</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td>Cloud database hosting</td><td>Secure storage of your church's data</td></tr>
              <tr><td>SMS gateway provider (e.g. Arkesel)</td><td>Delivering SMS messages your church sends through the platform</td></tr>
              <tr><td>Mobile Money network</td><td>Verifying subscription and SMS bundle payments</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          We may also disclose information if required by law, regulation, or a valid legal request from
          a competent authority in Ghana or another applicable jurisdiction.
        </p>
      </section>

      <section id="retention">
        <h2>5. Data retention</h2>
        <p>
          We retain your church's data for as long as your account remains active. If your subscription
          expires or is suspended, <strong>your data is preserved securely</strong> — it is not deleted —
          so that full access can be restored as soon as your subscription is renewed.
        </p>
        <p>
          If you close your account permanently and request deletion, we will remove your organization's
          data within a reasonable period, except where retention is required for legal, accounting, or
          dispute-resolution purposes.
        </p>
      </section>

      <section id="security">
        <h2>6. How we protect your data</h2>
        <ul>
          <li>Passwords are stored using industry-standard hashing — never in plain text</li>
          <li>Data is encrypted in transit using HTTPS/TLS</li>
          <li>Two-factor authentication (2FA) is available for administrator and platform accounts</li>
          <li>Access to church data is restricted to authenticated staff accounts you create, with role-based permissions</li>
          <li>Regular backups are maintained to protect against data loss</li>
        </ul>
        <p>See our <a href="/data-security">Data Security Policy</a> for more detail.</p>
      </section>

      <section id="rights">
        <h2>7. Your rights</h2>
        <p>
          Under Ghana's <strong>Data Protection Act, 2012 (Act 843)</strong>, and similar laws in other
          jurisdictions, you may have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data, subject to legal retention requirements</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          Church members who wish to exercise these rights should first contact their church administrator,
          who controls the member data entered into MinistryOS. Church administrators can contact us directly
          at any time.
        </p>
      </section>

      <section id="children">
        <h2>8. Children's data</h2>
        <p>
          Churches may record information about minors (e.g. children's ministry attendance). This data is
          entered and controlled by the church, which is responsible for obtaining any parental/guardian
          consent required under applicable law before entering a minor's information into MinistryOS.
        </p>
      </section>

      <section id="changes">
        <h2>9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be communicated via
          email or an in-app notice. Continued use of MinistryOS after changes take effect constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <section id="contact">
        <h2>10. Contact us</h2>
        <p>
          For any privacy questions or requests, contact us at{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a> or via WhatsApp at{' '}
          <a href="https://wa.me/233553951396" target="_blank" rel="noopener noreferrer">+233 55 395 1396</a>.
        </p>
      </section>
    </LegalLayout>
  )
}