"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HindiRashifal.module.scss';
import { X } from 'lucide-react';

import { ZODIACS_HINDI, type ZodiacInfo } from '@/Data/rashifal';

const HindiRashifal: React.FC = () => {
    const [selectedZodiac, setSelectedZodiac] = useState<ZodiacInfo | null>(null);

    return (
        <section className={styles.hindiRashifal}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.headerTitle}>आज का राशिफल</h2>
                    <div className={styles.headerLine}></div>
                </div>

                <div className={styles.zodiacGrid}>
                    {ZODIACS_HINDI.map((z, i) => (
                        <motion.div 
                            key={z.name}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            viewport={{ once: true }}
                            className={styles.zodiacCard}
                            onClick={() => setSelectedZodiac(z)}
                        >
                            <div className={styles.cardInner}>
                                <span className={styles.icon}>{z.icon}</span>
                                <h3 className={styles.name}>{z.name}</h3>
                                <p className={styles.type}>Daily Horoscope</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedZodiac && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.popupOverlay}
                        onClick={() => setSelectedZodiac(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className={styles.popupContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setSelectedZodiac(null)}>
                                <X size={24} />
                            </button>
                            <span className={styles.popupIcon}>{selectedZodiac.icon}</span>
                            <h3 className={styles.popupTitle}>{selectedZodiac.name} राशिफल</h3>
                            <p className={styles.popupText}>{selectedZodiac.desc}</p>
                            <button className={styles.btn} onClick={() => setSelectedZodiac(null)}>धन्यवाद</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default HindiRashifal;
