'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './WhatsAppButton.module.scss';

const WhatsAppButton = () => {
    const channelUrl = "https://whatsapp.com/channel/0029Vb314OB05MUbS6xEvU3g";

    return (
        <div className={styles.whatsappContainer}>
            <span className={styles.tooltip}>Join our Channel</span>
            <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
                aria-label="Join our WhatsApp Channel"
            >
                <FaWhatsapp size={32} />
            </a>
        </div>
    );
};

export default WhatsAppButton;
