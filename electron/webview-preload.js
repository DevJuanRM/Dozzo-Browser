// Webview Preload Script (Runs at document-start before any page scripts execute)
(function () {
  try {
    try {
      window.__dozzo_native_log = console.log.bind(console);
    } catch (e) {}

    // Check if current site is Google auth or account page
    const isGoogleAuth = Boolean(
      window.location &&
      (window.location.hostname.includes('google.com') ||
       window.location.hostname.includes('gstatic.com') ||
       window.location.hostname.includes('accounts.google') ||
       window.location.hostname.includes('googleapis.com'))
    );

    // Check if current site is Figma or graphics canvas apps
    const isFigma = Boolean(
      window.location &&
      (window.location.hostname.includes('figma.com') ||
       window.location.hostname.includes('canva.com'))
    );

    // Purge any Node / Electron leakage so Figma and web apps never detect desktop Electron
    try {
      if (typeof window !== 'undefined') {
        try { delete window.process; } catch (_) {}
        try { delete window.Buffer; } catch (_) {}
        try { delete window.global; } catch (_) {}
        try { delete window.setImmediate; } catch (_) {}
        try { delete window.clearImmediate; } catch (_) {}
      }
      if (typeof process !== 'undefined') {
        try {
          process.versions = { ...process.versions };
          delete process.versions.electron;
          delete process.versions.node;
        } catch (_) {}
      }
    } catch (_) {}

    try {
      const electron = require('electron');
      if (electron && electron.ipcRenderer && !isGoogleAuth && !isFigma) {
        Object.defineProperty(window, '__dozzo_ipcRenderer', {
          value: electron.ipcRenderer,
          writable: false,
          enumerable: false,
          configurable: false
        });
      }
    } catch (e) {}

    // Suppress repeated Windows Security "Choose a passkey for google.com" dialog loop
    if (typeof navigator !== 'undefined' && navigator.credentials) {
      try {
        const origCredGet = navigator.credentials.get ? navigator.credentials.get.bind(navigator.credentials) : null;
        if (origCredGet) {
          navigator.credentials.get = function (options) {
            // When pages request conditional mediation (passkey autofill), return null immediately
            // so Windows Security never pops up interrupting the user during login!
            if (options && (options.mediation === 'conditional' || !options.publicKey || !options.publicKey.challenge)) {
              return Promise.resolve(null);
            }
            return origCredGet(options);
          };
        }
      } catch (e) {}
    }

    // Google Chrome BotGuard integrity mock:
    // Real Chrome exposes full window.chrome runtime, app, loadTimes, and csi.
    // In Electron, if this is missing or empty, Google flags it as an embedded app ("Couldn't sign you in").
    if (typeof window !== 'undefined') {
      try {
        if (!window.chrome) {
          window.chrome = {};
        }
        if (!window.chrome.app) {
          window.chrome.app = {
            isInstalled: false,
            InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
            RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
            getDetails: () => null,
            getIsInstalled: () => false,
            installState: () => {}
          };
        }
        if (!window.chrome.runtime) {
          window.chrome.runtime = {
            OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
            OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
            PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
            RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' },
            connect: () => {},
            sendMessage: () => {}
          };
        }
        if (!window.chrome.loadTimes) {
          window.chrome.loadTimes = () => ({
            commitLoadTime: 1,
            connectionInfo: 'http/1.1',
            finishDocumentLoadTime: 1,
            finishLoadTime: 1,
            firstPaintAfterLoadTime: 1,
            firstPaintTime: 1,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'unknown',
            requestTime: 1,
            startLoadTime: 1,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: false,
            wasNpnNegotiated: false
          });
        }
        if (!window.chrome.csi) {
          window.chrome.csi = () => ({ onloadT: 1, pageT: 1, startE: 1, tran: 1 });
        }
      } catch (e) {}

      // Ensure navigator.webdriver is undefined
      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
          configurable: true
        });
      } catch (e) {}

      // Authentic Chrome 133 Client Hints & UserAgent mock (Prevents Slack "Please update your browser" block)
      if (typeof navigator !== 'undefined') {
        try {
          const chromeUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
          const chromeAppVer = '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
          
          Object.defineProperty(navigator, 'userAgent', { get: () => chromeUa, configurable: true });
          Object.defineProperty(navigator, 'appVersion', { get: () => chromeAppVer, configurable: true });
          Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.', configurable: true });
          Object.defineProperty(navigator, 'platform', { get: () => 'Win32', configurable: true });

          const fakeBrands = [
            { brand: 'Not(A:Brand', version: '99' },
            { brand: 'Google Chrome', version: '133' },
            { brand: 'Chromium', version: '133' }
          ];
          const fakeUaData = {
            brands: fakeBrands,
            mobile: false,
            platform: 'Windows',
            getHighEntropyValues: async () => ({
              brands: fakeBrands,
              mobile: false,
              platform: 'Windows',
              platformVersion: '15.0.0',
              architecture: 'x86',
              bitness: '64',
              model: '',
              uaFullVersion: '133.0.0.0',
              fullVersionList: fakeBrands
            })
          };
          Object.defineProperty(navigator, 'userAgentData', {
            get: () => fakeUaData,
            configurable: true
          });
        } catch (e) {}

        // Geolocation Privacy & Censorship Bypass (Returns unrestricted London, UK coords)
        try {
          if (navigator.geolocation) {
            const fakeCoords = {
              latitude: 51.5074,
              longitude: -0.1278,
              accuracy: 25,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            };
            const fakePosition = {
              coords: fakeCoords,
              timestamp: Date.now()
            };
            navigator.geolocation.getCurrentPosition = function (success) {
              if (typeof success === 'function') success(fakePosition);
            };
            navigator.geolocation.watchPosition = function (success) {
              if (typeof success === 'function') success(fakePosition);
              return 1;
            };
          }
        } catch (_) {}
      }
    }

    // Universal Anti-Fingerprinting & Tor-style Shield for all web pages (except Google auth & Figma)
    if (!isGoogleAuth && !isFigma) {
      try {
        // 1. Canvas Fingerprint Randomization (Safe: NEVER force a 2D context on a WebGL/fresh canvas)
        if (typeof HTMLCanvasElement !== 'undefined') {
          const origGetContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            this._dozzoContextType = type;
            return origGetContext.apply(this, [type, ...args]);
          };

          const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function (...args) {
            try {
              // Only alter if the canvas already established a 2D context; never force-create one!
              if (this._dozzoContextType === '2d' && this.width > 16 && this.height > 16) {
                const ctx = origGetContext.apply(this, ['2d']);
                if (ctx) {
                  const imgData = ctx.getImageData(0, 0, 1, 1);
                  imgData.data[0] = (imgData.data[0] ^ 1) & 0xff;
                  ctx.putImageData(imgData, 0, 0);
                }
              }
            } catch (e) {}
            return origToDataURL.apply(this, args);
          };
        }

        // 2. Battery Status API Protection (Prevent tracking device charge signatures)
        if (typeof navigator !== 'undefined' && navigator.getBattery) {
          navigator.getBattery = () =>
            Promise.resolve({
              charging: true,
              chargingTime: 0,
              dischargingTime: Infinity,
              level: 1.0,
              addEventListener: () => {},
              removeEventListener: () => {}
            });
        }

        // 3. WebGL GPU Signature Spoofing (Prevents unmasked GPU hardware fingerprinting)
        if (typeof WebGLRenderingContext !== 'undefined') {
          const origGetParameter = WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function (param) {
            if (param === 37445) return 'Google Inc. (NVIDIA)';
            if (param === 37446) return 'ANGLE (NVIDIA, Direct3D11)';
            return origGetParameter.apply(this, arguments);
          };
        }
      } catch (e) {}
    }

    const isYouTube = Boolean(window.location && window.location.hostname.includes('youtube.com'));

    if (isYouTube) {
      // 1. High-Performance CSS: Hide ad overlays, banners, and promoted tiles cleanly without tampering with JSON or network streams
      const style = document.createElement('style');
      style.id = '__dozzo_early_adblock_css';
      style.textContent = `
        /* Hide ad video frames so no ad screenshots or flashes ever appear */
        #movie_player.ad-showing video,
        #movie_player.ad-interrupting video,
        .video-ads video {
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Hide all YouTube ad modules, badges, overlays, and promoted elements */
        ytd-promoted-sparkles-web-renderer,
        ytd-compact-promoted-video-renderer,
        ytd-promoted-video-renderer,
        ytd-display-ad-renderer,
        ytd-action-companion-ad-renderer,
        ytd-ad-slot-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-statement-banner-renderer,
        ytd-banner-promo-renderer,
        ytd-brand-video-singleton-renderer,
        ytd-video-masthead-ad-v3-renderer,
        ytd-primetime-promo-renderer,
        ytd-sparkles-web-player-renderer,
        ytd-compact-video-renderer:has(ytd-ad-slot-renderer),
        ytd-compact-video-renderer:has([class*="badge-style-type-ad"]),
        ytd-compact-video-renderer:has(.badge-shape-wiz--ad),
        ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
        ytd-rich-item-renderer:has([class*="badge-style-type-ad"]),
        ytd-rich-item-renderer:has(.badge-shape-wiz--ad),
        ytd-reel-shelf-renderer:has(ytd-ad-slot-renderer),
        #panels ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"],
        #masthead-ad,
        #player-ads,
        #companion,
        .video-ads,
        .ytp-ad-module,
        .ytp-ad-player-overlay,
        .ytp-ad-player-overlay-layout,
        .ytp-ad-action-interstitial,
        .ytp-ad-image-overlay,
        .ytp-ad-text-overlay,
        .ytp-ad-badge,
        .ytp-ad-duration-remaining,
        .ytp-ad-overlay-container,
        .ytp-ad-overlay-slot,
        .ytp-ad-message-container,
        .ytp-ad-preview-container,
        yt-mealbar-promo-renderer,
        ytd-thumbnail-overlay-toggle-button-renderer,
        ytd-thumbnail-overlay-toggle-button-shape,
        .ytp-cards-button,
        .ytp-cards-teaser,
        .ytp-suggested-action-badge,
        .ytp-pause-overlay,
        .ytp-ce-element,
        .ytp-ce-covering-overlay,
        tp-yt-paper-dialog:has(#feedback) {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          pointer-events: none !important;
        }

        .ytp-ad-skip-button,
        .ytp-ad-skip-button-modern,
        .ytp-skip-ad-button,
        .ytp-ad-skip-button-slot {
          opacity: 0.001 !important;
          pointer-events: auto !important;
        }
      `;
      const root = document.head || document.documentElement;
      if (root) {
        root.appendChild(style);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.documentElement && !document.getElementById('__dozzo_early_adblock_css')) {
            document.documentElement.appendChild(style);
          }
        });
      }

      // 3. Fast auto-skipper fallback (Without continuous seeking thrash)
      let adWasActive = false;
      let adSkipLocked = false;

      function quickSkip() {
        const player = document.querySelector('#movie_player, .html5-video-player');
        if (!player) return;

        const isAd =
          player.classList.contains('ad-showing') ||
          player.classList.contains('ad-interrupting') ||
          Boolean(player.querySelector('.ytp-ad-player-overlay, .ytp-ad-showing, .ad-showing, .ytp-ad-text, .ytp-ad-module:not(:empty)')) ||
          Boolean(document.querySelector('.video-ads > *'));

        const videos = player.querySelectorAll('video');

        if (isAd) {
          adWasActive = true;

          // Mute and speed up immediately
          videos.forEach((v) => {
            if (!v) return;
            try { v.muted = true; } catch (e) {}
            try { v.playbackRate = 16.0; } catch (e) {}

            if (isFinite(v.duration) && v.duration > 0) {
              try {
                v.currentTime = v.duration;
                v.dispatchEvent(new Event('ended'));
              } catch (e) {}
            } else {
              try {
                v.currentTime = 999999;
              } catch (e) {}
            }
          });

          // Click native skip buttons
          const skipBtns = document.querySelectorAll(
            '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern, .ytp-ad-skip-button-container button, [id^="skip-button"] button, .ytp-ad-overlay-close-button'
          );
          skipBtns.forEach((btn) => {
            try { btn.click(); } catch (e) {}
          });

          // Call YouTube player skip API if available
          if (typeof player.skipAd === 'function') {
            try { player.skipAd(true); } catch (e) {}
          }
        } else {
          if (adWasActive) {
            adWasActive = false;
            videos.forEach((v) => {
              if (!v) return;
              if (v.playbackRate > 2) {
                try { v.playbackRate = 1.0; } catch (e) {}
              }
              try { v.muted = false; } catch (e) {}
              // Resume the main video once if paused
              if (v.paused && isFinite(v.duration) && v.currentTime < v.duration - 0.5) {
                v.play().catch(() => {});
              }
            });
          }
        }
      }

      setInterval(quickSkip, 100);
    }

    // Universal scroll tracking for browser navigation bar
    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentY = window.scrollY || document.documentElement.scrollTop || 0;
            if (currentY > lastScrollY + 30 && currentY > 60) {
              console.log('__DOZZO_SCROLL__:down');
            } else if (currentY < lastScrollY - 20) {
              console.log('__DOZZO_SCROLL__:up');
            }
            lastScrollY = currentY <= 0 ? 0 : currentY;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    // Intercept middle-click (mouse wheel click) & Ctrl/Cmd click on links to open in a new tab inside Dozzo
    window.addEventListener(
      'auxclick',
      (e) => {
        if (e.button === 1) {
          const anchor = e.target && typeof e.target.closest === 'function' ? e.target.closest('a') : null;
          if (anchor && anchor.href && !anchor.href.startsWith('javascript:')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('__DOZZO_OPEN_TAB__:' + anchor.href);
          }
        }
      },
      true
    );

    window.addEventListener(
      'click',
      (e) => {
        if (e.ctrlKey || e.metaKey) {
          const anchor = e.target && typeof e.target.closest === 'function' ? e.target.closest('a') : null;
          if (anchor && anchor.href && !anchor.href.startsWith('javascript:')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('__DOZZO_OPEN_TAB__:' + anchor.href);
          }
        }
      },
      true
    );
  } catch (err) {
    console.error('Error in webview preload:', err);
  }
})();
