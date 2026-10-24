// Injected into webviews: High-Performance YouTube AdBlock & Anti-Stall Engine
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
    /* Hide ad video frames so no ad screenshots or flashes ever appear */
    #movie_player.ad-showing video,
    #movie_player.ad-interrupting video,
    .video-ads video {
      visibility: hidden !important;
      opacity: 0 !important;
    }

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
    .ytp-ad-text,
    yt-mealbar-promo-renderer,
    ytd-thumbnail-overlay-toggle-button-renderer,
    ytd-thumbnail-overlay-toggle-button-shape,
    .ytp-cards-button,
    .ytp-cards-teaser,
    .ytp-suggested-action-badge,
    .ytp-pause-overlay,
    .ytp-ce-element,
    .ytp-ce-covering-overlay,
    /* Prevent "¿El video se interrumpe?" interruption tooltip / popup from blocking player */
    tp-yt-paper-dialog:has(#feedback),
    tp-yt-paper-dialog:has(#confirm-button),
    ytd-popup-container:has(#confirm-button),
    ytd-enforcement-message-view-model {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      pointer-events: none !important;
    }

    /* Keep skip buttons active for synthetic DOM clicking */
    .ytp-ad-skip-button,
    .ytp-ad-skip-button-modern,
    .ytp-skip-ad-button,
    .ytp-ad-skip-button-slot {
      opacity: 0.001 !important;
      pointer-events: auto !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // 2. High-Speed, Safe Ad Skipping (No JSON.parse hooking, no forced seek corruption)
  let adWasActive = false;

  function dismissInterruptionPrompts() {
    try {
      // Auto-click confirm/dismiss if any interruption modal or prompt is spawned
      const confirmBtn = document.querySelector('#confirm-button, button.yt-spec-button-shape-next--filled, ytd-button-renderer:has(#confirm-button) button');
      if (confirmBtn && confirmBtn.offsetParent !== null) {
        confirmBtn.click();
      }
      const paperDialog = document.querySelector('tp-yt-paper-dialog');
      if (paperDialog && paperDialog.style.display !== 'none') {
        const okBtn = paperDialog.querySelector('#confirm-button, button');
        if (okBtn) okBtn.click();
      }
    } catch (e) {}
  }

  function skipYouTubeAds() {
    dismissInterruptionPrompts();

    const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
    if (!moviePlayer) return;

    const isAd =
      moviePlayer.classList.contains('ad-showing') ||
      moviePlayer.classList.contains('ad-interrupting') ||
      Boolean(moviePlayer.querySelector('.ytp-ad-player-overlay, .ytp-ad-showing, .ad-showing, .ytp-ad-text, .ytp-ad-module:not(:empty)')) ||
      Boolean(document.querySelector('.video-ads > *'));

    const videos = moviePlayer.querySelectorAll('video');

    if (isAd) {
      adWasActive = true;

      // Click any skip button immediately
      const skipButtons = document.querySelectorAll(
        '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button.ytp-ad-skip-button-modern, .ytp-ad-skip-button-container button, [id^="skip-button"] button'
      );
      skipButtons.forEach((btn) => {
        try {
          btn.click();
        } catch (e) {}
      });

      // Call YouTube native player skipAd API if available
      if (typeof moviePlayer.skipAd === 'function') {
        try {
          moviePlayer.skipAd(true);
        } catch (e) {}
      }

      // Fast-forward ad cleanly without corrupting video state machine
      videos.forEach((video) => {
        if (!video) return;
        try {
          video.muted = true;
        } catch (e) {}

        try {
          video.playbackRate = 16.0;
        } catch (e) {}

        if (isFinite(video.duration) && video.duration > 0.5 && video.currentTime < video.duration - 0.2) {
          try {
            video.currentTime = video.duration - 0.1;
          } catch (e) {}
        }
      });
    } else if (adWasActive) {
      // Ad has ended! Cleanly restore normal playback speed and unmute
      adWasActive = false;
      videos.forEach((video) => {
        if (!video) return;
        if (video.playbackRate > 2) {
          try {
            video.playbackRate = 1.0;
          } catch (e) {}
        }
        try {
          video.muted = false;
        } catch (e) {}
        if (video.paused && isFinite(video.duration) && video.currentTime < video.duration - 0.5) {
          try {
            video.play().catch(() => {});
          } catch (e) {}
        }
      });
    }

    // Close banner overlays
    const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');
    if (overlayClose) {
      try {
        overlayClose.click();
      } catch (e) {}
    }
  }

  // Poll aggressively every 100ms for instantaneous ad skipping
  setInterval(skipYouTubeAds, 100);

  // Mutation observer throttled
  let observerTimeout = null;
  const observer = new MutationObserver(() => {
    if (!observerTimeout) {
      observerTimeout = setTimeout(() => {
        skipYouTubeAds();
        observerTimeout = null;
      }, 100);
    }
  });

  const targetNode = document.querySelector('#movie_player') || document.body || document.documentElement;
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  // Auto-upgrade YouTube Miniplayer to Native Floating Picture-in-Picture (PiP)
  // When user clicks "Miniplayer" in YouTube's context menu or bottom bar, trigger native PiP floating window
  document.addEventListener(
    'click',
    (e) => {
      try {
        const miniplayerBtn = e.target && typeof e.target.closest === 'function'
          ? e.target.closest('.ytp-miniplayer-button, .ytp-menuitem, button[data-tooltip-target-id="ytp-miniplayer-button"]')
          : null;

        if (miniplayerBtn) {
          const text = (miniplayerBtn.textContent || '').toLowerCase();
          const isMini =
            miniplayerBtn.classList.contains('ytp-miniplayer-button') ||
            text.includes('miniplayer') ||
            text.includes('miniatura');

          if (isMini) {
            const video = document.querySelector('video');
            if (video && document.pictureInPictureEnabled) {
              e.preventDefault();
              e.stopPropagation();
              if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(() => {});
              } else {
                video.requestPictureInPicture().catch(() => {});
              }
            }
          }
        }
      } catch (_) {}
    },
    true
  );

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
