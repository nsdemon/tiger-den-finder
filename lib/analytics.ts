/**
 * Lightweight site visit analytics (web only).
 * Records: device, OS, location (country/region), visit time, time spent on site.
 * Data is stored in Supabase `site_visits` table. Run the migration SQL in Supabase first.
 *
 * Privacy: Consider showing a consent banner and only calling trackVisit when the user accepts.
 * Check EXPO_PUBLIC_ANALYTICS_ENABLED or a consent cookie if you add one.
 */

import { Platform } from "react-native";
import { supabase } from "./supabase";

const SESSION_KEY = "tigerden_visit_session_id";
const VISITED_AT_KEY = "tigerden_visit_start";
export const CONSENT_KEY = "tigerden_cookie_consent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function parseUserAgent(ua: string): { deviceType: string; os: string } {
  const u = ua || "";
  let deviceType = "Desktop";
  if (/Mobile|Android/i.test(u) && !/iPad|Tablet/i.test(u)) deviceType = "Mobile";
  else if (/iPad|Tablet/i.test(u)) deviceType = "Tablet";

  let os = "Other";
  if (/Android/i.test(u)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(u)) os = "iOS";
  else if (/Windows/i.test(u)) os = "Windows";
  else if (/Mac|Macintosh/i.test(u)) os = "macOS";
  else if (/Linux/i.test(u)) os = "Linux";

  return { deviceType, os };
}

async function getGeo(): Promise<{ country?: string; region?: string; city?: string }> {
  try {
    const res = await fetch("https://ip-api.com/json/?fields=country,regionName,city", {
      method: "GET",
    });
    const data = await res.json();
    if (data && data.country) return { country: data.country, region: data.regionName, city: data.city };
  } catch (_) {
    // ignore (rate limit, adblock, or network)
  }
  return {};
}

export async function trackVisitStart(): Promise<void> {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const sessionId = getSessionId();
  const visitedAt = new Date().toISOString();
  sessionStorage.setItem(VISITED_AT_KEY, visitedAt);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const { deviceType, os } = parseUserAgent(ua);
  const geo = await getGeo();

  await supabase.from("site_visits").insert({
    session_id: sessionId,
    user_agent: ua,
    device_type: deviceType,
    os,
    country: geo.country ?? null,
    region: geo.region ?? null,
    city: geo.city ?? null,
    visited_at: visitedAt,
  });
}

export function trackVisitEnd(): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) return;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    supabase.rpc("record_visit_leave", { p_session_id: sessionId }).catch(() => {});
    return;
  }

  // keepalive so the request can outlive the page (fires on tab close)
  fetch(`${url}/rest/v1/rpc/record_visit_leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ p_session_id: sessionId }),
    keepalive: true,
  }).catch(() => {});
}
