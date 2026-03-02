import React from 'react';

interface BreadcrumbItem {
    name: string;
    item: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

const BASE_URL = 'https://www.primetimemedia.in';

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
    // Don't render if no items — prevents Google's "Missing itemListElement" error
    if (!items || items.length === 0) return null;

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item.startsWith('http')
                ? item.item
                : `${BASE_URL}${item.item.startsWith('/') ? item.item : '/' + item.item}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default BreadcrumbSchema;
