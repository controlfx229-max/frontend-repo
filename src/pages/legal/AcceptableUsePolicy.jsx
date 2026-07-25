import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',      label: 'Overview' },
  { id: 'sms',        label: 'SMS & communications' },
  { id: 'content',    label: 'Prohibited content' },
  { id: 'security',   label: 'Platform security' },
  { id: 'accounts',   label: 'Account sharing & access' },
  { id: 'enforcement', label: 'Enforcement' },
  { id: 'contact',    label: 'Contact us' },
]

export default function AcceptableUsePolicy() {
  return (
    <LegalLayout
      title="Acceptable Use Policy"
      tagline="Ground rules for using MinistryOS responsibly — for your church, your members, and everyone else on the platform."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. Overview</h2>
        <p>
          This Acceptable Use Policy applies to every Organization, staff account, and integration using
          MinistryOS. It exists to keep the platform safe, reliable, and trustworthy for every church that
          relies on it. Violations may result in warnings, feature restrictions, or account suspension as
          described in our <a href="/terms-of-service">Terms of Service</a>.
        </p>
      </section>

      <section id="sms">
        <h2>2. SMS & communications</h2>
        <p>You agree to use the Communications and Automations features only to message people who expect to hear from your church. Specifically, you must not:</p>
        <ul>
          <li>Send unsolicited bulk SMS to phone numbers not connected to your congregation ("spam")</li>
          <li>Send messages that are misleading, harassing, or unrelated to legitimate church communication</li>
          <li>Use MinistryOS SMS credits to send marketing for unrelated businesses or third parties</li>
          <li>Attempt to disguise the identity of the sending church</li>
        </ul>
      </section>

      <section id="content">
        <h2>3. Prohibited content</h2>
        <p>You must not upload, store, or transmit through MinistryOS any content that:</p>
        <ul>
          <li>Is illegal under the laws of Ghana or the jurisdiction in which your church operates</li>
          <li>Infringes another party's intellectual property or privacy rights</li>
          <li>Contains malware, viruses, or code intended to harm the platform or other users</li>
          <li>Is defamatory, hateful, or incites violence or discrimination</li>
          <li>Impersonates another church, organization, or individual</li>
        </ul>
      </section>

      <section id="security">
        <h2>4. Platform security</h2>
        <p>You must not:</p>
        <ul>
          <li>Attempt to gain unauthorized access to another Organization's data or account</li>
          <li>Probe, scan, or test the vulnerability of MinistryOS systems without our prior written permission</li>
          <li>Interfere with or disrupt the platform's servers, networks, or other users' access</li>
          <li>Use automated tools (bots, scrapers) to extract data from MinistryOS beyond normal application use</li>
          <li>Circumvent rate limits, subscription limits, or security features such as two-factor authentication</li>
        </ul>
      </section>

      <section id="accounts">
        <h2>5. Account sharing & access</h2>
        <ul>
          <li>Each staff member should have their own login — do not share a single account across multiple people, as this weakens security and audit accuracy.</li>
          <li>Administrators are responsible for removing access promptly when a staff member leaves the church team.</li>
          <li>Role-based permissions (Pastor, Admin/Secretary, Treasurer, Cell Leader) should be assigned to match each person's actual responsibilities.</li>
        </ul>
      </section>

      <section id="enforcement">
        <h2>6. Enforcement</h2>
        <p>
          Depending on the severity of a violation, we may issue a warning, temporarily restrict SMS or
          other features, suspend the account, or terminate it entirely. For serious violations — such as
          sending spam at scale, attempting to breach platform security, or illegal content — we may
          suspend access immediately and, where required, report the activity to relevant authorities.
        </p>
      </section>

      <section id="contact">
        <h2>7. Contact us</h2>
        <p>
          To report a suspected violation of this policy, contact{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}