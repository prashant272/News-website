'use client';

import React from 'react';
import styles from '../Components/Common/LegalPage/LegalPage.module.scss';

const TermsAndServices = () => {
    return (
        <div className={styles.legalWrapper}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Terms & Services</h1>
                </header>

                <div className={styles.content}>
                    <p className={styles.intro}>
                        Welcome to <span className={styles.companyName}>Prime Time Research Media Pvt. Ltd.</span> By accessing or using our website and services, you agree to comply with and be bound by the following Terms & Services. Please read them carefully.
                    </p>

                    <h2>1. Introduction</h2>
                    <p>Prime Time Research Media Pvt. Ltd. (“Company,” “we,” “our,” or “us”) provides services including but not limited to:</p>
                    <ul>
                        <li>Award nominations and event management</li>
                        <li>Summits, conferences & exhibitions</li>
                        <li>Research & media services</li>
                        <li>Branding, digital marketing & promotion</li>
                        <li>Consultancy and business networking services</li>
                    </ul>
                    <p>By using our website, submitting forms, or participating in our events, you agree to these Terms.</p>

                    <h2>2. Eligibility</h2>
                    <p>By using our services, you confirm that:</p>
                    <ul>
                        <li>You are at least 18 years of age.</li>
                        <li>All information provided by you is accurate and complete.</li>
                        <li>You have authority to submit nominations or applications on behalf of your organization (if applicable).</li>
                    </ul>

                    <h2>3. Nominations & Awards</h2>
                    <ul>
                        <li>Submission of nomination does not guarantee selection of award.</li>
                        <li>All nominations are subject to review by the internal jury panel.</li>
                        <li>The Company reserves the right to accept, reject, or cancel any nomination without prior notice.</li>
                        <li>Nomination or participation fees (if applicable) are non-refundable unless otherwise stated in writing.</li>
                        <li>Award titles and categories may be modified at the Company’s discretion.</li>
                    </ul>

                    <h2>4. Payments & Fees</h2>
                    <ul>
                        <li>All fees must be paid in full before the event date unless agreed otherwise in writing.</li>
                        <li>Payment once made is non-refundable and non-transferable.</li>
                        <li>The Company is not responsible for any bank or transaction charges.</li>
                    </ul>

                    <h2>5. Event Participation</h2>
                    <ul>
                        <li>The Company reserves the right to change event date, venue, speaker lineup, or program schedule.</li>
                        <li>In case of unforeseen circumstances (natural disaster, government restrictions, force majeure), the event may be rescheduled.</li>
                        <li>The Company shall not be liable for travel, accommodation, or other personal expenses incurred by participants.</li>
                    </ul>

                    <h2>6. Use of Content & Media</h2>
                    <p>By participating in our events or submitting nominations, you agree that:</p>
                    <ul>
                        <li>The Company may use your name, logo, photographs, and videos for promotional purposes.</li>
                        <li>Event photographs and recordings may be published on our website, social media, and marketing materials.</li>
                        <li>You grant us a non-exclusive, royalty-free right to use such materials.</li>
                    </ul>

                    <h2>7. Intellectual Property</h2>
                    <p>All content on this website including text, logos, graphics, event names, and designs are the intellectual property of Prime Time Research Media Pvt. Ltd. and may not be copied, reproduced, or distributed without prior written permission.</p>

                    <h2>8. User Conduct</h2>
                    <p>Users agree not to:</p>
                    <ul>
                        <li>Provide false or misleading information.</li>
                        <li>Misuse the website or attempt unauthorized access.</li>
                        <li>Post defamatory, offensive, or unlawful content.</li>
                    </ul>

                    <h2>9. Limitation of Liability</h2>
                    <p>Prime Time Research Media Pvt. Ltd. shall not be liable for:</p>
                    <ul>
                        <li>Any indirect or consequential loss.</li>
                        <li>Technical errors, website downtime, or service interruptions.</li>
                        <li>Decisions made based on information provided on the website.</li>
                    </ul>

                    <h2>10. Privacy</h2>
                    <p>Your personal information will be handled in accordance with our Privacy Policy. By using our website, you consent to the collection and use of information as described.</p>

                    <h2>11. Cancellation & Refund Policy</h2>
                    <ul>
                        <li>Registration or nomination fees are non-refundable.</li>
                        <li>If the Company cancels an event, participants may receive credit for future events at the Company’s discretion.</li>
                    </ul>

                    <h2>12. Governing Law</h2>
                    <p>These Terms & Services shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Delhi, India.</p>

                    <h2>13. Changes to Terms</h2>
                    <p>Prime Time Research Media Pvt. Ltd. reserves the right to modify these Terms at any time. Updated versions will be posted on the website.</p>

                    <div className={styles.contactBox}>
                        <h2>14. Contact Information</h2>
                        <div className={styles.contactDetails}>
                            <span className={styles.contactItem}><strong>Prime Time Research Media Pvt. Ltd.</strong></span>
                            <span className={styles.contactItem}><strong>Address:</strong> C-31, Nawada Housing Complex, New Delhi-110059</span>
                            <span className={styles.contactItem}><strong>Email:</strong> contact@primetime.news</span>
                            <span className={styles.contactItem}><strong>Phone:</strong> +91 11-69268754, +91 9810 88 2769</span>
                            <span className={styles.contactItem}><strong>Website:</strong> https://primetime.news</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndServices;
