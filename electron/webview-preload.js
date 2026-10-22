// Webview Preload Script (Runs at document-start before any page scripts execute)
(function () {
  try {
    try {
      window.__dozzo_native_log = console.log.bind(console);
    } catch (e) {}

    try {
      const electron = require('electron');
      if (electron && electron.ipcRenderer) {
        window.__dozzo_ipcRenderer = electron.ipcRenderer;
      }
    } catch (e) {}

    // Universal Anti-Fingerprinting & Tor-style Shield for all web pages
    try {
      // 1. Canvas Fingerprint Randomization
      if (typeof HTMLCanvasElement !== 'undefined') {
        const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (...args) {
          try {
            const ctx = this.getContext('2d');
            if (ctx && this.width > 16 && this.height > 16) {
              const imgData = ctx.getImageData(0, 0, 1, 1);
              imgData.data[0] = (imgData.data[0] ^ 1) & 0xff;
              ctx.putImageData(imgData, 0, 0);
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

    const isYouTube = Boolean(window.location && window.location.hostname.includes('youtube.com'));

    if (isYouTube) {
      // 1. Core script to run inside the guest page's MAIN WORLD context
      function runMainWorldAdblocker() {
        if (window.__dozzo_main_adblock_injected) return;
        window.__dozzo_main_adblock_injected = true;

        function pruneAds(obj) {
          if (!obj || typeof obj !== 'object') return obj;
          try {
            if (Array.isArray(obj)) {
              for (let i = 0; i < obj.length; i++) {
                pruneAds(obj[i]);
              }
              return obj;
            }

            // Prune ad placement lists
            if (obj.adPlacements) obj.adPlacements = [];
            if (obj.adSlots) obj.adSlots = [];
            if (obj.playerAds) obj.playerAds = [];
            delete obj.adBreakHeartbeatParams;
            delete obj.adParams;
            delete obj.adBreakParams;

            // Recurse into nested playerResponse
            if (obj.playerResponse) {
              pruneAds(obj.playerResponse);
            }
          } catch (e) {}
          return obj;
        }

        // A. Hook JSON.parse so any parsed player payload has ads stripped before reaching YouTube
        try {
          const origJSONParse = JSON.parse;
          JSON.parse = function (...args) {
            const res = origJSONParse.apply(this, args);
            if (res && typeof res === 'object') {
              pruneAds(res);
            }
            return res;
          };
        } catch (e) {}

        // B. Hook window.ytInitialPlayerResponse
        try {
          let storedInitial = window.ytInitialPlayerResponse;
          Object.defineProperty(window, 'ytInitialPlayerResponse', {
            get() {
              return pruneAds(storedInitial);
            },
            set(val) {
              storedInitial = pruneAds(val);
            },
            configurable: true
          });
        } catch (e) {}

        // C. Hook window.ytInitialData
        try {
          let storedData = window.ytInitialData;
          Object.defineProperty(window, 'ytInitialData', {
            get() {
              return pruneAds(storedData);
            },
            set(val) {
              storedData = pruneAds(val);
            },
            configurable: true
          });
        } catch (e) {}

        // D. Hook Response.prototype.json for fetch calls
        try {
          if (typeof Response !== 'undefined' && Response.prototype && Response.prototype.json) {
            const origJson = Response.prototype.json;
            Response.prototype.json = async function () {
              const data = await origJson.apply(this, arguments);
              if (data && typeof data === 'object') {
                pruneAds(data);
              }
              return data;
            };
          }
        } catch (e) {}

        // E. Hook window.fetch
        try {
          const origFetch = window.fetch;
          window.fetch = async function (...args) {
            const res = await origFetch.apply(this, args);
            try {
              const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
              if (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next')) {
                const clone = res.clone();
                const data = await clone.json();
                pruneAds(data);
                return new Response(JSON.stringify(data), {
                  status: res.status,
                  statusText: res.statusText,
                  headers: res.headers
                });
              }
            } catch (err) {}
            return res;
          };
        } catch (e) {}

        // F. Hook XMLHttpRequest
        try {
          const origOpen = XMLHttpRequest.prototype.open;
          const origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            this._dozzoUrl = url;
            return origOpen.apply(this, [method, url, ...rest]);
          };
          XMLHttpRequest.prototype.send = function (...args) {
            if (
              typeof this._dozzoUrl === 'string' &&
              (this._dozzoUrl.includes('/youtubei/v1/player') || this._dozzoUrl.includes('/youtubei/v1/next'))
            ) {
              this.addEventListener('readystatechange', function () {
                if (this.readyState === 4 && this.status === 200) {
                  try {
                    const data = JSON.parse(this.responseText);
                    pruneAds(data);
                    Object.defineProperty(this, 'responseText', { value: JSON.stringify(data), writable: false });
                    Object.defineProperty(this, 'response', { value: JSON.stringify(data), writable: false });
                  } catch (e) {}
                }
              });
            }
            return origSend.apply(this, args);
          };
        } catch (e) {}
      }

      // Execute directly in current window context
      runMainWorldAdblocker();

      // Also inject as an inline <script> tag into DOM to guarantee main-world execution before page scripts
      try {
        const scriptEl = document.createElement('script');
        scriptEl.textContent = `(${runMainWorldAdblocker.toString()})();`;
        (document.head || document.documentElement).appendChild(scriptEl);
        scriptEl.remove();
      } catch (e) {}

      // 2. CSS: Make ad videos completely invisible if they ever begin, and hide all ad banners/overlays
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
        ytd-item-section-renderer:has(ytd-ad-slot-renderer),
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
        .ytp-ad-text,
        yt-mealbar-promo-renderer,
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
            if (!v.muted) {
              try { v.muted = true; } catch (e) {}
            }
            try { v.playbackRate = 16.0; } catch (e) {}
          });

          // Click native skip buttons
          const skipBtns = document.querySelectorAll(
            '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern, .ytp-ad-skip-button-container button, [id^="skip-button"] button'
          );
          skipBtns.forEach((btn) => {
            try { btn.click(); } catch (e) {}
          });

          // Call YouTube player skip API if available
          if (typeof player.skipAd === 'function') {
            try { player.skipAd(true); } catch (e) {}
          }

          // Single jump to end with seek lock (prevents thrashing and black screen timeout)
          if (!adSkipLocked) {
            videos.forEach((v) => {
              if (v && !isNaN(v.duration) && v.duration > 0 && isFinite(v.duration)) {
                if (v.currentTime < v.duration - 0.2) {
                  adSkipLocked = true;
                  try {
                    v.currentTime = v.duration;
                  } catch (e) {}
                  setTimeout(() => { adSkipLocked = false; }, 250);
                }
              }
            });
          }
        } else {
          adSkipLocked = false;
          if (adWasActive) {
            adWasActive = false;
            videos.forEach((v) => {
              if (!v) return;
              if (v.playbackRate > 2) {
                try { v.playbackRate = 1.0; } catch (e) {}
              }
              try { v.muted = false; } catch (e) {}
              // Resume the main video once if paused
              if (v.paused && v.currentTime < v.duration - 0.5) {
                v.play().catch(() => {});
              }
            });
          }
        }
      }

      setInterval(quickSkip, 40);
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
  } catch (err) {
    console.error('Error in webview preload:', err);
  }
})();
