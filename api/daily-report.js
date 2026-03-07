/**
 * Vercel serverless function: daily analytics report email at 11:59 PM CST.
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
 * Optional: RESEND_FROM (e.g. "Tiger Den Finder <reports@yourdomain.com>"), CRON_SECRET.
 */

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const REPORT_EMAIL = 'sudopc@gmail.com';
// 11:59 PM CST = 05:59 UTC next day
const CST_TZ = 'America/Chicago';

function getTodayCSTRange() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: CST_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const [y, m, d] = formatter.format(now).split('-');
  const startCST = new Date(`${y}-${m}-${d}T00:00:00-06:00`);
  const endCST = new Date(`${y}-${m}-${d}T23:59:59.999-06:00`);
  return { start: startCST.toISOString(), end: endCST.toISOString() };
}

module.exports = async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !resendKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or RESEND_API_KEY' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { start, end } = getTodayCSTRange();

  const { data: rows, error } = await supabase
    .from('site_visits')
    .select('device_type, os, country, region, city, visited_at, left_at, duration_seconds')
    .gte('visited_at', start)
    .lte('visited_at', end)
    .order('visited_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const total = rows.length;
  const withDuration = rows.filter((r) => r.duration_seconds != null);
  const avgDuration = withDuration.length
    ? Math.round(withDuration.reduce((a, r) => a + (r.duration_seconds || 0), 0) / withDuration.length)
    : null;

  const byCountry = {};
  const byDevice = {};
  const byOs = {};
  rows.forEach((r) => {
    byCountry[r.country || 'Unknown'] = (byCountry[r.country || 'Unknown'] || 0) + 1;
    byDevice[r.device_type || 'Unknown'] = (byDevice[r.device_type || 'Unknown'] || 0) + 1;
    byOs[r.os || 'Unknown'] = (byOs[r.os || 'Unknown'] || 0) + 1;
  });

  const dateStr = new Date().toLocaleDateString('en-US', { timeZone: CST_TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const html = `
    <h2>Tiger Den Finder – Daily Report (${dateStr})</h2>
    <p><strong>Total visits today (CST):</strong> ${total}</p>
    ${avgDuration != null ? `<p><strong>Avg time on site:</strong> ${avgDuration} sec</p>` : ''}
    <h3>By country</h3>
    <pre>${JSON.stringify(byCountry, null, 2)}</pre>
    <h3>By device</h3>
    <pre>${JSON.stringify(byDevice, null, 2)}</pre>
    <h3>By OS</h3>
    <pre>${JSON.stringify(byOs, null, 2)}</pre>
    <p style="color:#666;font-size:12px;">Report sent at 11:59 PM CST. Data from Supabase site_visits.</p>
  `;

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM || 'Tiger Den Finder <onboarding@resend.dev>';

  const { error: sendError } = await resend.emails.send({
    from,
    to: REPORT_EMAIL,
    subject: `Tiger Den Finder – Daily report (${dateStr}) – ${total} visits`,
    html,
  });

  if (sendError) {
    return res.status(500).json({ error: sendError.message });
  }

  return res.status(200).json({ ok: true, visits: total });
};
