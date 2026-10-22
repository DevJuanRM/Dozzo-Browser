// Webview Preload Script (Runs at document-start before any page scripts execute)
(function () {
  try {
    const isYouTube = Boolean(window.location && window.location.hostname.includes('youtube.com'));

    if (isYouTube) {
      // Inject ultra-early CSS only for YouTube
      const style = document.createElement('style');
      style.id = '__dozzo_early_adblock_css';
      style.textContent = `
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

      // Early auto-skipper directly for YouTube
      let adWasActive = false;

      function quickSkip() {
        const player = document.querySelector('#movie_player, .html5-video-player');
        if (!player) return;

        const isAd =
          player.classList.contains('ad-showing') ||
          player.classList.contains('ad-interrupting') ||
          Boolean(player.querySelector('.ytp-ad-player-overlay, .ytp-ad-showing, .ad-showing, .ytp-ad-text')) ||
          Boolean(document.querySelector('.video-ads > *'));

        const video = player.querySelector('video.html5-main-video') || player.querySelector('video');

        if (isAd) {
          adWasActive = true;
          if (video && !video.muted) {
            video.muted = true;
          }
          if (typeof player.skipAd === 'function') {
            try { player.skipAd(); } catch(e) {}
          }
          const btns = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern');
          btns.forEach(b => { try { b.click(); } catch(e) {} });

          if (video) {
            video.playbackRate = 16.0;
            if (!isNaN(video.duration) && video.duration > 0 && isFinite(video.duration)) {
              if (video.currentTime < video.duration - 0.1) {
                try { video.currentTime = video.duration; } catch(e) {}
              }
            }
          }
        } else if (adWasActive) {
          adWasActive = false;
          if (video) {
            if (video.playbackRate > 2) {
              video.playbackRate = 1.0;
            }
            try { video.muted = false; } catch(e) {}
            if (video.paused && video.currentTime < video.duration - 0.5) {
              video.play().catch(() => {});
            }
          }
        }
      }

      setInterval(quickSkip, 50);
    }

    // Track scrolling to auto-hide navigation bar on scroll down
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
