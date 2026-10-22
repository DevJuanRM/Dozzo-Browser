// Injected into webviews: Complete, silent YouTube AdBlock (uBlock-style API ad-stripper + DOM skipper)
(function () {
  if (!window.location || !window.location.hostname || !window.location.hostname.includes('youtube.com')) {
    return;
  }
  if (window.__dozzo_adblock_injected) return;
  window.__dozzo_adblock_injected = true;

  // 1. Inject Comprehensive CSS for banner, sidebar, recommendation and promotional ads
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
    /* YouTube sidebar, recommendations, in-feed & banner ads */
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
    ytd-compact-video-renderer:has(.ytd-badge-supported-renderer),
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

    /* Keep skip buttons active for synthetic DOM clicking without flash */
    .ytp-ad-skip-button,
    .ytp-ad-skip-button-modern,
    .ytp-skip-ad-button,
    .ytp-ad-skip-button-slot {
      opacity: 0.001 !important;
      pointer-events: auto !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // 2. YouTube Ad-Free Engine (Only on youtube.com)
  if (location.hostname.includes('youtube.com')) {
    // A. Strip ad metadata from ytInitialPlayerResponse so YouTube never schedules ads
    try {
      function sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;
        delete data.adPlacements;
        delete data.adSlots;
        delete data.playerAds;
        delete data.adBreakHeartbeatParams;
        delete data.adParams;
        delete data.adBreakParams;
        return data;
      }

      let initialResponse = window.ytInitialPlayerResponse;
      Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get() {
          return sanitizeData(initialResponse);
        },
        set(val) {
          initialResponse = sanitizeData(val);
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
              delete data.adBreakHeartbeatParams;
              delete data.adParams;
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
                  delete data.adBreakHeartbeatParams;
                  delete data.adParams;
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

    // D. In-Player Video Ad Instant Skipper
    let adWasActive = false;

    function skipYouTubeAds() {
      // 1. Remove sidebar, recommendation and feed ads from DOM
      const sidebarAds = document.querySelectorAll(`
        ytd-promoted-sparkles-web-renderer,
        ytd-compact-promoted-video-renderer,
        ytd-promoted-video-renderer,
        ytd-display-ad-renderer,
        ytd-action-companion-ad-renderer,
        ytd-ad-slot-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-banner-promo-renderer,
        ytd-statement-banner-renderer,
        ytd-brand-video-singleton-renderer,
        #masthead-ad,
        #player-ads,
        ytd-compact-video-renderer:has(ytd-ad-slot-renderer),
        ytd-compact-video-renderer:has([class*="badge-style-type-ad"]),
        ytd-compact-video-renderer:has(.badge-shape-wiz--ad),
        ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
        ytd-rich-item-renderer:has([class*="badge-style-type-ad"]),
        ytd-rich-item-renderer:has(.badge-shape-wiz--ad)
      `);
      sidebarAds.forEach((el) => {
        try {
          el.remove();
        } catch (e) {
          el.style.display = 'none';
        }
      });

      // 2. Check if a video ad is actively playing
      const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
      if (!moviePlayer) return;

      const isAd =
        moviePlayer.classList.contains('ad-showing') ||
        moviePlayer.classList.contains('ad-interrupting') ||
        Boolean(moviePlayer.querySelector('.ytp-ad-player-overlay, .ytp-ad-showing, .ad-showing, .ytp-ad-text')) ||
        Boolean(document.querySelector('.video-ads > *'));

      const video = moviePlayer.querySelector('video.html5-main-video') || moviePlayer.querySelector('video');

      if (isAd) {
        adWasActive = true;

        // Mute ad immediately to prevent any noise
        if (video && !video.muted) {
          video.muted = true;
        }

        // Call YouTube native player skipAd API
        if (typeof moviePlayer.skipAd === 'function') {
          try {
            moviePlayer.skipAd();
          } catch (e) {}
        }

        // Click skip buttons
        const skipButtons = moviePlayer.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern, .ytp-ad-text'
        );
        skipButtons.forEach((btn) => {
          try {
            btn.click();
          } catch (e) {}
        });

        // Fast forward video to instant completion
        if (video) {
          video.playbackRate = 16.0;
          if (!isNaN(video.duration) && video.duration > 0 && isFinite(video.duration)) {
            if (video.currentTime < video.duration - 0.1) {
              try {
                video.currentTime = video.duration;
              } catch (e) {}
            }
          }
        }
      } else if (adWasActive) {
        // Ad just ended! Restore normal playback rate and un-mute
        adWasActive = false;
        if (video) {
          if (video.playbackRate > 2) {
            try {
              video.playbackRate = 1.0;
            } catch (e) {}
          }
          try {
            video.muted = false;
          } catch (e) {}

          // Resume main video ONLY ONCE if ad transition left it paused
          if (video.paused && video.currentTime < video.duration - 0.5) {
            video.play().catch(() => {});
          }
        }
      }
      // During normal playback: NEVER TOUCH video.play() so user can pause freely!

      // Close banner overlays
      const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');
      if (overlayClose) {
        try {
          overlayClose.click();
        } catch (e) {}
      }
    }

    // Fast-poll every 50ms to skip ads instantly before frames render
    setInterval(skipYouTubeAds, 50);

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
            if (currentY > lastY + 30 && currentY > 60) {
              console.log('__DOZZO_SCROLL__:down');
            } else if (currentY < lastY - 20) {
              console.log('__DOZZO_SCROLL__:up');
            }
            lastY = currentY <= 0 ? 0 : currentY;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  } catch (e) {}
})();
