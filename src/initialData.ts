/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, Coupon, Banner } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_1',
    name: 'Timepieces',
    slug: 'timepieces',
    description: 'Precision engineering meets timeless elegance. Handcrafted luxury watches.',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'cat_2',
    name: 'Acoustics',
    slug: 'acoustics',
    description: 'Immersive soundscapes from the world\'s finest premium audio manufacturers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'cat_3',
    name: 'Couture & Leather',
    slug: 'couture-leather',
    description: 'Exquisite fine leather accessories and curated luxury designer wear.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'cat_4',
    name: 'Aroma & Lifestyle',
    slug: 'aroma-lifestyle',
    description: 'Sophisticated fragrances, candles, and premium lifestyle enhancements.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // TIMEPIECES (Watches)
  {
    id: 'prod_1',
    name: 'Onyx Chronograph Royal',
    description: 'Sculptical perfection in matte-charcoal ceramic. Features an in-house automatic winding calibre with self-correcting Tourbillon, hand-riveted indices, and an exhibition backing under double-arched sapphire crystal.',
    price: 18450,
    category: 'timepieces',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 5,
    rating: 4.9,
    reviewsCount: 18,
    specs: [
      { name: 'Movement', value: 'Automatic Calibre LX-94 (72-hour reserve)' },
      { name: 'Case Material', value: 'High-tech Vitrified Matte Ceramic' },
      { name: 'Diameter', value: '41.5 mm' },
      { name: 'Water Resistance', value: '100 meters (10 ATM)' },
      { name: 'Clasp Type', value: 'Double Folding Titanium Butterfly' }
    ],
    features: [
      'Handcrafted tourbillon escape gear assembly',
      'Anti-reflective, highly scratch-resistant double sapphire',
      'Exclusive bespoke 18K yellow gold rotor weight',
      'Individually numbered certification signature plate'
    ],
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod_2',
    name: 'Aurelia Minimalist Gold Edition',
    description: 'An ultimate statements piece of understatements elegance. Combining liquid-gold highlights with an ultra-thin stainless-steel chassis, this slim watch whispers luxury rather than shouting.',
    price: 8900,
    category: 'timepieces',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 9,
    rating: 4.8,
    reviewsCount: 12,
    specs: [
      { name: 'Calibre', value: 'Swiss-Made Quartz Cal. SL-12' },
      { name: 'Thickness', value: '5.2 mm (Ultra-Thin)' },
      { name: 'Case Glass', value: 'Hardened Sapphire Crystal' },
      { name: 'Strap', value: 'Genuine Black Alligator Leather' }
    ],
    features: [
      'Solid 18-carat yellow gold bezel ring',
      'Ultra-thin architectural crown dial',
      'Sunburst brushed platinum finish'
    ],
    createdAt: new Date('2026-02-28').toISOString()
  },

  // ACOUSTICS (Audio)
  {
    id: 'prod_3',
    name: 'Ascent Pure Studio Headset',
    description: 'Custom-tuned acoustical fidelity crafted from polished aluminum premium elements and genuine lambskin. Featuring intelligent ultra-wideband active noise-cancellation (ANC) that calibrates to your ear canvas 200 times per second.',
    price: 1450,
    category: 'acoustics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 15,
    rating: 4.9,
    reviewsCount: 34,
    specs: [
      { name: 'Frequency Response', value: '4 Hz - 45,000 Hz' },
      { name: 'Drivers', value: '42mm Custom-Machined Beryllium Diaphragms' },
      { name: 'Battery Life', value: 'Up to 38 hours with active ANC' },
      { name: 'Connection', value: 'Lossless Wireless & USB-C Analog' }
    ],
    features: [
      'Magnetic exchangeable lambskin ear cushion cuffs',
      'Adaptive Spatial Audio with head tracking',
      'Premium dark anodized metallic headband shell'
    ],
    createdAt: new Date('2026-03-01').toISOString()
  },
  {
    id: 'prod_4',
    name: 'Sphere Ambient Acoustic Node',
    description: 'A sculptural, spatial audio dome wrapped in bespoke woven wool that spreads sound evenly throughout any architectural drawing-room space. Elevates residential acoustics into high art.',
    price: 2400,
    category: 'acoustics',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 8,
    rating: 4.7,
    reviewsCount: 8,
    specs: [
      { name: 'Amplifiers', value: '6x Class D Amplifiers (total 450W)' },
      { name: 'Acoustic Structure', value: 'Omnidirectional 360-degree array' },
      { name: 'Smart Protocol', value: 'Apple AirPlay 2, Spotify Connect, Tidal' },
      { name: 'Dimensions', value: '28 cm x 28 cm Sphere' }
    ],
    features: [
      'Bespoke Kvadrat multi-tone wool integration wrapper',
      'Intelligent active room calibration scanner',
      'Solid aluminum touch interface with proximity wake logic'
    ],
    createdAt: new Date('2026-04-10').toISOString()
  },

  // COUTURE & LEATHER
  {
    id: 'prod_5',
    name: 'Monolith Saffiano Carryall',
    description: 'Tailored out of luxury scratchproof Italian Saffiano calf skin. Clean structured frame with hand-painted raw edges, secure bespoke gold mechanical locks, and versatile padded compartmentalization.',
    price: 3600,
    category: 'couture-leather',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 4,
    rating: 5.0,
    reviewsCount: 15,
    specs: [
      { name: 'Outer LeatherType', value: 'Full-Grain Italian Calf Saffiano' },
      { name: 'Hardware', value: 'Solid Brass with 24K Gold Protective Coating' },
      { name: 'Compartments', value: 'Plush Suede lined. Fits up to 16" MacBook Pro' },
      { name: 'Weight', value: '1.2 kg' }
    ],
    features: [
      'Bespoke serial-stamped matching brand key tag',
      'Integrated hidden trackable sleeve slot',
      'Removable executive leather shoulder sling belt'
    ],
    createdAt: new Date('2026-05-02').toISOString()
  },
  {
    id: 'prod_6',
    name: 'Atlas Acetate Aviators',
    description: 'Precision Japanese titanium arms coupled with polished cellulose bio-acetate frame plates. Handcrafted over 200 operational hours in Fukui, offering state-of-the-art glare rejection.',
    price: 680,
    category: 'couture-leather',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 20,
    rating: 4.6,
    reviewsCount: 22,
    specs: [
      { name: 'Frame Material', value: 'Premium Cellulose Acetate & Beta Titanium' },
      { name: 'Lens Tech', value: 'Muted-green polarized with Rear Anti-reflective coat' },
      { name: 'UV Rating', value: '100% UVA/UVB Protection' }
    ],
    features: [
      'Patented frictionless tension hinge rivets',
      'Comfort-molded solid core titanium nose pads',
      'Presented inside luxurious padded velvet leather shell box'
    ],
    createdAt: new Date('2026-05-18').toISOString()
  },

  // AROMA & LIFESTYLE
  {
    id: 'prod_7',
    name: 'Santal Mystique Extrait de Parfum',
    description: 'A deep, enchanting fragrance layered with aged Mysore sandalwood, amber resin chords, premium saffron, and Tunisian orange blossom. Warm, mysterious, intoxicating.',
    price: 320,
    category: 'aroma-lifestyle',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 35,
    rating: 4.8,
    reviewsCount: 45,
    specs: [
      { name: 'Concentration', value: 'Extrait de Parfum (33% raw oil load)' },
      { name: 'Primary Accords', value: 'Sandalwood, Vanilla, Warm Spices, Oud' },
      { name: 'Sillage', value: 'Intense / Long-lasting (12+ Hour Wear)' },
      { name: 'Volume', value: '100 mL' }
    ],
    features: [
      'Hand-numbered heavy polished flint crystal bottle',
      'Magnetic metal cap lined with velvet grip feel',
      'Enclosed in beautiful textured solid black box wrapper'
    ],
    createdAt: new Date('2026-06-01').toISOString()
  },
  {
    id: 'prod_8',
    name: 'Noir Heritage Leather Loafers',
    description: 'Bespoke hand-crafted Goodyear welted loafers. Sculpted from premium full-grain Box Calf skin leather, polished to a subtle gloss, with natural stacked leather heels.',
    price: 950,
    category: 'couture-leather',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 11,
    rating: 4.8,
    reviewsCount: 14,
    specs: [
      { name: 'Last Style', value: 'Elegant semi-chiseled modern shape' },
      { name: 'Sole Construction', value: 'Closed-channel stitch Goodyear welted leather' },
      { name: 'Tanning', value: 'Premium vegetable extract aniline dye' }
    ],
    features: [
      'Reinforced high-grade heel and ankle memory foam',
      'Interlocking golden double-strap saddle accent',
      'Unmatched comfort with structured arch-support insert'
    ],
    createdAt: new Date('2026-06-12').toISOString()
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup_1',
    code: 'LUXURY20',
    type: 'percentage',
    value: 20,
    expirationDate: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    usageCount: 23,
    active: true
  },
  {
    id: 'coup_2',
    code: 'WELCOME1000',
    type: 'fixed',
    value: 1000,
    expirationDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    usageCount: 45,
    active: true
  },
  {
    id: 'coup_3',
    code: 'ROYALTY10',
    type: 'percentage',
    value: 10,
    expirationDate: '2026-08-31T23:59:59Z',
    usageLimit: 100,
    usageCount: 0,
    active: true
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban_1',
    title: 'The Art of Precision',
    subtitle: 'Unveiling the Onyx Chronograph Series. Discover handcrafted tourbillon escapements engineered to absolute perfection.',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1600',
    link: '/shop?category=timepieces',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  },
  {
    id: 'ban_2',
    title: 'Acoustic Mastery Refined',
    subtitle: 'Ascent Pure collection features bespoke spatial nodes and adaptive beryllium diaphragm headsets.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1600',
    link: '/shop?category=acoustics',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  },
  {
    id: 'ban_3',
    title: 'Italian Leather Heritage',
    subtitle: 'Expressed through natural pigments, clean geometry and heavy-duty 24K gold-plated custom locking frames.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1600',
    link: '/shop?category=couture-leather',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  }
];
