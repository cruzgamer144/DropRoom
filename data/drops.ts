export const sampleCurrentDrops = [
  {
    id: 'sample-001',
    name: 'Nike Air Max Paragon',
    slug: 'nike-air-max-paragon',
    description: 'Couro italiano com painéis respiráveis, edição limitada DropRoom.',
    status: 'current',
    price: 320,
    currency: 'EUR',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    drop_date: new Date().toISOString()
  }
];

export const sampleUpcomingDrops = [
  {
    id: 'sample-002',
    name: 'Adidas Consortium Aurum',
    slug: 'adidas-consortium-aurum',
    description: 'Silhueta futurista com detalhes banhados a ouro champanhe.',
    status: 'upcoming',
    price: 280,
    currency: 'EUR',
    image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
    drop_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];
