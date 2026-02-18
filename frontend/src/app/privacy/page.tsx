'use client';

import React from 'react';
import styles from '../Components/Common/LegalPage/LegalPage.module.scss';

const PrivacyPolicy = () => {
    return (
        <div className={styles.legalWrapper}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Privacy Policy</h1>
                </header>

                <div className={styles.content}>
                    <p className={styles.intro}>
                        <span className={styles.companyName}>Prime Time Research Media Pvt. Ltd.</span> (“Company”, “we”, “our”, or “us”) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, participate in our events, submit nominations, or use our services.
                    </p>

                    <p>By accessing or using our website, you agree to the terms of this Privacy Policy.</p>

                    <h2>1. Information We Collect</h2>
                    <p>We may collect the following types of information:</p>

                    <h3>a) Personal Information</h3>
                    <ul>
                        <li>Full Name</li>
                        <li>Contact Number</li>
                        <li>Email Address</li>
                        <li>Organization/Company Name</li>
                        <li>Designation</li>
                        <li>Address</li>
                        <li>Payment Details (for event registrations or nominations)</li>
                    </ul>

                    <h3>b) Non-Personal Information</h3>
                    <ul>
                        <li>IP address</li>
                        <li>Browser type</li>
                        <li>Device information</li>
                        <li>Pages visited</li>
                        <li>Cookies and usage data</li>
                    </ul>

                    <h3>c) Event & Nomination Information</h3>
                    <p>When you submit forms for awards, summits, or events, we may collect:</p>
                    <ul>
                        <li>Professional achievements</li>
                        <li>Company profile details</li>
                        <li>Supporting documents</li>
                        <li>Photographs or videos</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the collected information for:</p>
                    <ul>
                        <li>Processing award nominations and registrations</li>
                        <li>Communication regarding events, summits, and awards</li>
                        <li>Issuing certificates, confirmations, and invoices</li>
                        <li>Marketing and promotional communication</li>
                        <li>Improving website performance and user experience</li>
                        <li>Compliance with legal obligations</li>
                    </ul>
                    <p>We may also use photographs, videos, and event highlights for promotional purposes unless you request otherwise.</p>

                    <h2>3. Sharing of Information</h2>
                    <p>We do not sell, rent, or trade your personal information.</p>
                    <p>However, we may share information with:</p>
                    <ul>
                        <li>Event partners and sponsors (where required)</li>
                        <li>Payment gateway providers</li>
                        <li>Service providers assisting in website management</li>
                        <li>Legal authorities if required by law</li>
                    </ul>
                    <p>All third-party service providers are required to protect your data.</p>

                    <h2>4. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to safeguard your personal information against unauthorized access, misuse, alteration, or disclosure.</p>
                    <p>However, no online transmission is completely secure, and we cannot guarantee absolute security.</p>

                    <h2>5. Cookies Policy</h2>
                    <p>Our website may use cookies to:</p>
                    <ul>
                        <li>Enhance user experience</li>
                        <li>Analyze website traffic</li>
                        <li>Improve website functionality</li>
                    </ul>
                    <p>You can disable cookies through your browser settings, though some features may not function properly.</p>

                    <h2>6. Third-Party Links</h2>
                    <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external websites.</p>

                    <h2>7. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal information</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your data (subject to legal obligations)</li>
                        <li>Opt-out of marketing communications</li>
                    </ul>

                    <h2>8. Children’s Privacy</h2>
                    <p>Our website and services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children.</p>

                    <h2>9. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>

                    <div className={styles.contactBox}>
                        <h2>10. Contact Us</h2>
                        <p>If you have any questions regarding this Privacy Policy, please contact:</p>
                        <div className={styles.contactDetails}>
                            <span className={styles.contactItem}><strong>Prime Time Research Media Pvt. Ltd.</strong></span>
                            <span className={styles.contactItem}><strong>Email:</strong> contact@primetime.news</span>
                            <span className={styles.contactItem}><strong>Phone:</strong> +91 11-69268754</span>
                            <span className={styles.contactItem}><strong>Registered Office:</strong> C-31, Nawada Housing Complex, New Delhi-110059</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
