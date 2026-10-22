// Network-level Ad and Tracker blocker engine
const { session } = require('electron');

let totalBlockedCount = 0;
let isShieldActive = true;

// Patterns for third-party ads, trackers, analytics, and telemetry
// Note: YouTube internal playback endpoints are skipped from ERR_BLOCKED_BY_CLIENT
// to prevent YouTube's videoplayfailed402 anti-adblock detection.
const AD_URL_PATTERNS = [
  // Third-party Ad exchanges & banner networks
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
  // Trackers, Spyware and Telemetry
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

  // Strip tracking headers to enhance user privacy
  targetSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.requestHeaders['X-Client-Data']) {
      delete details.requestHeaders['X-Client-Data'];
    }
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
