// Injected into webviews: Complete, silent YouTube AdBlock (uBlock-style API ad-stripper + DOM skipper)
(function () {
  if (window.__dozzo_adblock_injected) return;
  window.__dozzo_adblock_injected = true;

    // 1. Inject CSS for banner and promotional ads
    const style = document.createElement('style');
    style.id = '__dozzo_adblock_style';
    style.textContent = `
      /* Universal Ad blocking styles */
      ins.adsbygoogle,
      .adsbygoogle,
      [id^="google_ads_"],
      [id^="div-gpt-ad"],
      .ad-container,
      .ad-slot,
      .ad-banner,
      .taboola,
      .outbrain,
      .trc_related_container,
      /* YouTube static banner ads & in-player ad overlays */
      ytd-ad-slot-renderer,
      ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
      ytd-banner-promo-renderer,
      #masthead-ad,
      ytd-statement-banner-renderer,
      ytd-in-feed-ad-layout-renderer,
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
      #player-ads {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);

  // 2. YouTube Ad-Free Engine (Only on youtube.com)
  if (location.hostname.includes('youtube.com')) {
    // A. Strip ad metadata from ytInitialPlayerResponse so YouTube never schedules ads
    try {
      let initialResponse = window.ytInitialPlayerResponse;
      Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get() {
          if (initialResponse) {
            delete initialResponse.adPlacements;
            delete initialResponse.adSlots;
            delete initialResponse.playerAds;
          }
          return initialResponse;
        },
        set(val) {
          if (val) {
            delete val.adPlacements;
            delete val.adSlots;
            delete val.playerAds;
          }
          initialResponse = val;
        },
        configurable: true
      });
    } catch (e) {}

    // B. Intercept fetch for /player API requests and sanitize ad placements
    try {
      const origFetch = window.fetch;
      window.fetch = async function (...args) {
        const response = await origFetch.apply(this, args);
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (url.includes('/youtubei/v1/player')) {
          try {
            const clone = response.clone();
            const data = await clone.json();
            if (data.adPlacements || data.adSlots || data.playerAds) {
              delete data.adPlacements;
              delete data.adSlots;
              delete data.playerAds;
              return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
            }
          } catch (err) {}
        }
        return response;
      };
    } catch (e) {}

    // C. Intercept XMLHttpRequest for YouTube internal player calls
    try {
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._ytUrl = url;
        return origOpen.apply(this, [method, url, ...rest]);
      };
      XMLHttpRequest.prototype.send = function (...args) {
        if (typeof this._ytUrl === 'string' && this._ytUrl.includes('/youtubei/v1/player')) {
          this.addEventListener('readystatechange', function () {
            if (this.readyState === 4 && this.status === 200) {
              try {
                const data = JSON.parse(this.responseText);
                if (data.adPlacements || data.adSlots || data.playerAds) {
                  delete data.adPlacements;
                  delete data.adSlots;
                  delete data.playerAds;
                  Object.defineProperty(this, 'responseText', { value: JSON.stringify(data), writable: false });
                  Object.defineProperty(this, 'response', { value: JSON.stringify(data), writable: false });
                }
              } catch (e) {}
            }
          });
        }
        return origSend.apply(this, args);
      };
    } catch (e) {}

    // D. Non-destructive In-Player Auto-Skipper
    let wasAdMuted = false;
    function skipYouTubeAds() {
      const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
      if (!moviePlayer) return;

      const isAdActive =
        moviePlayer.classList.contains('ad-showing') ||
        moviePlayer.classList.contains('ad-interrupting');

      const video = moviePlayer.querySelector('video.html5-main-video') || moviePlayer.querySelector('video');

      if (isAdActive) {
        // 1. Mute ad immediately to prevent audio burst
        if (video && !video.muted) {
          video.muted = true;
          wasAdMuted = true;
        }

        // 2. Call YouTube native player skipAd API directly
        if (typeof moviePlayer.skipAd === 'function') {
          try {
            moviePlayer.skipAd();
          } catch (e) {}
        }

        // 3. Click all skip button variants immediately
        const skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern, .ytp-ad-text'
        );
        skipButtons.forEach((btn) => {
          try {
            btn.click();
          } catch (e) {}
        });

        // 4. If ad is still showing and unskippable preroll, fast-forward cleanly at 16x speed
        if (video && !isNaN(video.duration) && video.duration > 0 && isFinite(video.duration)) {
          video.playbackRate = 16.0;
          if (video.currentTime < video.duration - 0.1) {
            try {
              video.currentTime = Math.max(0, video.duration - 0.1);
            } catch (e) {}
          }
        }
      } else {
        // Normal video: restore normal audio state if we muted it for an ad
        if (video) {
          if (video.playbackRate > 2) {
            try {
              video.playbackRate = 1.0;
            } catch (e) {}
          }
          if (wasAdMuted) {
            try {
              video.muted = false;
              wasAdMuted = false;
            } catch (e) {}
          }
          // Ensure main video continues playing seamlessly
          if (video.paused && video.currentTime > 0 && video.currentTime < video.duration - 1) {
            video.play().catch(() => {});
          }
        }
      }

      // Close banner overlays
      const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');
      if (overlayClose) {
        try {
          overlayClose.click();
        } catch (e) {}
      }
    }

    // Fast-poll every 25ms to skip prerolls before the first frame renders
    setInterval(skipYouTubeAds, 25);

    const observer = new MutationObserver(skipYouTubeAds);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Universal scroll detection for auto-hiding top bar
  try {
    let lastY = 0;
    let ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            const currentY = window.scrollY || document.documentElement.scrollTop || 0;
            const diff = currentY - lastY;
            if (diff > 18 && currentY > 40) {
              console.log('__DOZZO_SCROLL__:down');
            } else if (diff < -18 || currentY <= 15) {
              console.log('__DOZZO_SCROLL__:up');
            }
            lastY = currentY;
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
  } catch (e) {}
})();
