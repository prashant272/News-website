import type { Metadata } from 'next';
import React from 'react';
import styles from '../Components/Common/LegalPage/LegalPage.module.scss';

export const metadata: Metadata = {
    title: 'Disclaimer',
    description: 'Disclaimer of Prime Time News — India\'s trusted news portal.',
    robots: { index: false, follow: false },
};

const Disclaimer = () => {
    return (
        <div className={styles.legalWrapper}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Disclaimer</h1>
                </header>

                <div className={styles.content}>
                    <p className={styles.intro}>
                        The information provided on the website of <span className={styles.companyName}>Prime Time Research Media Pvt. Ltd.</span> (“Company”, “we”, “our”, or “us”) is for general informational and promotional purposes only. By accessing and using this website, you accept and agree to the terms outlined in this disclaimer.
                    </p>

                    <h2>1. General Information</h2>
                    <p>All content on this website, including text, graphics, images, event details, award information, research materials, and other content, is published in good faith and for general information purposes only. While we strive to keep the information accurate and up to date, Prime Time Research Media Pvt. Ltd. makes no warranties or representations of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of any information on the website.</p>

                    <h2>2. No Professional Advice</h2>
                    <p>The information shared on this website does not constitute legal, financial, medical, business, or professional advice. Visitors are advised to conduct their own research or consult appropriate professionals before making any decisions based on the information available on this website.</p>

                    <h2>3. Awards & Recognition</h2>
                    <p>All awards, recognitions, nominations, rankings, and certifications organized or promoted by Prime Time Research Media Pvt. Ltd. are subject to internal evaluation processes, eligibility criteria, documentation review, and jury decisions. The company reserves the right to accept, reject, or withdraw any nomination at its sole discretion without prior notice. Participation in any event or award program does not guarantee recognition or business outcomes.</p>

                    <h2>4. External Links</h2>
                    <p>Our website may contain links to third-party websites or external platforms for additional information or convenience. We do not control or take responsibility for the content, policies, or practices of any third-party websites.</p>

                    <h2>5. Limitation of Liability</h2>
                    <p>Under no circumstances shall Prime Time Research Media Pvt. Ltd., its directors, employees, partners, or affiliates be liable for any direct, indirect, incidental, consequential, or special loss or damage arising from the use of this website or reliance on any information provided herein.</p>

                    <h2>6. Intellectual Property</h2>
                    <p>All content, logos, trademarks, images, and materials displayed on this website are the property of Prime Time Research Media Pvt. Ltd. unless otherwise stated. Unauthorized use, reproduction, or distribution is strictly prohibited.</p>

                    <h2>7. Changes to Disclaimer</h2>
                    <p>We reserve the right to modify, update, or change this disclaimer at any time without prior notice. Users are encouraged to review this page periodically.</p>

                    <div className={styles.contactBox}>
                        <p>For any clarifications regarding this disclaimer, please contact us at <strong>contact@primetime.news</strong>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Disclaimer;
