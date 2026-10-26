import styles from './privacy.module.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy practices and user data handling policies.'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container">
      <h1 className={styles.title}>Privacy Policy</h1>
      <section className={styles.section}>
        <h2 className={styles.title}>Introduction</h2>
        <p className={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Vehicle Share platform.
        </p>
      </section>
      <section>
        <h2>Data Collection</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Personal identifiers such as name, email address, and phone number.</li>
          <li>Usage data, including pages visited, actions taken, and timestamps.</li>
          <li>Location data when you use location‑based features.</li>
          <li>Payment information for transaction processing.</li>
        </ul>
      </section>
      <section>
        <h2>How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Provide and maintain the service.</li>
          <li>Process bookings and payments.</li>
          <li>Communicate with you about your account and transactions.</li>
          <li>Improve and personalize the platform.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>
      <section>
        <h2>Cookies and Tracking Technologies</h2>
        <p>We use cookies to enhance your experience, remember preferences, and analyse traffic. You can manage cookies through your browser settings.</p>
      </section>
      <section>
        <h2>Third‑Party Services</h2>
        <p>We may share data with trusted third‑party providers for payment processing, analytics, and email delivery. These parties are bound by confidentiality agreements.</p>
      </section>
      <section>
        <h2>User Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal data.</li>
          <li>Object to processing or request data portability.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>To exercise these rights, contact us using the information below.</p>
      </section>
      <section>
        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please email <a href="mailto:privacy@vehicleshare.com">privacy@vehicleshare.com</a>.</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.title}>Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.title}>Children’s Privacy</h2>
        <p>The Service is not intended for children under 13. We do not knowingly collect personal information from children.</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.title}>International Data Transfers</h2>
        <p>If your data is transferred outside your jurisdiction, we ensure appropriate safeguards such as Standard Contractual Clauses.</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.title}>Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. The revised version will be indicated by an updated "Last modified" date.</p>
      </section>
    </main>
  );
}
