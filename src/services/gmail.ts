import { getAccessToken } from './firebase';
import { FarmState, SeasonReportRecord } from '../simulation/types';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  labelIds: string[];
}

/**
 * Encodes string to base64url format for Gmail API
 */
function base64UrlEncode(str: string): string {
  // UTF-8 friendly base64 encoding
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetch current user's Gmail profile information
 */
export async function getGmailProfile(): Promise<GmailProfile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Gmail');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API Error: ${res.status}`);
  }

  return res.json();
}

/**
 * List messages from user's mailbox with optional search query
 */
export async function listGmailMessages(
  query: string = '',
  maxResults: number = 10
): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Gmail');

  const params = new URLSearchParams();
  if (query) params.set('q', query);
  params.set('maxResults', maxResults.toString());

  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch messages (${listRes.status})`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch metadata details for top messages
  const messagePromises = listData.messages.slice(0, maxResults).map(async (item: { id: string }) => {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();

      let subject = '(No Subject)';
      let from = 'Unknown';
      let to = '';
      let date = '';

      if (msgData.payload?.headers) {
        for (const h of msgData.payload.headers) {
          if (h.name.toLowerCase() === 'subject') subject = h.value;
          if (h.name.toLowerCase() === 'from') from = h.value;
          if (h.name.toLowerCase() === 'to') to = h.value;
          if (h.name.toLowerCase() === 'date') date = h.value;
        }
      }

      return {
        id: msgData.id,
        threadId: msgData.threadId,
        snippet: msgData.snippet || '',
        subject,
        from,
        to,
        date: date ? new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        labelIds: msgData.labelIds || []
      } as GmailMessageSummary;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(messagePromises);
  return results.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Send an email through the user's Gmail account via Gmail API
 */
export async function sendGmailMessage(params: {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<{ id: string; threadId: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Gmail');

  const boundary = `boundary_${Date.now()}`;
  let rawMessage = '';

  if (params.bodyHtml) {
    rawMessage = [
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      '',
      params.bodyText,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      '',
      params.bodyHtml,
      '',
      `--${boundary}--`
    ].join('\r\n');
  } else {
    rawMessage = [
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="UTF-8"`,
      '',
      params.bodyText
    ].join('\r\n');
  }

  const encoded = base64UrlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email (${res.status})`);
  }

  return res.json();
}

/**
 * Generate a rich ecological report email for agricultural extension
 */
export function buildFarmReportEmail(
  farm: FarmState,
  report?: SeasonReportRecord | null
): { subject: string; bodyText: string; bodyHtml: string } {
  const avgSom = (farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length).toFixed(1);
  const avgN = (farm.tiles.reduce((acc, t) => acc + t.nitrogen, 0) / farm.tiles.length).toFixed(1);
  const avgPests = (farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / farm.tiles.length).toFixed(1);
  const avgBeneficials = (farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length).toFixed(1);
  const totalWorms = farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0);

  const subject = `🌱 TerraFarm Audit: Year ${farm.year} ${farm.season} - Soil SOM ${avgSom}% | Water Depth ${farm.groundwaterDepth.toFixed(1)}m`;

  const bodyText = `
TERRAFARM AGRO-ECOLOGICAL SIMULATION REPORT
==================================================
Date: Year ${farm.year}, ${farm.season} (Day ${farm.dayOfSeason}/90)
Financials:
  - Cash Balance: $${farm.cashBalance.toFixed(2)}
  - Season Revenue: $${report ? report.revenue.toFixed(2) : '0.00'}
  - Input Operating Costs: $${report ? report.expenses.toFixed(2) : '0.00'}
  - Organic Certified: ${farm.hasOrganicCertification ? 'YES (+50% premium)' : `NO (${farm.consecutiveChemicalFreeSeasons}/3 clean seasons)`}

Soil & Subsurface Health:
  - Average Soil Organic Matter (SOM): ${avgSom}% (Target: >35%)
  - Available Nitrogen: ${avgN} kg/ha
  - Groundwater Table Depth: ${farm.groundwaterDepth.toFixed(1)} meters
  - Active Earthworm Population: ${totalWorms}

