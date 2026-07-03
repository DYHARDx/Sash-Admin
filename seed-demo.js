const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', 'Sash-Admin', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) { const key = match[1]; let value = (match[2] || '').trim().replace(/^"|"$/g, ''); process.env[key] = value; }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not found'); process.exit(1); }

const CategorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, image: String, status: { type: String, default: 'active' }, parent: { type: mongoose.Schema.Types.ObjectId, default: null } }, { timestamps: true });
const VariantSchema  = new mongoose.Schema({ size: String, color: String, sku: String, price: Number, stock: { type: Number, default: 20 } });
const ProductSchema  = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, price: Number, compareAtPrice: Number, images: [String], category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, stock: { type: Number, default: 50 }, variants: [VariantSchema], paymentMethods: { type: [String], default: ['UPI', 'COD'] }, status: { type: String, default: 'published' }, ratings: { type: Number, default: 4.2 }, numReviews: { type: Number, default: 12 }, tags: [String] }, { timestamps: true });
const BannerSchema   = new mongoose.Schema({ title: String, subtitle: String, imageUrl: String, linkUrl: String, status: { type: String, default: 'active' }, position: { type: Number, default: 0 } }, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product  = mongoose.models.Product  || mongoose.model('Product', ProductSchema);
const Banner   = mongoose.models.Banner   || mongoose.model('Banner', BannerSchema);

const CATEGORIES = [
  { name: 'Men',         slug: 'men',         image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=60' },
  { name: 'Women',       slug: 'women',       image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60' },
];

const BANNERS = [
  { title: 'New Season',       subtitle: 'Premium Fashion for Everyone', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&auto=format&fit=crop&q=80', linkUrl: '/men',   position: 0 },
  { title: "Women's Edit",     subtitle: 'Curated Style for Her',        imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1400&auto=format&fit=crop&q=80', linkUrl: '/women', position: 1 },
  { title: 'Street Essentials',subtitle: 'Bold. Minimal. Effortless.',   imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&auto=format&fit=crop&q=80', linkUrl: '/sale',  position: 2 },
];

function mkv(colors, sizes, base) {
  const v = [];
  for (const c of colors) for (const s of sizes) v.push({ size: s, color: c, sku: `${base}-${c.toLowerCase().replace(' ','-')}-${s}`, stock: 20 });
  return v;
}

function buildProducts(catMap) {
  const M = catMap['men'], W = catMap['women'], A = catMap['accessories'];
  return [
    // MEN
    { name: 'Classic Oxford Button-Down Shirt',  slug: 'classic-oxford-button-down-shirt',  description: 'A timeless Oxford weave button-down shirt crafted from premium 100% cotton. Perfect for casual or smart-casual occasions.', price: 1499, compareAtPrice: 2199, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'], category: M, stock: 80, tags: ['men','trending','shirts'],   variants: mkv(['White','Sky Blue','Navy'],['S','M','L','XL'],'OXF-SHIRT') },
    { name: 'Slim Fit Stretch Chinos',            slug: 'slim-fit-stretch-chinos',            description: 'Modern slim fit chinos with 2% stretch for all-day comfort. Tapered leg, clean finish.', price: 1999, compareAtPrice: 2799, images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80'], category: M, stock: 60, tags: ['men','best-seller','pants'],  variants: mkv(['Khaki','Olive','Black'],['28','30','32','34'],'SLIM-CHINO') },
    { name: 'Oversized Drop-Shoulder Tee',        slug: 'oversized-drop-shoulder-tee',        description: 'Ultra-soft heavyweight 250gsm cotton tee with a relaxed drop-shoulder silhouette.', price: 899, compareAtPrice: 1299, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'], category: M, stock: 120, tags: ['men','trending','tshirts'], variants: mkv(['Black','White','Grey','Beige'],['S','M','L','XL','XXL'],'DROP-TEE') },
    { name: 'Premium Cotton Polo Shirt',          slug: 'premium-cotton-polo-shirt',          description: 'Classic polo shirt in combed cotton pique fabric. Ribbed collar, two-button placket.', price: 1199, compareAtPrice: 1699, images: ['https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&auto=format&fit=crop&q=80'], category: M, stock: 90, tags: ['men','best-seller','polo'],    variants: mkv(['Navy','White','Forest Green','Burgundy'],['S','M','L','XL'],'COTTON-POLO') },
    { name: 'Relaxed Fit Denim Joggers',          slug: 'relaxed-fit-denim-joggers',          description: 'Soft stretch denim with elastic waistband and cuffed ankles. Street-ready comfort wear.', price: 2299, compareAtPrice: 3199, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&auto=format&fit=crop&q=80'], category: M, stock: 50, tags: ['men','denim','trending'],        variants: mkv(['Indigo','Washed Black'],['S','M','L','XL'],'DENIM-JOG') },
    // WOMEN
    { name: 'Flowy Midi Sundress',                slug: 'flowy-midi-sundress',                description: 'Breezy midi dress in lightweight viscose with floral prints. Adjustable spaghetti straps, smocked bodice.', price: 1799, compareAtPrice: 2499, images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&auto=format&fit=crop&q=80'], category: W, stock: 70, tags: ['women','trending','dresses'],        variants: mkv(['Rose Pink','Sky Blue','Sage Green'],['XS','S','M','L'],'MIDI-DRESS') },
    { name: 'High-Waist Wide Leg Trousers',       slug: 'high-waist-wide-leg-trousers',       description: 'Elegant wide-leg trousers in flowing crepe fabric. High waist with concealed side zip.', price: 2199, compareAtPrice: 2999, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80'], category: W, stock: 55, tags: ['women','best-seller','trousers'],    variants: mkv(['Ivory','Black','Camel'],['XS','S','M','L','XL'],'WIDE-TROUSER') },
    { name: 'Ribbed Crop Knit Top',               slug: 'ribbed-crop-knit-top',               description: 'Fine ribbed knit crop top with round neckline. Soft, stretchy, and perfectly fitted.', price: 899, compareAtPrice: 1299, images: ['https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=600&auto=format&fit=crop&q=80'], category: W, stock: 100, tags: ['women','trending','tops'],            variants: mkv(['Cream','Black','Dusty Rose','Mint'],['XS','S','M','L'],'RIBBED-CROP') },
    { name: 'Linen Blend Blazer',                 slug: 'linen-blend-blazer',                 description: 'Structured linen-blend blazer for effortless summer styling. Single button, notch lapel.', price: 3499, compareAtPrice: 4999, images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&auto=format&fit=crop&q=80'], category: W, stock: 35, tags: ['women','best-seller','blazers'],      variants: mkv(['Off White','Sage','Dusty Pink'],['XS','S','M','L'],'LINEN-BLAZE') },
    { name: 'Pleated Mini Skirt',                 slug: 'pleated-mini-skirt',                 description: 'Flirty pleated mini skirt in lightweight fabric. A playful wardrobe staple.', price: 1199, compareAtPrice: 1799, images: ['https://images.unsplash.com/photo-1583496661160-fb5218afa8a3?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&auto=format&fit=crop&q=80'], category: W, stock: 75, tags: ['women','trending','skirts'],          variants: mkv(['Blush','Navy','Charcoal','Terracotta'],['XS','S','M','L'],'PLEAT-SKIRT') },
    // ACCESSORIES
    { name: 'Genuine Leather Card Wallet',        slug: 'genuine-leather-card-wallet',        description: 'Slim bifold wallet in full-grain leather. 6 card slots, 2 cash pockets. Ages beautifully.', price: 1299, compareAtPrice: 1899, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600&auto=format&fit=crop&q=80'], category: A, stock: 45, tags: ['accessories','trending','wallets'],    variants: [{ size:'One Size', color:'Tan', sku:'WALLET-TAN', stock:15 },{ size:'One Size', color:'Black', sku:'WALLET-BLK', stock:20 },{ size:'One Size', color:'Dark Brown', sku:'WALLET-BRN', stock:10 }] },
    { name: 'Structured Canvas Tote Bag',         slug: 'structured-canvas-tote-bag',         description: 'Heavy-duty canvas tote with reinforced handles and interior pocket. Sustainably made.', price: 1599, compareAtPrice: 2199, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'], category: A, stock: 60, tags: ['accessories','best-seller','bags'],    variants: [{ size:'One Size', color:'Natural', sku:'TOTE-NAT', stock:20 },{ size:'One Size', color:'Black', sku:'TOTE-BLK', stock:25 },{ size:'One Size', color:'Olive', sku:'TOTE-OLV', stock:15 }] },
    { name: 'Woven Straw Sun Hat',                slug: 'woven-straw-sun-hat',                description: 'Hand-woven natural seagrass sun hat with wide brim and black ribbon accent.', price: 799, compareAtPrice: 1199, images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=600&auto=format&fit=crop&q=80'], category: A, stock: 40, tags: ['accessories','trending','hats'],         variants: [{ size:'One Size', color:'Natural Beige', sku:'HAT-NAT', stock:40 }] },
    { name: 'Minimalist Silver Chain Necklace',   slug: 'minimalist-silver-chain-necklace',   description: '925 sterling silver dainty chain necklace (16-18 inch). Hypoallergenic, tarnish-resistant.', price: 699, compareAtPrice: 999, images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80'], category: A, stock: 80, tags: ['accessories','best-seller','jewelry'],   variants: [{ size:'One Size', color:'Silver', sku:'NECKLACE-SLV', stock:50 },{ size:'One Size', color:'Gold', sku:'NECKLACE-GLD', stock:30 }] },
  ];
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📁 Seeding Categories...');
    const catMap = {};
    for (const cat of CATEGORIES) {
      const saved = await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
      catMap[cat.slug] = saved._id;
      console.log(`   ↳ ${cat.name}`);
    }

    console.log('\n🖼  Seeding Banners...');
    for (const b of BANNERS) {
      await Banner.findOneAndUpdate({ title: b.title }, b, { upsert: true, new: true });
      console.log(`   ↳ ${b.title}`);
    }

    console.log('\n👕 Seeding Products...');
    const products = buildProducts(catMap);
    // Delete all existing products to start fresh with correct images
    await Product.deleteMany({});
    console.log('   🗑  Cleared old products');
    for (const prod of products) {
      await Product.create(prod);
      console.log(`   ↳ ${prod.name}`);
    }

    console.log(`\n🎉 Done! ${products.length} products seeded.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
