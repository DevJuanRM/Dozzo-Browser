// Network-level Ad, Tracker & Onion Privacy Shield Engine
const { session } = require('electron');

let totalBlockedCount = 0;
let isShieldActive = true;

// Military-Grade Privacy Blocklist: Telemetry, Fingerprinters, Trackers & Ad Exchanges
const AD_URL_PATTERNS = [
  // Ad Exchanges & Banner Networks
  '*://*.criteo.com/*',
  '*://*.criteo.net/*',
  '*://*.adnxs.com/*',
  '*://*.rubiconproject.com/*',
  '*://*.taboola.com/*',
  '*://*.outbrain.com/*',
  '*://*.pubmatic.com/*',
  '*://*.openx.net/*',
  '*://*.adroll.com/*',
  '*://*.media.net/*',
  '*://*.amazon-adsystem.com/*',
  '*://*.popads.net/*',
  '*://*.propellerads.com/*',
  '*://*.infolinks.com/*',
  '*://*.smartadserver.com/*',
  '*://*.casalemedia.com/*',
  '*://*.sovrn.com/*',
  '*://*.bidswitch.net/*',
  '*://*.sharethrough.com/*',

  // Analytics, Trackers & Social Pixels
  '*://*.google-analytics.com/*',
  '*://*.analytics.google.com/*',
  '*://*.googletagmanager.com/gtag/js*',
  '*://*.googletagservices.com/*',
  '*://*.facebook.com/tr/*',
  '*://*.connect.facebook.net/*/fbevents.js*',
  '*://*.analytics.tiktok.com/*',
  '*://*.analytics.twitter.com/*',
  '*://*.static.ads-twitter.com/*',
  '*://*.snap.licdn.com/li.lms-analytics/*',
  '*://*.sc-static.net/scevent.min.js*',

  // Session Replay & User Spyware
  '*://*.hotjar.com/*',
  '*://*.clarity.ms/*',
  '*://*.scorecardresearch.com/*',
  '*://*.quantserve.com/*',
  '*://*.quantcount.com/*',
  '*://*.yandex.ru/metrika/*',
  '*://*.mc.yandex.ru/*',
  '*://*.fullstory.com/*',
  '*://*.logrocket.io/*',
  '*://*.logrocket.com/*',
  '*://*.crazyegg.com/*',
  '*://*.mouseflow.com/*',
  '*://*.luckyorange.com/*',
  '*://*.inspectlet.com/*',
  '*://*.heapanalytics.com/*',

  // Telemetry & Diagnostic Data Collection
  '*://*.segment.io/*',
  '*://*.segment.com/*',
  '*://*.amplitude.com/*',
  '*://*.api.amplitude.com/*',
  '*://*.mixpanel.com/*',
  '*://*.api.mixpanel.com/*',
  '*://*.newrelic.com/*',
  '*://*.nr-data.net/*',
  '*://*.browser-intake-datadoghq.com/*',

  // Browser Fingerprinting & Identity Graph Trackers
  '*://*.fpjs.io/*',
  '*://*.api.fpjs.io/*',
  '*://*.fingerprintjs.com/*',
  '*://*.bluekai.com/*',
  '*://*.tags.bluekai.com/*',
  '*://*.crwdcntrl.net/*',
  '*://*.lotame.com/*',
  '*://*.bcp.crwdcntrl.net/*',
  '*://*.demdex.net/*',
  '*://*.rlcdn.com/*',
  '*://*.agkn.com/*'
];

// Tracking query parameters stripped from navigation URLs (URL Trimming / Privacy Cleanser)
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'msclkid',
  'mc_eid',
  'yclid',
  '_hsenc',
  '_hsmi',
  'igshid'
];

function sanitizeTrackingUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    let modified = false;
    for (const param of TRACKING_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.delete(param);
        modified = true;
      }
    }
    return modified ? parsed.toString() : null;
  } catch (e) {
    return null;
  }
}

function setupAdBlocker(targetSession, onBlockedCallback) {
  if (!targetSession) return;

  // 1. Network Interception: Block tracking scripts, ad beacons, and telemetry
  targetSession.webRequest.onBeforeRequest({ urls: AD_URL_PATTERNS }, (details, callback) => {
    if (!isShieldActive) {
      return callback({ cancel: false });
    }

    totalBlockedCount++;
    if (onBlockedCallback) {
      onBlockedCallback(totalBlockedCount, details.url);
    }

    callback({ cancel: true });
  });

  // 2. URL Trimming: Automatically clean tracking parameters (utm_*, fbclid, gclid, etc.)
  targetSession.webRequest.onBeforeRequest((details, callback) => {
    if (!isShieldActive || details.resourceType !== 'mainFrame') {
      return callback({});
    }

    const cleanUrl = sanitizeTrackingUrl(details.url);
    if (cleanUrl && cleanUrl !== details.url) {
      totalBlockedCount++;
      if (onBlockedCallback) {
        onBlockedCallback(totalBlockedCount, details.url);
      }
      return callback({ redirectURL: cleanUrl });
    }

    callback({});
  });

  // 3. Onion Privacy Headers: Anonymize headers, enforce Do-Not-Track & Global Privacy Control
  targetSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (!isShieldActive) {
      return callback({ cancel: false, requestHeaders: details.requestHeaders });
    }

    const headers = { ...details.requestHeaders };

    // Strip invasive tracking tokens
    delete headers['X-Client-Data'];
    delete headers['Sec-CH-UA-Full-Version-List'];
    delete headers['Sec-CH-UA-Model'];
    delete headers['Sec-CH-UA-Platform-Version'];

    // Enforce modern privacy standards
    headers['DNT'] = '1';
    headers['Sec-GPC'] = '1';

    // Referrer Trimming: Never leak full query/path to cross-origin targets
    if (headers['Referer'] && details.url) {
      try {
        const refUrl = new URL(headers['Referer']);
        const reqUrl = new URL(details.url);
        if (refUrl.origin !== reqUrl.origin) {
          headers['Referer'] = refUrl.origin + '/';
        }
      } catch (e) {}
    }

    callback({ cancel: false, requestHeaders: headers });
  });
}

function getBlockedCount() {
  return totalBlockedCount;
}

function resetBlockedCount() {
  totalBlockedCount = 0;
  return totalBlockedCount;
}

function setShieldActive(active) {
  isShieldActive = active;
  return isShieldActive;
}

function getShieldActive() {
  return isShieldActive;
}

module.exports = {
  setupAdBlocker,
  getBlockedCount,
  resetBlockedCount,
  setShieldActive,
  getShieldActive
};
