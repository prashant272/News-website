export const HINDI_STATES = [
    { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', english: 'Uttar Pradesh' },
    { name: 'बिहार', slug: 'bihar', english: 'Bihar' },
    { name: 'आंध्र प्रदेश', slug: 'andhra-pradesh', english: 'Andhra Pradesh' },
    { name: 'अरुणाचल प्रदेश', slug: 'arunachal-pradesh', english: 'Arunachal Pradesh' },
    { name: 'असम', slug: 'assam', english: 'Assam' },
    { name: 'गुजरात', slug: 'gujarat', english: 'Gujarat' },
    { name: 'हरियाणा', slug: 'haryana', english: 'Haryana' },
    { name: 'हिमाचल प्रदेश', slug: 'himachal-pradesh', english: 'Himachal Pradesh' },
    { name: 'झारखंड', slug: 'jharkhand', english: 'Jharkhand' },
    { name: 'मध्य प्रदेश', slug: 'madhya-pradesh', english: 'Madhya Pradesh' },
    { name: 'सिक्किम', slug: 'sikkim', english: 'Sikkim' },
    { name: 'उत्तराखंड', slug: 'uttarakhand', english: 'Uttarakhand' },
    { name: 'पश्चिम बंगाल', slug: 'west-bengal', english: 'West Bengal' },
    { name: 'अन्य', slug: 'others', english: 'Others' }
];

export const getStateByHindiName = (name: string) => {
    return HINDI_STATES.find(s => s.name === name);
};

export const getStateBySlug = (slug: string) => {
    return HINDI_STATES.find(s => s.slug === slug);
};
