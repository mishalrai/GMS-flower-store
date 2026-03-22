"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Eye,
  Users,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  MapPin,
  ArrowUpRight,
  X,
} from "lucide-react";

const VisitorMap = dynamic(() => import("@/components/admin/VisitorMap"), { ssr: false });
const MiniMap = dynamic(() => import("@/components/admin/MiniMap"), { ssr: false });

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayUnique: number;
  avgDuration: number;
  pages: [string, number][];
  browsers: [string, number][];
  os: [string, number][];
  devices: [string, number][];
  countries: [string, number][];
  cities: [string, number][];
  referrers: [string, number][];
  locations: { lat: number; lng: number; city: string; country: string; count: number }[];
  daily: [string, { views: number; unique: number }][];
  recent: {
    id: string;
    timestamp: string;
    page: string;
    ip: string;
    country: string;
    city: string;
    browser: string;
    os: string;
    device: string;
    screenWidth: number;
    screenHeight: number;
    language: string;
    referrer: string;
    userAgent: string;
    duration: number;
    lat: number | null;
    lng: number | null;
  }[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function BarList({
  title,
  data,
  total,
}: {
  title: string;
  data: [string, number][];
  total: number;
}) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-2.5">
        {data.map(([name, count]) => (
          <div key={name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 truncate">{name}</span>
              <span className="text-gray-500 text-xs ml-2 flex-shrink-0">
                {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-[#6FB644] h-1.5 rounded-full transition-all"
                style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(secs: number) {
  if (secs < 1) return "—";
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  if (mins < 60) return `${mins}m ${s}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function deviceIcon(device: string) {
  if (device === "Mobile") return Smartphone;
  if (device === "Tablet") return Tablet;
  return Monitor;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedVisitor, setSelectedVisitor] = useState<AnalyticsData["recent"][0] | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxDaily = Math.max(...data.daily.map(([, d]) => d.views), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <div className="flex gap-1">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "bg-[#6FB644] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Views" value={data.totalViews} icon={Eye} color="#6FB644" />
        <StatCard label="Unique Visitors" value={data.uniqueVisitors} icon={Users} color="#3B82F6" />
        <StatCard label="Today Views" value={data.todayViews} icon={ArrowUpRight} color="#10B981" />
        <StatCard label="Today Unique" value={data.todayUnique} icon={Globe} color="#F59E0B" />
        <StatCard label="Avg. Time on Site" value={formatDuration(data.avgDuration)} icon={Clock} color="#8B5CF6" />
      </div>

      {/* Daily Chart */}
      {data.daily.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Daily Traffic
          </h3>
          <div className="flex items-end gap-1 h-40">
            {data.daily.map(([day, stats]) => (
              <div
                key={day}
                className="flex-1 group relative flex flex-col items-center"
              >
                <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day}: {stats.views} views, {stats.unique} unique
                </div>
                <div
                  className="w-full bg-[#6FB644] rounded-t hover:bg-[#5a9636] transition-colors min-h-[2px]"
                  style={{
                    height: `${(stats.views / maxDaily) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{data.daily[0]?.[0]}</span>
            <span>{data.daily[data.daily.length - 1]?.[0]}</span>
          </div>
        </div>
      )}

      {/* Recent Visitors heading */}

      {/* Recent Visitors */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Recent Visitors
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recent.map((v) => {
            const DeviceIcon = deviceIcon(v.device);
            const location = v.city !== "Unknown" ? `${v.city}, ${v.country}` : v.country;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVisitor(v)}
                className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {v.page}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span>{v.browser} / {v.os}</span>
                    <span>{location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {timeAgo(v.timestamp)}
                  </span>
                  {v.duration > 0 && (
                    <span className="text-[10px] text-[#6FB644] font-medium">
                      {formatDuration(v.duration)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedVisitor(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-100">
              <div className="flex items-center justify-between p-5 flex-shrink-0">
                <h3 className="font-semibold text-gray-800">Visitor Details</h3>
                <button onClick={() => setSelectedVisitor(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-5 pt-0 space-y-4 overflow-y-auto">
                {/* Mini Map */}
                {selectedVisitor.lat && selectedVisitor.lng && (
                  <MiniMap
                    lat={selectedVisitor.lat}
                    lng={selectedVisitor.lng}
                    label={
                      selectedVisitor.city !== "Unknown"
                        ? `${selectedVisitor.city}, ${selectedVisitor.country}`
                        : selectedVisitor.country
                    }
                  />
                )}

                {/* Location headline */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6FB644]" />
                  <span className="text-sm font-medium text-gray-800">
                    {selectedVisitor.city !== "Unknown"
                      ? `${selectedVisitor.city}, ${selectedVisitor.country}`
                      : selectedVisitor.country}
                  </span>
                </div>

                {/* Details */}
                {[
                  { label: "Page Visited", value: selectedVisitor.page, icon: Eye },
                  { label: "Date & Time", value: new Date(selectedVisitor.timestamp).toLocaleString(), icon: Clock },
                  { label: "Time on Page", value: selectedVisitor.duration > 0 ? formatDuration(selectedVisitor.duration) : "Still browsing", icon: Clock },
                  { label: "IP Address", value: selectedVisitor.ip, icon: Globe },
                  { label: "Device", value: selectedVisitor.device, icon: deviceIcon(selectedVisitor.device) },
                  { label: "Browser", value: selectedVisitor.browser, icon: Globe },
                  { label: "Operating System", value: selectedVisitor.os, icon: Monitor },
                  { label: "Screen Resolution", value: `${selectedVisitor.screenWidth} x ${selectedVisitor.screenHeight}`, icon: Monitor },
                  { label: "Language", value: selectedVisitor.language, icon: Globe },
                  ...(selectedVisitor.referrer ? [{ label: "Referrer", value: selectedVisitor.referrer, icon: ArrowUpRight }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-gray-800 break-all">{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* User Agent */}
                <div className="pt-3">
                  <p className="text-xs text-gray-400 mb-1">User Agent</p>
                  <p className="text-xs text-gray-500 break-all bg-gray-50 p-3 rounded-lg font-mono">
                    {selectedVisitor.userAgent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
