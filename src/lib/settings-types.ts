export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  freeDeliveryThreshold: number;
  currency: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  favicon: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  homepageTabs: {
    "new-arrivals": boolean;
    "flash-sale": boolean;
    "most-popular": boolean;
  };
  paymentQRCodes: { id: string; label: string; image: string }[];
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "GMS Flower Store",
  phone: "",
  email: "",
  address: "",
  hours: "",
  whatsappNumber: "",
  freeDeliveryThreshold: 2000,
  currency: "NPR",
  logo: "",
  logoWidth: 36,
  logoHeight: 36,
  favicon: "",
  socialLinks: { facebook: "", instagram: "", youtube: "", tiktok: "" },
  homepageTabs: {
    "new-arrivals": true,
    "flash-sale": true,
    "most-popular": true,
  },
  paymentQRCodes: [],
};
