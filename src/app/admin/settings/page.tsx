"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Save, Upload, Trash2, Plus, QrCode, LayoutGrid, ImageIcon, Link2, Link2Off } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface PaymentQR {
  id: string;
  label: string;
  image: string;
}

interface HomepageTabs {
  "new-arrivals": boolean;
  "flash-sale": boolean;
  "most-popular": boolean;
}

interface StoreSettings {
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
  socialLinks: { facebook: string; instagram: string; youtube: string; tiktok: string };
  homepageTabs: HomepageTabs;
  paymentQRCodes: PaymentQR[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [lockLogoRatio, setLockLogoRatio] = useState(true);
  const logoNaturalRatio = useRef<number | null>(null);
  const [faviconPickerOpen, setFaviconPickerOpen] = useState(false);
  const [qrPickerOpen, setQrPickerOpen] = useState(false);
  const [generatingFavicon, setGeneratingFavicon] = useState(false);
  const [newQRLabel, setNewQRLabel] = useState("");

  // Capture the logo's natural aspect ratio whenever its URL changes so the
  // ratio-lock toggle has something to work with.
  useEffect(() => {
    if (!settings?.logo) {
      logoNaturalRatio.current = null;
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        logoNaturalRatio.current = img.naturalWidth / img.naturalHeight;
      }
    };
    img.onerror = () => {
      logoNaturalRatio.current = null;
    };
    img.src = settings.logo;
  }, [settings?.logo]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          ...data,
          logo: data.logo || "",
          logoWidth: data.logoWidth ?? 36,
          logoHeight: data.logoHeight ?? 36,
          favicon: data.favicon || "",
          homepageTabs: data.homepageTabs || { "new-arrivals": true, "flash-sale": true, "most-popular": true },
          paymentQRCodes: data.paymentQRCodes || [],
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast("Settings saved successfully");
      } else {
        toast("Failed to save settings", "error");
      }
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQRSelect = (url: string) => {
    if (!settings) return;
    const newQR: PaymentQR = {
      id: Date.now().toString(),
      label: newQRLabel || "Payment QR",
      image: url,
    };
    setSettings({
      ...settings,
      paymentQRCodes: [...settings.paymentQRCodes, newQR],
    });
    setNewQRLabel("");
    setQrPickerOpen(false);
  };

