// Network-level Ad and Tracker blocker engine
const { session } = require('electron');

let totalBlockedCount = 0;
let isShieldActive = true;

// Patterns for ads, trackers, analytics, telemetry, and YouTube ad endpoints
const AD_URL_PATTERNS = [
  // Google / YouTube Ad Networks
  '*://*.doubleclick.net/*',
  '*://*.googlesyndication.com/*',
  '*://*.googleadservices.com/*',
  '*://*.adservice.google.com/*',
  '*://ad.doubleclick.net/*',
  '*://*.youtube.com/api/stats/ads*',
  '*://*.youtube.com/pagead/*',
  '*://*.youtube.com/ptracking*',
  '*://*.youtube.com/ad_companion*',
  '*://*.youtube.com/get_midroll_info*',
  '*://*.youtube.com/youtubei/v1/att/get*',
  // Third-party Ad exchanges
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
  // Trackers and Telemetry
  '*://*.google-analytics.com/*',
  '*://*.analytics.google.com/*',
  '*://*.googletagmanager.com/gtag/js*',
  '*://*.facebook.com/tr/*',
  '*://*.connect.facebook.net/*/fbevents.js*',
  '*://*.hotjar.com/*',
  '*://*.clarity.ms/*',
  '*://*.scorecardresearch.com/*',
  '*://*.quantserve.com/*',
  '*://*.yandex.ru/metrika/*'
];

function setupAdBlocker(targetSession, onBlockedCallback) {
  if (!targetSession) return;

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

  // Strip tracking headers like client-hints or referrer to enhance privacy
  targetSession.webRequest.onBeforeSendHeaders((details, callback) => {
    delete details.requestHeaders['X-Client-Data'];
    callback({ cancel: false, requestHeaders: details.requestHeaders });
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
