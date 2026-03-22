import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/db';

interface Visit {
  id: string;
  timestamp: string;
  page: string;
  referrer: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  duration: number;
  lat: number | null;
  lng: number | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const visits = readData<Visit>('analytics.json').filter(
    (v) => new Date(v.timestamp) >= cutoff
  );

  // Aggregate stats
  const uniqueIPs = new Set(visits.map((v) => v.ip));
  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.timestamp.startsWith(today));
  const todayUniqueIPs = new Set(todayVisits.map((v) => v.ip));

  // Average time on site
  const withDuration = visits.filter((v) => v.duration > 0);
  const avgDuration = withDuration.length > 0
    ? Math.round(withDuration.reduce((sum, v) => sum + v.duration, 0) / withDuration.length)
    : 0;

  // Page views
  const pages: Record<string, number> = {};
  visits.forEach((v) => { pages[v.page] = (pages[v.page] || 0) + 1; });

  // Browsers
  const browsers: Record<string, number> = {};
  visits.forEach((v) => { browsers[v.browser] = (browsers[v.browser] || 0) + 1; });

  // OS
  const osStat: Record<string, number> = {};
  visits.forEach((v) => { osStat[v.os] = (osStat[v.os] || 0) + 1; });

  // Devices
  const devices: Record<string, number> = {};
  visits.forEach((v) => { devices[v.device] = (devices[v.device] || 0) + 1; });

  // Countries
  const countries: Record<string, number> = {};
  visits.forEach((v) => { countries[v.country] = (countries[v.country] || 0) + 1; });

  // Cities
  const cities: Record<string, number> = {};
  visits.forEach((v) => {
    const key = v.city !== 'Unknown' ? `${v.city}, ${v.country}` : v.country;
    cities[key] = (cities[key] || 0) + 1;
  });

  // Referrers
  const referrers: Record<string, number> = {};
  visits.forEach((v) => {
    if (v.referrer) {
      try {
        const host = new URL(v.referrer).hostname || v.referrer;
        referrers[host] = (referrers[host] || 0) + 1;
      } catch {
        referrers[v.referrer] = (referrers[v.referrer] || 0) + 1;
      }
    }
  });

  // Daily visits (last N days)
  const daily: Record<string, { views: number; unique: number }> = {};
  visits.forEach((v) => {
    const day = v.timestamp.split('T')[0];
    if (!daily[day]) daily[day] = { views: 0, unique: 0 };
    daily[day].views++;
  });
  // Count unique per day
  const dailyIPs: Record<string, Set<string>> = {};
  visits.forEach((v) => {
    const day = v.timestamp.split('T')[0];
    if (!dailyIPs[day]) dailyIPs[day] = new Set();
    dailyIPs[day].add(v.ip);
  });
  Object.keys(dailyIPs).forEach((day) => {
    if (daily[day]) daily[day].unique = dailyIPs[day].size;
  });

  // Recent visits (last 50)
  const recent = visits.slice(-50).reverse();

  // Map locations: aggregate by city with lat/lng
  const locationMap: Record<string, { lat: number; lng: number; city: string; country: string; count: number }> = {};
  visits.forEach((v) => {
    if (v.lat && v.lng) {
      const key = `${v.city}-${v.country}`;
      if (!locationMap[key]) {
        locationMap[key] = { lat: v.lat, lng: v.lng, city: v.city, country: v.country, count: 0 };
      }
      locationMap[key].count++;
    }
  });
  const locations = Object.values(locationMap);

  const sortObj = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 20);

  return NextResponse.json({
    totalViews: visits.length,
    uniqueVisitors: uniqueIPs.size,
    todayViews: todayVisits.length,
    todayUnique: todayUniqueIPs.size,
    avgDuration,
    pages: sortObj(pages),
    browsers: sortObj(browsers),
    os: sortObj(osStat),
    devices: sortObj(devices),
    countries: sortObj(countries),
    cities: sortObj(cities),
    referrers: sortObj(referrers),
    locations,
    daily: Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0])),
    recent,
  });
}