Ecology & Biodiversity:
  - Beneficial Insect Biomass: ${avgBeneficials}/100
  - Pest Pressure: ${avgPests}/100
  - Upgrades Installed: ${[
    farm.unlockedUpgrades.farmPond ? 'Farm Pond' : '',
    farm.unlockedUpgrades.dripSystemInstalled ? 'Drip Irrigation Network' : '',
    farm.unlockedUpgrades.agroforestryBorders ? 'Agroforestry Windbreak' : '',
    farm.unlockedUpgrades.compostPit ? 'Centralized Compost Pit' : '',
    farm.unlockedUpgrades.livestockIntegration ? 'Livestock Integration' : ''
  ].filter(Boolean).join(', ') || 'None yet'}

Extension Advisory Note:
Maintain crop diversity, integrate cover crops during fallow windows, and avoid stubble burning to build long-term carbon stocks.
Generated via TerraFarm Agro-Extension Integration.
`.trim();

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1c1917; border: 1px solid #44403c; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #064e3b, #047857); padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; color: #a7f3d0; font-size: 13px; }
    .content { padding: 24px; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #292524; border: 1px solid #44403c; border-radius: 8px; padding: 12px; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #a8a29e; letter-spacing: 0.5px; }
    .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; color: #34d399; }
    .advisory { background: #14532d; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; margin-top: 20px; font-size: 13px; line-height: 1.5; color: #ecfdf5; }
    .footer { padding: 16px 24px; background: #141210; border-top: 1px solid #292524; text-align: center; font-size: 11px; color: #78716c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌱 TerraFarm Ecological Extension Dispatch</h1>
      <p>Audit Report for Year ${farm.year}, ${farm.season} Season</p>
    </div>
    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Soil Organic Matter</div>
          <div class="stat-val" style="color: #fbbf24;">${avgSom}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Groundwater Table</div>
          <div class="stat-val" style="color: #38bdf8;">${farm.groundwaterDepth.toFixed(1)} m</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cash Balance</div>
          <div class="stat-val" style="color: #10b981;">$${farm.cashBalance.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Earthworm Density</div>
          <div class="stat-val" style="color: #a78bfa;">${totalWorms} biology units</div>
        </div>
      </div>

      <div style="background: #292524; border: 1px solid #44403c; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px; font-size: 13px; color: #e7e5e4;">Ecosystem & Crop Operations</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #d6d3d1; line-height: 1.6;">
          <li><strong>Organic Certification:</strong> ${farm.hasOrganicCertification ? 'Verified (+50% crop premium)' : `${farm.consecutiveChemicalFreeSeasons}/3 clean seasons completed`}</li>
          <li><strong>Beneficial Insect Biomass:</strong> ${avgBeneficials}/100 | Pest Pressure: ${avgPests}/100</li>
          <li><strong>Active Upgrades:</strong> ${[
            farm.unlockedUpgrades.farmPond ? 'Farm Pond' : '',
            farm.unlockedUpgrades.dripSystemInstalled ? 'Drip Irrigation Network' : '',
            farm.unlockedUpgrades.agroforestryBorders ? 'Agroforestry Windbreak' : '',
            farm.unlockedUpgrades.compostPit ? 'Centralized Compost Pit' : '',
            farm.unlockedUpgrades.livestockIntegration ? 'Livestock Integration' : ''
          ].filter(Boolean).join(', ') || 'No capital upgrades yet'}</li>
        </ul>
      </div>

      <div class="advisory">
        <strong>Agronomic Extension Note:</strong><br/>
        ${Number(avgSom) < 20 
          ? 'Soil humus is critically depleted. Implement cover crops (clover/radish) and mulch residue to avert topsoil erosion.' 
          : Number(avgSom) < 35 
          ? 'Soil biological activity is moderate. Rotate with nitrogen-fixing chickpeas or soybeans to bolster natural nutrition.' 
          : 'Outstanding regenerative stewardship! Soil carbon is dense, supporting robust drought resilience and vibrant microbiology.'}
      </div>
    </div>
    <div class="footer">
      Sent via TerraFarm Agro-Ecology Simulation with Gmail API integration.<br/>
      Sustainable farming through ecological outcomes.
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, bodyText, bodyHtml };
}
