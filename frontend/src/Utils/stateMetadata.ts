export const HINDI_STATES = [
    { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', english: 'Uttar Pradesh' },
    { name: 'बिहार', slug: 'bihar', english: 'Bihar' },
    { name: 'दिल्ली', slug: 'delhi', english: 'Delhi' },
    { name: 'उत्तराखंड', slug: 'uttarakhand', english: 'Uttarakhand' },
    { name: 'हरियाणा', slug: 'haryana', english: 'Haryana' },
    { name: 'राजस्थान', slug: 'rajasthan', english: 'Rajasthan' },
    { name: 'मध्य प्रदेश', slug: 'madhya-pradesh', english: 'Madhya Pradesh' },
    { name: 'झारखंड', slug: 'jharkhand', english: 'Jharkhand' },
    { name: 'महाराष्ट्र', slug: 'maharashtra', english: 'Maharashtra' },
    { name: 'छत्तीसगढ़', slug: 'chhattisgarh', english: 'Chhattisgarh' }
];

export const getStateByHindiName = (name: string) => {
    return HINDI_STATES.find(s => s.name === name);
};

export const getStateBySlug = (slug: string) => {
    return HINDI_STATES.find(s => s.slug === slug);
};
