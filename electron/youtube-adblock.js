// Injected into webviews to instantly skip and hide YouTube & generic web ads
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
    /* YouTube specific ad elements */
    #player-ads,
    .ytp-ad-module,
    .ytp-ad-overlay-container,
    .ytp-ad-overlay-slot,
    .ytp-ad-message-container,
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
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // 2. YouTube Auto-Ad Skipper & Fast-Forwarder (only on youtube.com)
  if (location.hostname.includes('youtube.com')) {
    function handleYouTubeAds() {
      const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');

      if (moviePlayer && (moviePlayer.classList.contains('ad-showing') || moviePlayer.classList.contains('ad-interrupting'))) {
        if (video) {
          // Mute and fast forward to end
          video.muted = true;
          video.playbackRate = 16;
          if (!isNaN(video.duration) && video.duration > 0) {
            video.currentTime = video.duration;
          }
        }

        // Click skip button immediately if present
        const skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, button.ytp-ad-skip-button-modern'
        );
        skipButtons.forEach((btn) => {
          try {
            btn.click();
          } catch (e) {}
        });
      }

      // Dismiss overlay ads
      const closeButtons = document.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container');
      closeButtons.forEach((btn) => {
        try {
          btn.click();
        } catch (e) {}
      });
    }

    // Run on interval and observer
    setInterval(handleYouTubeAds, 250);

    const observer = new MutationObserver(() => {
      handleYouTubeAds();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();
