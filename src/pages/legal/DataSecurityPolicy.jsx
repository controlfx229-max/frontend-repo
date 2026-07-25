import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',      label: 'Overview' },
  { id: 'encryption', label: 'Encryption' },
  { id: 'auth',       label: 'Authentication' },
  { id: 'access',     label: 'Access control' },
  { id: 'backups',    label: 'Backups & recovery' },
  { id: 'audit',      label: 'Audit logging' },
  { id: 'preservation', label: 'Data preservation' },
  { id: 'incident',   label: 'Incident response' },
  { id: 'contact',    label: 'Contact us' },
]

export default function DataSecurityPolicy() {
  return (
    <LegalLayout
      title="Data Security Policy"
      tagline="A closer look at the technical and organizational measures MinistryOS uses to keep your church's data safe."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Overview</h2>
        <p>
          Your church's member, attendance, and financial records are sensitive. This page describes the
          security practices MinistryOS follows to protect that data, in plain language, so your leadership
          team can explain it to your congregation with confidence.
        </p>
      </section>

      <section id="encryption">
        <h2>2. Encryption</h2>
        <ul>
          <li>All traffic between your browser and MinistryOS is encrypted in transit using HTTPS/TLS.</li>
          <li>Passwords are never stored in plain text — they are hashed using industry-standard, one-way algorithms.</li>
          <li>Sensitive tokens (login sessions, password reset links, 2FA setup tokens) are time-limited and single-use where applicable.</li>
        </ul>
      </section>

      <section id="auth">
        <h2>3. Authentication</h2>
        <ul>
          <li>Optional <strong>two-factor authentication (2FA)</strong> via authenticator app, with one-time backup codes for account recovery.</li>
          <li>Password reset flows are verified by email or SMS OTP before any password change is allowed.</li>
          <li>Session tokens expire and require re-authentication for continued access.</li>
        </ul>
      </section>

      <section id="access">
        <h2>4. Access control</h2>
        <ul>
          <li>Every staff account has a defined role (Pastor, Admin/Secretary, Treasurer, Cell Leader, Superadmin) that limits what they can view and change.</li>
          <li>Cross-branch access is off by default for multi-branch churches and must be explicitly enabled per staff member.</li>
          <li>Platform-level administrative access (used by EM Control IT Solutions staff) is restricted to a small team and logged.</li>
        </ul>
      </section>

      <section id="backups">
        <h2>5. Backups & disaster recovery</h2>
        <ul>
          <li>Your church's data is backed up automatically on a regular schedule.</li>
          <li>Backups are stored securely and separately from live production data.</li>
          <li>In the event of a system failure, we work to restore service and data from the most recent backup as quickly as possible.</li>
        </ul>
      </section>

      <section id="audit">
        <h2>6. Audit logging</h2>
        <p>
          Key actions — such as attendance changes, payment approvals, and staff role changes — are recorded
          in an Audit Log accessible to your church's administrators, so you always have visibility into who
          changed what, and when.
        </p>
      </section>

      <section id="preservation">
        <h2>7. Data preservation after expiry</h2>
        <p>
          If a subscription lapses, your data is <strong>not deleted</strong>. It is preserved securely in a
          restricted state, and full access is restored automatically as soon as your subscription is
          renewed. This ensures a missed payment never means losing years of member and attendance history.
        </p>
      </section>

      <section id="incident">
        <h2>8. Incident response</h2>
        <p>
          In the unlikely event of a data breach affecting your church's information, we will investigate
          promptly, take steps to contain and remediate the issue, and notify affected Organizations in
          accordance with our obligations under Ghana's Data Protection Act, 2012 (Act 843) and other
          applicable law.
        </p>
      </section>

      <section id="contact">
        <h2>9. Contact us</h2>
        <p>
          To report a security concern or vulnerability, contact{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a> directly — we take these reports
          seriously and will respond promptly.
        </p>
      </section>
    </LegalLayout>
  )
}