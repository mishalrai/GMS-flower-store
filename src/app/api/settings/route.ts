import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Transform flat DB row → nested frontend format
function formatSettings(s: Awaited<ReturnType<typeof prisma.settings.findUnique>>) {
  if (!s) return null;
  return {
    storeName: s.storeName,
    phone: s.phone,
    email: s.email,
    address: s.address,
    hours: s.hours,
    whatsappNumber: s.whatsappNumber,
    freeDeliveryThreshold: s.freeDeliveryThreshold,
    currency: s.currency,
    socialLinks: {
      facebook: s.socialFacebook,
      instagram: s.socialInstagram,
      youtube: s.socialYoutube,
      tiktok: s.socialTiktok,
    },
    homepageTabs: {
      'new-arrivals': s.homepageTabNewArrivals,
      'flash-sale': s.homepageTabFlashSale,
      'most-popular': s.homepageTabMostPopular,
    },
    paymentQRCodes: s.paymentQRCodes,
    logo: s.logo,
    logoWidth: s.logoWidth,
    logoHeight: s.logoHeight,
    favicon: s.favicon,
  };
}

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    // Auto-create defaults if not seeded yet
    const defaults = await prisma.settings.create({ data: { id: 1 } });
    return NextResponse.json(formatSettings(defaults));
  }
  return NextResponse.json(formatSettings(settings));
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      ...(body.storeName !== undefined && { storeName: body.storeName }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.hours !== undefined && { hours: body.hours }),
      ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber }),
      ...(body.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: body.freeDeliveryThreshold }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.socialLinks?.facebook !== undefined && { socialFacebook: body.socialLinks.facebook }),
      ...(body.socialLinks?.instagram !== undefined && { socialInstagram: body.socialLinks.instagram }),
      ...(body.socialLinks?.youtube !== undefined && { socialYoutube: body.socialLinks.youtube }),
      ...(body.socialLinks?.tiktok !== undefined && { socialTiktok: body.socialLinks.tiktok }),
      ...(body.homepageTabs?.['new-arrivals'] !== undefined && { homepageTabNewArrivals: body.homepageTabs['new-arrivals'] }),
      ...(body.homepageTabs?.['flash-sale'] !== undefined && { homepageTabFlashSale: body.homepageTabs['flash-sale'] }),
      ...(body.homepageTabs?.['most-popular'] !== undefined && { homepageTabMostPopular: body.homepageTabs['most-popular'] }),
      ...(body.paymentQRCodes !== undefined && { paymentQRCodes: body.paymentQRCodes }),
      ...(body.logo !== undefined && { logo: body.logo }),
      ...(body.logoWidth !== undefined && { logoWidth: Number(body.logoWidth) }),
      ...(body.logoHeight !== undefined && { logoHeight: Number(body.logoHeight) }),
      ...(body.favicon !== undefined && { favicon: body.favicon }),
    },
    create: { id: 1 },
  });

  return NextResponse.json(formatSettings(settings));
}
