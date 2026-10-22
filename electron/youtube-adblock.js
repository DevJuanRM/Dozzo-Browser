// Injected into webviews to instantly skip and hide YouTube & generic web ads without freezing
(function () {
  if (window.__dozzo_adblock_injected) return;
  window.__dozzo_adblock_injected = true;

  // 1. Inject global ad-blocking CSS
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
    /* YouTube specific ad elements & overlays */
    #player-ads,
    .ytp-ad-module,
    .ytp-ad-player-overlay,
    .ytp-ad-player-overlay-layout,
    .ytp-ad-player-overlay-skip-or-preview,
    .ytp-ad-overlay-container,
    .ytp-ad-overlay-slot,
    .ytp-ad-message-container,
    .ytp-ad-preview-container,
    ytd-ad-slot-renderer,
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-banner-promo-renderer,
    #masthead-ad,
    ytd-statement-banner-renderer,
    ytd-in-feed-ad-layout-renderer {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      pointer-events: none !important;
      opacity: 0 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // 2. High-speed YouTube Seamless Auto-Ad Skipper (only on youtube.com)
  if (location.hostname.includes('youtube.com')) {
    let lastHandledTime = 0;

    function handleYouTubeAds() {
      const now = Date.now();
      // Throttle slightly to avoid duplicate events within 20ms
      if (now - lastHandledTime < 20) return;
      lastHandledTime = now;

      const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');

      const isAdShowing =
        (moviePlayer && (moviePlayer.classList.contains('ad-showing') || moviePlayer.classList.contains('ad-interrupting'))) ||
        document.querySelector('.ytp-ad-player-overlay, .ytp-ad-module, .ad-showing, .ad-interrupting');

      if (isAdShowing) {
        // Fast-forward video ad without buffering stall
        if (video) {
          try {
            video.muted = true;
            video.playbackRate = 16.0;

            if (isFinite(video.duration) && video.duration > 0) {
              // Jump right to the end
              video.currentTime = video.duration - 0.05;
            }
          } catch (e) {}

          // Ensure video doesn't get stuck paused on black screen
          if (video.paused) {
            video.play().catch(() => {});
          }
        }

        // Try native internal player skip method if available
        if (moviePlayer && typeof moviePlayer.skipAd === 'function') {
          try {
            moviePlayer.skipAd();
          } catch (e) {}
        }

        // Click any and all skip buttons immediately
        const skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, button.ytp-ad-skip-button-modern, .ytp-ad-text'
        );
        skipButtons.forEach((btn) => {
          try {
            btn.click();
          } catch (e) {}
        });
      }

      // Close dismissable overlay banners
      const closeButtons = document.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container');
      closeButtons.forEach((btn) => {
        try {
          btn.click();
        } catch (e) {}
      });
    }

    // Attach high-frequency video listeners
    function attachVideoListeners() {
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (video && !video.__dozzo_attached) {
        video.__dozzo_attached = true;
        video.addEventListener('timeupdate', handleYouTubeAds, { passive: true });
        video.addEventListener('play', handleYouTubeAds, { passive: true });
        video.addEventListener('loadedmetadata', handleYouTubeAds, { passive: true });
      }
    }

    // Run at 50ms interval for ultra-fast reaction before user perceives a freeze
    setInterval(() => {
      handleYouTubeAds();
      attachVideoListeners();
    }, 50);

    const observer = new MutationObserver(() => {
      handleYouTubeAds();
      attachVideoListeners();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();
