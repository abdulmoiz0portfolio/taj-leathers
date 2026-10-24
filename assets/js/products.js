/* TAJ LEATHERS — product catalog (all original) */
const LEATHER_PRODUCTS = [
  // ---- BELTS ----
  { id: "belt-heritage", name: "Heritage Classic Belt", cat: "belts",
    price: 3499, oldPrice: 4999, img: "light/p6-belt-01-v2.webp",
    colors: ["Jet Black", "Espresso"], sizes: ["30", "32", "34", "36", "38"],
    badge: "-30%",
    desc: "Cut from a single hide of full-grain leather, the Heritage Classic is burnished by hand and finished with a solid brass buckle. It ages beautifully — the more you wear it, the richer it gets.",
    details: ["100% full-grain cowhide leather", "Solid brass buckle, nickel-free", "Hand-burnished edges", "Width: 35mm"] },
  { id: "belt-cognac", name: "Cognac Tan Belt", cat: "belts",
    price: 3299, oldPrice: 4699, img: "light/p6-belt-18-v2.webp",
    colors: ["Cognac", "Honey Tan"], sizes: ["30", "32", "34", "36", "38"],
    badge: "-30%",
    desc: "A warm cognac tan that pairs with everything from denim to dress trousers. Vegetable-tanned for a deep, natural patina that only gets better with time.",
    details: ["Vegetable-tanned full-grain leather", "Antique-finish buckle", "Hand-stitched keeper loop", "Width: 35mm"] },
  { id: "belt-braided", name: "Braided Artisan Belt", cat: "belts",
    price: 3999, oldPrice: 5499, img: "light/p6-belt-27-v2.webp",
    colors: ["Dark Brown", "Black Mix"], sizes: ["32", "34", "36", "38"],
    badge: "-27%",
    desc: "Hand-braided by master artisans from supple leather strips. No holes, no buckle adjustments — the prong weaves through the braid anywhere for a perfect fit, every time.",
    details: ["Hand-braided genuine leather", "Hole-free adjustable fit", "Leather-wrapped buckle", "Width: 32mm"] },
  { id: "belt-saddle", name: "Saddle Stitch Belt", cat: "belts",
    price: 3799, oldPrice: 4899, img: "light/p6-belt-27-v2.webp",
    colors: ["Chestnut", "Dark Brown"], sizes: ["30", "32", "34", "36"],
    badge: "-22%",
    desc: "Two needles, one thread, zero shortcuts. Our saddle-stitched belt is sewn the traditional way — a stitch that will not unravel even if a thread breaks.",
    details: ["Full-grain bridle leather", "Traditional saddle stitching", "Solid roller buckle", "Width: 38mm"] },
  // ---- WALLETS ----
  // ---- WATCH STRAPS ----
  // ---- NEW WALLETS (2026-10-21 batch, price Rs 1,600) ----
  { id: "wallet-onyx", name: "Onyx Black Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/taj-wallet-1-closed-light.webp",
    gallery: ["light/taj-wallet-1-closed-light.webp","light/taj-wallet-2-open-light.webp","light/taj-wallet-3-flatlay-light.webp","light/p1-open-interior-front-light.webp","light/p1-closed-box-angle1-light.webp"],
    colors: ["Jet Black"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Smooth jet-black leather in a clean classic bifold. Slim in the pocket, roomy where it counts — cards, notes, and nothing extra.",
    details: ["Smooth genuine leather exterior", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic slim bifold profile"] },
  { id: "wallet-twotone", name: "Heritage Two-Tone Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/p5-30101-light.webp",
    gallery: ["light/p5-30101-light.webp","light/taj-wallet5-twotone-light.webp","light/p5-30059-light.webp","light/p5-30058-light.webp"],
    colors: ["Black", "Dark Brown"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Black meets dark brown pebbled leather — a two-tone bifold with real character. The grain does the talking; the stitching keeps it together for years.",
    details: ["Pebbled genuine leather, two-tone panels", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic bifold fold"] },
  { id: "wallet-stripe", name: "Cognac Stripe Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/p4-closed-front-light.webp",
    gallery: ["light/p4-closed-front-light.webp","light/p4-open-exterior-a-light.webp","light/p4-with-box-light.webp","light/taj-wallet4-brown-light.webp"],
    colors: ["Brown", "Black"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Warm brown pebbled leather with a thin black stripe down the middle — subtle, sharp, and easy to spot in a drawer full of wallets.",
    details: ["Pebbled genuine leather with stripe detail", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic bifold fold"] },
  { id: "wallet-camel", name: "Camel Classic Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/camel-top-box-wallet.webp",
    gallery: ["light/camel-top-box-wallet.webp","light/p2-with-box-top-light.webp","light/taj-wallet2-taupe-light.webp","light/p2-open-flat-exterior-2-light.webp"],
    colors: ["Camel Tan"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Light warm camel tan in a timeless bifold cut. The colour that gets better with every month of carry.",
    details: ["Genuine leather in warm camel tan", "Multiple card slots + note compartments", "Hand-stitched edges", "Classic bifold fold"] },
  { id: "wallet-onyx-zip", name: "Onyx Zip Wallet", cat: "wallets",
    price: 1600, oldPrice: 2000, img: "light/taj-wallet3-black-box-light.webp",
    gallery: ["light/taj-wallet3-black-box-light.webp","light/p3-box-wallet-diagonal-light.webp","light/p3-closed-vertical-light.webp","light/p3-open-flat-exterior-light.webp"],
    colors: ["Jet Black"], sizes: ["Standard"],
    badge: "-20%",
    desc: "Jet-black bifold with a center zip compartment — coins and small essentials stay put, everything else stays slim.",
    details: ["Smooth genuine leather exterior", "Center zip coin compartment", "Multiple card slots + note compartments", "Classic bifold fold"] },
];


LEATHER_PRODUCTS.forEach(p => p.section = "leathers");
const PRODUCTS = [...LEATHER_PRODUCTS];

const LEATHER_CATS = {
  belts:   { name: "Belts",        tag: "Cut to last a lifetime", img: "light/p6-belt-01-v2.webp" },
  wallets: { name: "Wallets",      tag: "Carry less, keep more",  img: "light/taj-wallet-1-closed-light.webp" },
};
const CATS = { ...LEATHER_CATS };

const SECTIONS = {
  leathers: { name: "TAJ LEATHERS", home: "leathers.html", sub: "Every piece, handcrafted.", cats: LEATHER_CATS },
};

const FREE_SHIP_THRESHOLD = 8000;
