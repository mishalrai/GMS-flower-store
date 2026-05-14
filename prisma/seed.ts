import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const DATA_DIR = join(process.cwd(), 'data');

function readJSON<T>(filename: string): T {
  const raw = readFileSync(join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

async function main() {
  console.log('🌱 Seeding database from JSON files...\n');

  // ── Settings ──────────────────────────────────────────────────────────────
  console.log('📋 Seeding settings...');
  const s = readJSON<{
    storeName: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
    whatsappNumber: string;
    freeDeliveryThreshold: number;
    currency: string;
    socialLinks: { facebook: string; instagram: string; youtube: string; tiktok: string };
    homepageTabs: { 'new-arrivals': boolean; 'flash-sale': boolean; 'most-popular': boolean };
    paymentQRCodes: { id: string; label: string; image: string }[];
    logo: string;
    favicon: string;
  }>('settings.json');

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: s.storeName,
      phone: s.phone,
      email: s.email,
      address: s.address,
      hours: s.hours,
      whatsappNumber: s.whatsappNumber,
      freeDeliveryThreshold: s.freeDeliveryThreshold,
      currency: s.currency,
      socialFacebook: s.socialLinks?.facebook ?? '',
      socialInstagram: s.socialLinks?.instagram ?? '',
      socialYoutube: s.socialLinks?.youtube ?? '',
      socialTiktok: s.socialLinks?.tiktok ?? '',
      homepageTabNewArrivals: s.homepageTabs?.['new-arrivals'] ?? true,
      homepageTabFlashSale: s.homepageTabs?.['flash-sale'] ?? true,
      homepageTabMostPopular: s.homepageTabs?.['most-popular'] ?? true,
      paymentQRCodes: s.paymentQRCodes ?? [],
      logo: s.logo ?? '',
      favicon: s.favicon ?? '',
    },
  });
  console.log('  ✓ Settings done');

  // ── Categories ────────────────────────────────────────────────────────────
  console.log('🗂  Seeding categories...');
  const categories = readJSON<{
    id: number;
    name: string;
    slug: string;
    image: string;
    description: string;
  }[]>('categories.json');

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: c.image, description: c.description ?? '' },
      create: { name: c.name, slug: c.slug, image: c.image, description: c.description ?? '' },
    });
  }
  console.log(`  ✓ ${categories.length} categories done`);

  // ── Products ──────────────────────────────────────────────────────────────
  console.log('🌿 Seeding products...');
  const products = readJSON<{
    id: number;
    sku?: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    salePrice?: number;
    costPrice?: number;
    image: string;
    images?: string[];
    description: string;
    size: 'small' | 'medium' | 'large';
    badge?: 'NEW' | 'HOT' | 'SALE' | null;
    rating: number;
    inStock: boolean;
    inventory?: number;
    richText?: string;
    tags?: string[];
  }[]>('products.json');

  // Clear in FK-safe order to allow fresh insert with original IDs
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        price: p.price,
        salePrice: p.salePrice ?? null,
        costPrice: p.costPrice ?? null,
        image: p.image,
        images: p.images ?? [],
        description: p.description,
        size: p.size ?? 'small',
        badge: p.badge ?? null,
        rating: p.rating ?? 0,
        inStock: p.inStock ?? true,
        inventory: p.inventory ?? null,
        richText: p.richText ?? null,
        tags: p.tags ?? [],
        sku: p.sku ?? null,
        category: p.category,
      },
      create: {
        id: p.id,
        sku: p.sku ?? null,
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: p.price,
        salePrice: p.salePrice ?? null,
        costPrice: p.costPrice ?? null,
        image: p.image,
        images: p.images ?? [],
        description: p.description,
        size: p.size ?? 'small',
        badge: p.badge ?? null,
        rating: p.rating ?? 0,
        inStock: p.inStock ?? true,
        inventory: p.inventory ?? null,
        richText: p.richText ?? null,
        tags: p.tags ?? [],
      },
    });
  }
  // Sync the auto-increment sequence to avoid conflicts after seeding
  const maxProductId = Math.max(...products.map((p) => p.id));
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Product"', 'id'), ${maxProductId}, true)`
  );
  console.log(`  ✓ ${products.length} products done`);

  // ── Orders ────────────────────────────────────────────────────────────────
  console.log('📦 Seeding orders...');
  const orders = readJSON<{
    id: string;
    status: string;
    reviewEnabled?: boolean;
    total: number;
    customer: {
      name: string;
      phone: string;
      address: string;
      note?: string;
      location?: { lat: number; lng: number };
    };
    payment?: { method: string; qrLabel?: string; screenshotUrl?: string };
    items: {
      productId: number;
      name: string;
      quantity: number;
      price: number;
      reviewed?: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
  }[]>('orders.json');

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  // Build a set of valid product IDs for FK checks
  const validProductIds = new Set(products.map((p) => p.id));

  for (const o of orders) {
    const status = validStatuses.includes(o.status) ? o.status : 'pending';
    const paymentMethod = o.payment?.method === 'qr' ? 'qr' : 'cod';

    // Filter out items that reference missing products
    const validItems = o.items.filter((item) => {
      const ok = validProductIds.has(item.productId);
      if (!ok) console.warn(`  ⚠ Skipping item in ${o.id} — productId ${item.productId} not found`);
      return ok;
    });

    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        status: status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        reviewEnabled: o.reviewEnabled ?? true,
        total: o.total,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        customerAddress: o.customer.address,
        customerNote: o.customer.note ?? null,
        locationLat: o.customer.location?.lat ?? null,
        locationLng: o.customer.location?.lng ?? null,
        paymentMethod: paymentMethod as 'cod' | 'qr',
        paymentQrLabel: o.payment?.qrLabel ?? null,
        paymentScreenshot: o.payment?.screenshotUrl ?? null,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        items: {
          create: validItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            reviewed: item.reviewed ?? false,
          })),
        },
      },
    });
  }
  console.log(`  ✓ ${orders.length} orders done`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  console.log('⭐ Seeding reviews...');
  const reviews = readJSON<{
    id: string;
    productId: number;
    productName: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    rating: number;
    text: string;
    createdAt: string;
  }[]>('reviews.json');

  const productIds = new Set(products.map((p) => p.id));
  let seededReviews = 0;

  for (const r of reviews) {
    if (!productIds.has(r.productId)) {
      console.warn(`  ⚠ Skipping review ${r.id} — productId ${r.productId} not found`);
      continue;
    }
    await prisma.review.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        orderId: r.orderId,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        rating: r.rating,
        text: r.text,
        createdAt: new Date(r.createdAt),
      },
    });
    seededReviews++;
  }
  console.log(`  ✓ ${seededReviews}/${reviews.length} reviews done`);

  // ── Banners ───────────────────────────────────────────────────────────────
  console.log('🖼  Seeding banners...');
  const banners = readJSON<{
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  }[]>('banners.json');

  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: banners.map((b, i) => ({
      title: b.title,
      subtitle: b.subtitle ?? '',
      buttonText: b.buttonText ?? '',
      buttonLink: b.buttonLink ?? '',
      image: b.image,
      order: i,
    })),
  });
  console.log(`  ✓ ${banners.length} banners done`);

  // ── FAQs ──────────────────────────────────────────────────────────────────
  console.log('❓ Seeding FAQs...');
  const faqs = readJSON<{
    id: number;
    question: string;
    answer: string;
    order: number;
    active: boolean;
  }[]>('faqs.json');

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
      order: f.order ?? 0,
      active: f.active ?? true,
    })),
  });
  console.log(`  ✓ ${faqs.length} FAQs done`);

  // ── Messages ──────────────────────────────────────────────────────────────
  console.log('✉️  Seeding messages...');
  const messages = readJSON<{
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[]>('messages.json');

  for (const m of messages) {
    await prisma.message.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        message: m.message,
        read: m.read ?? false,
        createdAt: new Date(m.createdAt),
      },
    });
  }
  console.log(`  ✓ ${messages.length} messages done`);

  // ── Media ─────────────────────────────────────────────────────────────────
  console.log('🎨 Seeding media...');
  const media = readJSON<{
    id: number;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    type: string;
    alt: string;
    uploadedAt: string;
  }[]>('media.json');

  for (const m of media) {
    await prisma.media.upsert({
      where: { filename: m.filename },
      update: {},
      create: {
        filename: m.filename,
        originalName: m.originalName ?? m.filename,
        url: m.url,
        size: m.size ?? 0,
        type: m.type ?? 'image/jpeg',
        alt: m.alt ?? '',
        uploadedAt: new Date(m.uploadedAt),
      },
    });
  }
  console.log(`  ✓ ${media.length} media files done`);

  // ── Pages (page builder defaults) ────────────────────────────────────────
  console.log('📄 Seeding default pages...');
  const homeBlocks = [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      settings: {
        height: 'md',
        buttons: [{ text: 'Shop Now', link: '/shop' }],
        overlayColor: '#000000',
        overlayOpacity: 40,
        textColor: '#ffffff',
        manual: [
          {
            title: 'Make Your Home Beautiful with Plants',
            subtitle: 'Fresh indoor & outdoor plants grown in our home garden',
            image: '/uploads/1773556212672-cfl640.jpg',
          },
          {
            title: 'Fresh From Our Garden to Your Home',
            subtitle: 'Locally grown plants in Gauradaha, Jhapa, Nepal',
            image: '/uploads/1773556212660-n4qo7a.jpg',
          },
          {
            title: 'Gift a Plant, Gift Life',
            subtitle: 'Perfect plants for every occasion — birthdays, festivals & more',
            image: '/uploads/1773556212663-q5e325.jpg',
          },
        ],
      },
    },
    { id: crypto.randomUUID(), type: 'category-grid', settings: { title: 'Shop by Category' } },
    {
      id: crypto.randomUUID(),
      type: 'featured-products',
      settings: {
        title: 'Featured Products',
        tabs: [
          { label: 'New Arrivals', filter: { mode: 'newest' } },
          { label: 'On Sale', filter: { mode: 'sale' } },
          { label: 'Most Popular', filter: { mode: 'popular' } },
        ],
      },
    },
    { id: crypto.randomUUID(), type: 'trust-banner', settings: {} },
    {
      id: crypto.randomUUID(),
      type: 'testimonials',
      settings: { title: 'What Our Customers Say', source: 'reviews', limit: 6 },
    },
  ];
  const aboutBlocks = [
    {
      id: crypto.randomUUID(),
      type: 'rich-text',
      settings: {
        content:
          '<h2>Our Story</h2><p>GMS Flower Store started as a small passion project in our home garden in Gauradaha, Jhapa, Nepal. What began with a few potted plants has grown into a thriving collection of indoor and outdoor plants that we lovingly nurture and share with our community.</p><p>Every plant in our store is grown with care in our own garden. We believe in sustainable gardening practices and take pride in offering healthy, vibrant plants that are perfectly adapted to the local climate of eastern Nepal.</p><p>Our mission is simple: to make every home and office greener, one plant at a time.</p>',
        align: 'left',
        maxWidth: 'md',
      },
    },
    { id: crypto.randomUUID(), type: 'trust-banner', settings: {} },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      settings: {
        title: 'Visit Us',
        subtitle: 'Gauradaha, Jhapa, Nepal · Open 7:00 AM - 6:00 PM (Sun-Fri)',
        buttonText: 'Contact on WhatsApp',
        buttonLink: 'https://wa.me/9779840036888',
        bgColor: '#5a9636',
        align: 'center',
      },
    },
  ];
  const contactBlocks: never[] = [];

  for (const [slug, title, blocks] of [
    ['home', 'Home', homeBlocks],
    ['about', 'About', aboutBlocks],
    ['contact', 'Contact', contactBlocks],
  ] as const) {
    await prisma.page.upsert({
      where: { slug },
      update: { title, blocks: blocks as object },
      create: { slug, title, blocks: blocks as object, published: true },
    });
  }
  console.log('  ✓ 3 default pages done');

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