  const removeQR = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      paymentQRCodes: settings.paymentQRCodes.filter((qr) => qr.id !== id),
    });
  };

  const updateQRLabel = (id: string, label: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      paymentQRCodes: settings.paymentQRCodes.map((qr) =>
        qr.id === id ? { ...qr, label } : qr
      ),
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Store Settings</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6"
      >
        {/* Logo Upload */}
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#6FB644]" />
          Store Logo
        </h3>
        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
            {settings.logo ? (
              <>
                <Image
                  src={settings.logo}
                  alt="Store logo"
                  fill
                  className="object-contain p-2"
                  unoptimized={settings.logo.toLowerCase().endsWith(".svg")}
                />
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, logo: "" })}
                  title="Remove logo"
                  className="absolute top-1 right-1 p-1 bg-white rounded shadow-sm hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <button
                type="button"
                onClick={() => setLogoPickerOpen(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {settings.logo ? "Change Logo" : "Upload Logo"}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Supports SVG, PNG, JPG, WebP
              </p>
            </div>
            <div className="flex items-stretch gap-2 max-w-md">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={400}
                    value={settings.logoWidth}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const w = raw === "" ? 0 : Number(raw);
                      const ratio = logoNaturalRatio.current;
                      setSettings({
                        ...settings,
                        logoWidth: w,
                        logoHeight:
                          lockLogoRatio && ratio && w > 0
                            ? Math.round(w / ratio)
                            : settings.logoHeight,
                      });
                    }}
                    onBlur={(e) => {
                      const w = Math.max(8, Number(e.target.value) || 8);
                      const ratio = logoNaturalRatio.current;
                      setSettings({
                        ...settings,
                        logoWidth: w,
                        logoHeight:
                          lockLogoRatio && ratio
                            ? Math.max(8, Math.round(w / ratio))
                            : settings.logoHeight,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={400}
                    value={settings.logoHeight}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const h = raw === "" ? 0 : Number(raw);
                      const ratio = logoNaturalRatio.current;
                      setSettings({
                        ...settings,
                        logoHeight: h,
                        logoWidth:
                          lockLogoRatio && ratio && h > 0
                            ? Math.round(h * ratio)
                            : settings.logoWidth,
                      });
                    }}
                    onBlur={(e) => {
                      const h = Math.max(8, Number(e.target.value) || 8);
                      const ratio = logoNaturalRatio.current;
                      setSettings({
                        ...settings,
                        logoHeight: h,
                        logoWidth:
                          lockLogoRatio && ratio
                            ? Math.max(8, Math.round(h * ratio))
                            : settings.logoWidth,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLockLogoRatio((v) => !v)}
                title={
                  lockLogoRatio
                    ? "Aspect ratio locked — click to unlock"
                    : "Aspect ratio unlocked — click to lock"
                }
                className={`self-end flex items-center justify-center px-3 rounded-lg border transition-colors h-[38px] ${
                  lockLogoRatio
                    ? "bg-[#6FB644]/10 border-[#6FB644] text-[#6FB644]"
                    : "bg-white border-gray-300 text-gray-400 hover:text-gray-600"
                }`}
              >
                {lockLogoRatio ? (
                  <Link2 className="w-4 h-4" />
                ) : (
                  <Link2Off className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {lockLogoRatio
                ? "Auto-ratio is on — editing one dimension updates the other to match the logo's natural proportions."
                : "Auto-ratio is off — width and height adjust independently."}
            </p>
          </div>
        </div>

        {/* Favicon Upload */}
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#6FB644]" />
          Favicon
        </h3>
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
            {settings.favicon ? (
              <Image
                src={settings.favicon}
                alt="Favicon"
                fill
                className="object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFaviconPickerOpen(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {settings.favicon ? "Change Favicon" : "Upload Favicon"}
              </button>
              {settings.favicon && (
                <button
                  type="button"
                  onClick={async () => {
                    setGeneratingFavicon(true);
                    try {
                      const res = await fetch("/api/favicon/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ imageUrl: settings.favicon }),
                      });
                      if (res.ok) {
                        toast("Favicon generated for all devices");
                      } else {
                        toast("Failed to generate favicon", "error");
                      }
                    } catch {
                      toast("Failed to generate favicon", "error");
                    }
                    setGeneratingFavicon(false);
                  }}
                  disabled={generatingFavicon}
                  className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
                >
                  {generatingFavicon ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    "Apply Favicon"
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Upload a square image (PNG, JPG, SVG). Auto-generates icons for all devices.
            </p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mb-4">Store Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Hours
            </label>
            <input
              value={settings.hours}
              onChange={(e) =>
                setSettings({ ...settings, hours: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              value={settings.whatsappNumber}
              onChange={(e) =>
                setSettings({ ...settings, whatsappNumber: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="977XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Free Delivery Threshold (Rs)
            </label>
            <input
              type="number"
              value={settings.freeDeliveryThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  freeDeliveryThreshold: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <input
              value={settings.currency}
              onChange={(e) =>
                setSettings({ ...settings, currency: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mb-4 mt-8">Social Links</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              value={settings.socialLinks.facebook}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    facebook: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              value={settings.socialLinks.instagram}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    instagram: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              value={settings.socialLinks.youtube || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    youtube: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TikTok URL
            </label>
            <input
              value={settings.socialLinks.tiktok || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    tiktok: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="https://tiktok.com/@yourpage"
            />
          </div>
        </div>

        {/* Homepage Tabs */}
        <h3 className="font-semibold text-gray-800 mb-4 mt-8 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-[#6FB644]" />
          Homepage Product Tabs
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Control which product tabs are visible on the homepage.
        </p>
        <div className="space-y-3 mb-2">
          {([
            { key: "new-arrivals" as const, label: "New Arrivals", desc: "Shows latest products sorted by newest first" },
            { key: "flash-sale" as const, label: "Flash Sale", desc: "Shows products currently on sale" },
            { key: "most-popular" as const, label: "Most Popular", desc: "Shows top-rated products" },
          ]).map((tab) => (
            <div
              key={tab.key}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                settings.homepageTabs[tab.key]
                  ? "border-[#6FB644]/30 bg-green-50/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{tab.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tab.desc}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    homepageTabs: {
                      ...settings.homepageTabs,
                      [tab.key]: !settings.homepageTabs[tab.key],
                    },
                  })
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.homepageTabs[tab.key] ? "bg-[#6FB644]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.homepageTabs[tab.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Payment QR Codes */}
        <h3 className="font-semibold text-gray-800 mb-4 mt-8 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-[#6FB644]" />
          Payment QR Codes
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload QR codes for different payment methods (eSewa, Khalti, bank transfer, etc.).
          Customers will see these at checkout to scan and pay.
        </p>

        {/* Existing QR Codes */}
        {settings.paymentQRCodes.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {settings.paymentQRCodes.map((qr) => (
              <div
                key={qr.id}
                className="border border-gray-200 rounded-xl p-3 group"
              >
                <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={qr.image}
                    alt={qr.label}
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeQR(qr.id)}
                    title="Remove QR code"
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
                <input
                  type="text"
                  value={qr.label}
                  onChange={(e) => updateQRLabel(qr.id, e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#6FB644] outline-none"
                  placeholder="Label (e.g. eSewa)"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add New QR */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Label
            </label>
            <input
              type="text"
              value={newQRLabel}
              onChange={(e) => setNewQRLabel(e.target.value)}
              placeholder="e.g. eSewa, Khalti, Bank Transfer"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setQrPickerOpen(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add QR Code
          </button>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#6FB644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={(url) => {
          setSettings({ ...settings!, logo: url });
          setLogoPickerOpen(false);
        }}
      />

      <MediaPickerModal
        isOpen={faviconPickerOpen}
        onClose={() => setFaviconPickerOpen(false)}
        onSelect={(url) => {
          setSettings({ ...settings!, favicon: url });
          setFaviconPickerOpen(false);
        }}
      />

      <MediaPickerModal
        isOpen={qrPickerOpen}
        onClose={() => setQrPickerOpen(false)}
        onSelect={handleQRSelect}
      />
    </div>
  );
}
