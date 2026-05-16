import prisma from "@/lib/db";
import { StoreSettings, DEFAULT_SETTINGS } from "./settings-types";

export type { StoreSettings };
export { DEFAULT_SETTINGS };

/**
 * Server-side fetch of the singleton store settings row. Returns sensible
 * defaults if the row hasn't been created yet, so server components can
 * render with real values from the first paint (no client-fetch flash).
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!s) return DEFAULT_SETTINGS;
    return {
      storeName: s.storeName,
      phone: s.phone,
      email: s.email,
      address: s.address,
      hours: s.hours,
      whatsappNumber: s.whatsappNumber,
      freeDeliveryThreshold: s.freeDeliveryThreshold,
      currency: s.currency,
      logo: s.logo,
      logoWidth: s.logoWidth,
      logoHeight: s.logoHeight,
      favicon: s.favicon,
      socialLinks: {
        facebook: s.socialFacebook,
        instagram: s.socialInstagram,
        youtube: s.socialYoutube,
        tiktok: s.socialTiktok,
      },
      homepageTabs: {
        "new-arrivals": s.homepageTabNewArrivals,
        "flash-sale": s.homepageTabFlashSale,
        "most-popular": s.homepageTabMostPopular,
      },
      paymentQRCodes:
        (s.paymentQRCodes as StoreSettings["paymentQRCodes"]) ?? [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
