"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Save, Upload, Trash2, Plus, QrCode } from "lucide-react";

interface PaymentQR {
  id: string;
  label: string;
  image: string;
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
  socialLinks: { facebook: string; instagram: string };
  paymentQRCodes: PaymentQR[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [newQRLabel, setNewQRLabel] = useState("");
  const qrFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          ...data,
          paymentQRCodes: data.paymentQRCodes || [],
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingQR(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const newQR: PaymentQR = {
          id: Date.now().toString(),
          label: newQRLabel || "Payment QR",
          image: data.url,
        };
        setSettings({
          ...settings,
          paymentQRCodes: [...settings.paymentQRCodes, newQR],
        });
        setNewQRLabel("");
      }
    } catch {
      // upload failed
    } finally {
      setUploadingQR(false);
      if (qrFileRef.current) qrFileRef.current.value = "";
    }
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

      {saved && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
          Settings saved successfully!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl"
      >
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
            />
          </div>
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
            onClick={() => qrFileRef.current?.click()}
            disabled={uploadingQR}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {uploadingQR ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add QR Code
              </>
            )}
          </button>
          <input
            ref={qrFileRef}
            type="file"
            accept="image/*"
            onChange={handleQRUpload}
            className="hidden"
          />
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
    </div>
  );
}
