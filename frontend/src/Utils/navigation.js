/**
 * Localizes a relative URL by appending the 'lang' query parameter.
 * @param {string} href - The original relative URL (e.g. "/Pages/sports")
 * @param {string} lang - The current language code ('en' or 'hi')
 * @returns {string} - The localized URL (e.g. "/Pages/sports?lang=hi")
 */
export const getLocalizedHref = (href, lang) => {
    if (!href || !lang || lang === 'en') return href;
    
    // Do not localize external links
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return href;
    }

    // Split path and existing query/hash
    const [pathPart, ...rest] = href.split(/([?#])/);
    const remainder = rest.join('');
    
    if (remainder.includes('lang=')) return href; // Already localized

    // Append ?lang=hi or &lang=hi
    const connector = remainder.startsWith('?') ? '&' : '?';
    
    // If there is no query/hash yet, just append ?lang=hi
    if (!remainder) {
        return `${pathPart}?lang=${lang}`;
    }

    // If there is a hash but no query, handle it carefully
    if (remainder.startsWith('#')) {
        return `${pathPart}?lang=${lang}${remainder}`;
    }

    // If there is a query, append &lang=hi before the hash if present
    const [query, hash] = remainder.split('#');
    return `${pathPart}${query}&lang=${lang}${hash ? '#' + hash : ''}`;
};
