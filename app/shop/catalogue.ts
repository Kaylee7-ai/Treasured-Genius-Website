export type CatalogueExample = {
  id: string; name: string; slug: string; category: string; categorySlug: string;
  shortDescription: string; description: string; personalisationOptions: string[];
  colours: string[]; visual: 'gift-set' | 'bible'; availability: string;
};
export const catalogueExamples: CatalogueExample[] = [
  { id: 'demo-gift-set', name: 'Personalised Coloured Gift Set', slug: 'personalised-coloured-gift-set',
    category: 'Personalised Gift Sets', categorySlug: 'personalised-gift-sets',
    shortDescription: 'A coordinated gift collection with matching accessories and personalised details.',
    description: 'A presentation gift set shown in blue and purple. The examples include a coordinated drink flask, notebook or organiser, pen and small accessories such as a keyring and USB-style item. Enquire about available combinations, colours and personalisation.',
    personalisationOptions: ['Name or short message', 'Colour selection, subject to availability', 'Ask about the items included in the set'],
    colours: ['Blue', 'Purple'], visual: 'gift-set', availability: 'made_to_order' },
  { id: 'demo-nkjv-bible', name: 'Personalised NKJV Bible', slug: 'personalised-nkjv-bible',
    category: 'Personalised Keepsakes', categorySlug: 'personalised-keepsakes',
    shortDescription: 'NKJV Bibles with decorative covers and personalised names.',
    description: 'A New King James Version Bible example with decorative cover patterns and personalised name lettering. The catalogue images show pink and purple cover options. Enquire to confirm available colours, editions and personalisation.',
    personalisationOptions: ['Personalised name', 'Cover colour, subject to availability', 'Ask about available NKJV editions'],
    colours: ['Pink', 'Purple'], visual: 'bible', availability: 'made_to_order' },
];
export function getCatalogueExample(slug: string) { return catalogueExamples.find((product) => product.slug === slug); }
