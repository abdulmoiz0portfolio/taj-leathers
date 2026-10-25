/* TAJ LEATHERS — product catalog (all original) */
const LEATHER_PRODUCTS = [
  // ---- BELTS ----
  { id: "belt-mailed", name: "Mailed Belt", cat: "belts",
    price: 1600, oldPrice: 2000, img: "light/p6-belt-18-v2.webp",
    gallery: ["light/p6-belt-18-v2.webp","light/p6-belt-19-v2.webp","light/p6-belt-20-v2.webp","light/p6-belt-21-v2.webp"],
    colors: ["Jet Black", "Espresso"], sizes: ["30", "32", "34", "36", "38", "40"],
    badge: "-20%",
    desc: "Premium milled grain leather belt crafted for daily durability and understated elegance. Finished by hand with a solid buckle.",
    details: ["100% genuine milled leather", "Solid alloy buckle, nickel-free", "Hand-burnished edges", "Width: 35mm"] },
  { id: "belt-crocodile", name: "Crocodile Belt", cat: "belts",
    price: 2000, oldPrice: 2500, img: "light/p6-belt-02-v2.webp",
    gallery: ["light/p6-belt-02-v2.webp","light/p6-belt-30-v2.webp","light/p6-belt-09-v2.webp","light/p6-belt-10-v2.webp"],
    colors: ["Black", "Deep Brown"], sizes: ["30", "32", "34", "36", "38", "40"],
    colorImages: { "Black": "light/p6-belt-02-v2.webp", "Deep Brown": "light/p6-belt-09-v2.webp" },
    colorGalleries: { "Black": ["light/p6-belt-02-v2.webp","light/p6-belt-30-v2.webp"], "Deep Brown": ["light/p6-belt-09-v2.webp","light/p6-belt-10-v2.webp"] },
    badge: "-20%",
    desc: "Distinctive textured crocodile emboss on full-grain leather hide. A statement dress belt for formal wear and crisp tailoring.",
    details: ["Full-grain embossed leather", "Polished silver-tone buckle", "Double-stitched keeper loop", "Width: 35mm"] },
  { id: "belt-plain", name: "Plain Belt", cat: "belts",
    price: 1300, oldPrice: 1650, img: "light/p6-belt-07-v2.webp",
    gallery: ["light/p6-belt-07-v2.webp"],
    colors: ["Jet Black"], sizes: ["30", "32", "34", "36", "38", "40"],
    badge: "-21%",
    desc: "Clean, timeless smooth finish plain leather belt. A versatile daily essential that pairs seamlessly with trousers or denim.",
    details: ["Smooth genuine cowhide leather", "Classic matte finish buckle", "Hand-stitched keeper loop", "Width: 35mm"] },
  { id: "belt-lemination", name: "Lemination Belt", cat: "belts",
    price: 1100, oldPrice: 1400, img: "light/p6-belt-27-v2.webp",
    gallery: ["light/p6-belt-27-v2.webp"],
    colors: ["Brown", "Black"], sizes: ["30", "32", "34", "36", "38", "40"],
    colorImages: { "Brown": "light/p6-belt-27-v2.webp", "Black": "light/p6-belt-22-v2.webp" },
    colorGalleries: {
      "Brown": ["light/p6-belt-27-v2.webp"],
      "Black": ["light/p6-belt-22-v2.webp"]
    },
    badge: "-21%",
    desc: "Sleek laminated protective finish that resists scuffs, moisture, and daily wear. Long-lasting, sturdy, and easy to maintain.",
    details: ["Protective laminated leather exterior", "Durable zinc buckle", "Sealed water-resistant edges", "Width: 35mm"] },
  // ---- WALLETS ----
  // ---- WATCH STRAPS ----
  // ---- NEW WALLETS (2026-10-21 batch, price Rs 1,600) ----
  { id: "wallet-onyx", name: "Bifold Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/taj-wallet-1-closed-light.webp",
    gallery: ["light/taj-wallet-1-closed-light.webp","light/taj-wallet-2-open-light.webp","light/taj-wallet-3-flatlay-light.webp","light/p1-open-interior-front-light.webp","light/p1-closed-box-angle1-light.webp"],
    colors: ["Jet Black", "Camel Tan"], sizes: ["Standard"],
    colorImages: { "Jet Black": "light/taj-wallet-1-closed-light.webp", "Camel Tan": "light/camel-top-box-wallet.webp" },
    colorGalleries: { "Jet Black": ["light/taj-wallet-1-closed-light.webp","light/taj-wallet-2-open-light.webp","light/taj-wallet-3-flatlay-light.webp","light/p1-open-interior-front-light.webp","light/p1-closed-box-angle1-light.webp"], "Camel Tan": ["light/camel-top-box-wallet.webp","light/p2-with-box-top-light.webp","light/taj-wallet2-taupe-light.webp","light/p2-open-flat-exterior-2-light.webp"] },
    badge: "-20%",
    desc: "Smooth genuine leather in a clean classic bifold. Slim in the pocket, roomy where it counts — cards, notes, and nothing extra.",
    details: ["Smooth genuine leather exterior", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic slim bifold profile"] },
  { id: "wallet-twotone", name: "Brown & Black Two-Tone Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/p5-30101-light.webp",
    gallery: ["light/p5-30101-light.webp","light/taj-wallet5-twotone-light.webp","light/p5-30059-light.webp","light/p5-30058-light.webp"],
    colors: ["Black", "Dark Brown"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Black meets dark brown pebbled leather — a two-tone bifold with real character. The grain does the talking; the stitching keeps it together for years.",
    details: ["Pebbled genuine leather, two-tone panels", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic bifold fold"] },
  { id: "wallet-stripe", name: "Tone Stripe Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/p4-with-box-light.webp",
    gallery: ["light/p4-with-box-light.webp","light/p4-closed-front-light.webp","light/p4-open-exterior-a-light.webp","light/taj-wallet4-brown-light.webp"],
    colors: ["Brown"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Warm brown pebbled leather with a thin black stripe down the middle — subtle, sharp, and easy to spot in a drawer full of wallets.",
    details: ["Pebbled genuine leather with stripe detail", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic bifold fold"] },

  { id: "wallet-onyx-zip", name: "Bifold Wallet with Inner Zip", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/taj-wallet3-black-box-light.webp",
    gallery: ["light/taj-wallet3-black-box-light.webp","light/p3-closed-vertical-light.webp","light/p3-open-flat-exterior-light.webp"],
    colors: ["Jet Black"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Jet-black bifold with a center zip compartment — coins and small essentials stay put, everything else stays slim.",
    details: ["Smooth genuine leather exterior", "Center zip coin compartment", "Multiple card slots + note compartments", "Classic bifold fold"] },
];


LEATHER_PRODUCTS.forEach(p => p.section = "leathers");
const PRODUCTS = [...LEATHER_PRODUCTS];

const LEATHER_CATS = {
  belts:   { name: "Belts",        tag: "Cut to last a lifetime", img: "light/p6-belt-07-v2.webp" },
  wallets: { name: "Wallets",      tag: "Carry less, keep more",  img: "light/taj-wallet-1-closed-light.webp" },
};
const CATS = { ...LEATHER_CATS };

const SECTIONS = {
  leathers: { name: "TAJ LEATHERS", home: "leathers.html", sub: "Every piece, handcrafted.", cats: LEATHER_CATS },
};

const FREE_SHIP_THRESHOLD = 8000;
