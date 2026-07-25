import LegalLayout from '../../components/LegalLayout'

const sections = [
  { id: 'intro',    label: 'What are cookies' },
  { id: 'types',    label: 'Cookies we use' },
  { id: 'thirdparty', label: 'Third-party cookies' },
  { id: 'manage',   label: 'Managing cookies' },
  { id: 'changes',  label: 'Changes to this policy' },
  { id: 'contact',  label: 'Contact us' },
]

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      tagline="How MinistryOS uses cookies and similar technologies to keep you signed in and the platform running smoothly."
      updated="25 July 2026"
      sections={sections}
    >
      <section id="intro">
        <h2>1. What are cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website or use a web
          application. MinistryOS uses a minimal set of cookies and similar browser storage — we keep this
          list intentionally short.
        </p>
      </section>

      <section id="types">
        <h2>2. Cookies & storage we use</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr><th>Type</th><th>Purpose</th><th>Duration</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Session / login token</td>
                <td>Keeps you signed in to your MinistryOS account so you don't have to log in on every page</td>
                <td>Until you log out or the token expires</td>
              </tr>
              <tr>
                <td>Temporary 2FA token</td>
                <td>Used briefly during two-factor authentication setup and verification</td>
                <td>Short-lived (minutes)</td>
              </tr>
              <tr>
                <td>Preference storage</td>
                <td>Remembers your appearance settings, such as Light/Dark mode and brand colour</td>
                <td>Until changed or cleared</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          These are <strong>strictly necessary</strong> for the platform to function — they are not used for
          advertising or cross-site tracking.
        </p>
      </section>

      <section id="thirdparty">
        <h2>3. Third-party cookies</h2>
        <p>
          MinistryOS does not embed third-party advertising or tracking scripts. If we introduce optional
          analytics in the future to help us understand feature usage, we will update this policy and, where
          required by law, ask for your consent first.
        </p>
      </section>

      <section id="manage">
        <h2>4. Managing cookies</h2>
        <p>
          Most browsers let you view, delete, or block cookies through their settings. Please note that
          blocking the session/login cookie will prevent you from staying signed in to MinistryOS, since it
          is essential to the login flow.
        </p>
      </section>

      <section id="changes">
        <h2>5. Changes to this policy</h2>
        <p>
          We may update this Cookie Policy as MinistryOS evolves. Material changes will be posted on this
          page with an updated "Last updated" date.
        </p>
      </section>

      <section id="contact">
        <h2>6. Contact us</h2>
        <p>
          Questions about cookies can be sent to{' '}
          <a href="mailto:emcontrol01@gmail.com">emcontrol01@gmail.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}