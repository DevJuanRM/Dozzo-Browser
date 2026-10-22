// Webview Preload Script (Runs at document-start before any page scripts execute)
(function () {
  try {
    // Inject ultra-early CSS at document-start so ad banners, overlays and skip countdowns NEVER render
    const injectEarlyCss = () => {
      const style = document.createElement('style');
      style.id = '__dozzo_early_adblock_css';
      style.textContent = `
        [class*="ytp-ad-"],
        [id*="ytp-ad-"],
        .ytp-ad-module,
        .ytp-ad-player-overlay,
        .ytp-ad-player-overlay-layout,
        .ytp-ad-skip-button-slot,
        .ytp-ad-skip-button-container,
        .ytp-skip-ad-button,
        .ytp-ad-skip-button,
        .ytp-ad-skip-button-modern,
        .ytp-ad-preview-container,
        .ytp-ad-text,
        .ytp-ad-overlay-container,
        .ytp-ad-message-container,
        .video-ads,
        #player-ads,
        ytd-ad-slot-renderer,
        ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
        ytd-banner-promo-renderer,
        #masthead-ad {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          pointer-events: none !important;
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
    };
    injectEarlyCss();

    // Inject Main-World Script (runs in the page context, not isolated world)
    const injectMainWorldScript = () => {
      const script = document.createElement('script');
      script.id = '__dozzo_main_world_adstripper';
      script.textContent = `
        (function() {
          function sanitize(data) {
            if (!data || typeof data !== 'object') return data;
            delete data.adPlacements;
            delete data.adSlots;
            delete data.playerAds;
            delete data.adBreakHeartbeatParams;
            delete data.adParams;
            delete data.adBreakParams;
            return data;
          }

          // Strip ytInitialPlayerResponse at page startup
          let _resp;
          Object.defineProperty(window, 'ytInitialPlayerResponse', {
            get() { return sanitize(_resp); },
            set(v) { _resp = sanitize(v); },
            configurable: true,
            enumerable: true
          });

          // Intercept main-world fetch for /player API
          const origFetch = window.fetch;
          window.fetch = async function(...args) {
            const res = await origFetch.apply(this, args);
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
            if (url.includes('/youtubei/v1/player')) {
              try {
                const clone = res.clone();
                const json = await clone.json();
                sanitize(json);
                return new Response(JSON.stringify(json), {
                  status: res.status,
                  statusText: res.statusText,
                  headers: res.headers
                });
              } catch(e) {}
            }
            return res;
          };

          // Intercept main-world XMLHttpRequest
          const origOpen = XMLHttpRequest.prototype.open;
          const origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function(method, url) {
            this._reqUrl = url;
            return origOpen.apply(this, arguments);
          };
          XMLHttpRequest.prototype.send = function() {
            if (typeof this._reqUrl === 'string' && this._reqUrl.includes('/youtubei/v1/player')) {
              this.addEventListener('readystatechange', function() {
                if (this.readyState === 4 && this.status === 200) {
                  try {
                    const data = JSON.parse(this.responseText);
                    sanitize(data);
                    Object.defineProperty(this, 'responseText', { value: JSON.stringify(data), writable: false });
                    Object.defineProperty(this, 'response', { value: JSON.stringify(data), writable: false });
                  } catch(e) {}
                }
              });
            }
            return origSend.apply(this, arguments);
          };

          // Early ultra-fast auto-skipper directly in main world
          let adMuted = false;
          function quickSkip() {
            const player = document.querySelector('#movie_player, .html5-video-player');
            if (!player) return;
            const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');
            const video = player.querySelector('video');

            if (isAd) {
              if (video && !video.muted) {
                video.muted = true;
                adMuted = true;
              }
              if (typeof player.skipAd === 'function') {
                try { player.skipAd(); } catch(e) {}
              }
              const btns = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
              btns.forEach(b => { try { b.click(); } catch(e) {} });
              if (video && video.duration && isFinite(video.duration) && video.duration > 0) {
                video.playbackRate = 16.0;
                if (video.currentTime < video.duration - 0.1) {
                  try { video.currentTime = Math.max(0, video.duration - 0.1); } catch(e) {}
                }
              }
            } else if (video) {
              if (video.playbackRate > 2) {
                video.playbackRate = 1.0;
              }
              if (adMuted) {
                video.muted = false;
                adMuted = false;
              }
              if (video.paused && video.currentTime > 0 && video.currentTime < video.duration - 1) {
                video.play().catch(() => {});
              }
            }
          }
          setInterval(quickSkip, 25);
        })();
      `;
      const root = document.head || document.documentElement;
      if (root) {
        root.appendChild(script);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.documentElement && !document.getElementById('__dozzo_main_world_adstripper')) {
            document.documentElement.appendChild(script);
          }
        });
      }
    };
    injectMainWorldScript();

    // Track scrolling to auto-hide navigation bar on scroll down
    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
            const diff = currentScrollY - lastScrollY;
            if (diff > 18 && currentScrollY > 40) {
              console.log('__DOZZO_SCROLL__:down');
            } else if (diff < -18 || currentScrollY <= 15) {
              console.log('__DOZZO_SCROLL__:up');
            }
            lastScrollY = currentScrollY;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'wheel',
      function (e) {
        if (e.deltaY > 20) {
          console.log('__DOZZO_SCROLL__:down');
        } else if (e.deltaY < -20) {
          console.log('__DOZZO_SCROLL__:up');
        }
      },
      { passive: true }
    );
  } catch (err) {
    console.warn('[Dozzo Preload] Hook warning:', err);
  }
})();
