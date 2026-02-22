import type { Metadata } from 'next';
import React from 'react';
import styles from '../Components/Common/LegalPage/LegalPage.module.scss';

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'Cookie Policy of Prime Time News — India\'s trusted news portal. Learn how we use cookies.',
    robots: { index: false, follow: false },
};

const CookiePolicy = () => {
    return (
        <div className={styles.legalWrapper}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Cookie Policy</h1>
                </header>

                <div className={styles.content}>
                    <p className={styles.intro}>
                        <span className={styles.companyName}>Prime Time Research Media Pvt. Ltd.</span> (“Prime Time,” “we,” “our,” or “us”) uses cookies and similar technologies on our website to enhance user experience, analyze website performance, and provide relevant information about our services, events, awards, and media initiatives.
                    </p>

                    <p>This Cookies Policy explains what cookies are, how we use them, and your choices regarding their use.</p>

                    <h2>1. What Are Cookies?</h2>
                    <p>Cookies are small text files that are stored on your computer, smartphone, or other device when you visit a website. They help websites function properly, improve efficiency, and provide analytical information to website owners.</p>
                    <p>Cookies may be:</p>
                    <ul>
                        <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser.</li>
                        <li><strong>Persistent Cookies:</strong> Stored on your device for a set period or until manually deleted.</li>
                    </ul>

                    <h2>2. How We Use Cookies</h2>
                    <p>We use cookies for the following purposes:</p>

                    <h3>a) Essential Cookies</h3>
                    <p>These cookies are necessary for the website to function properly. They enable core features such as:</p>
                    <ul>
                        <li>Page navigation</li>
                        <li>Secure form submission</li>
                        <li>Access to secure areas of the website</li>
                    </ul>

                    <h3>b) Performance & Analytics Cookies</h3>
                    <p>These cookies help us understand how visitors interact with our website by collecting anonymous information such as:</p>
                    <ul>
                        <li>Number of visitors</li>
                        <li>Pages visited</li>
                        <li>Time spent on the website</li>
                        <li>Traffic sources</li>
                    </ul>

                    <h3>c) Functional Cookies</h3>
                    <p>These cookies allow the website to remember choices you make, such as:</p>
                    <ul>
                        <li>Language preferences</li>
                        <li>Region selection</li>
                        <li>Form autofill data</li>
                    </ul>

                    <h3>d) Marketing & Advertising Cookies</h3>
                    <p>These cookies may be used to:</p>
                    <ul>
                        <li>Deliver relevant promotional content</li>
                        <li>Measure the effectiveness of marketing campaigns</li>
                        <li>Show advertisements based on your interests</li>
                    </ul>

                    <h2>3. Third-Party Cookies</h2>
                    <p>We may use trusted third-party services such as:</p>
                    <ul>
                        <li>Google Analytics</li>
                        <li>Social media plugins (Facebook, Instagram, LinkedIn, etc.)</li>
                        <li>Email marketing tools</li>
                    </ul>
                    <p>These third parties may set cookies on your device in accordance with their own privacy policies.</p>

                    <h2>4. Managing Cookies</h2>
                    <p>You have the right to control and manage cookies. You can:</p>
                    <ul>
                        <li>Modify your browser settings to block or delete cookies.</li>
                        <li>Set your browser to notify you when cookies are being used.</li>
                        <li>Disable specific categories of cookies through our cookie consent banner.</li>
                    </ul>
                    <p>Please note that disabling certain cookies may affect website functionality.</p>

                    <h2>5. Data Protection</h2>
                    <p>Any personal information collected through cookies will be processed in accordance with our Privacy Policy and applicable data protection laws.</p>

                    <h2>6. Updates to This Policy</h2>
                    <p>Prime Time Research Media Pvt. Ltd. reserves the right to update this Cookies Policy at any time. Changes will be posted on this page with an updated effective date.</p>

                    <div className={styles.contactBox}>
                        <h2>7. Contact Us</h2>
                        <p>If you have any questions about this Cookies Policy, please contact us:</p>
                        <div className={styles.contactDetails}>
                            <span className={styles.contactItem}><strong>Prime Time Research Media Pvt. Ltd.</strong></span>
                            <span className={styles.contactItem}><strong>Address:</strong> C-31, Nawada Housing Complex, New Delhi-110059</span>
                            <span className={styles.contactItem}><strong>Email:</strong> contact@primetime.news</span>
                            <span className={styles.contactItem}><strong>Phone:</strong> +91 11-69268754</span>
                            <span className={styles.contactItem}><strong>Website:</strong> https://primetime.news</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
