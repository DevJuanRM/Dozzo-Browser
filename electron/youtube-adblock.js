// Injected into webviews to instantly skip and hide YouTube ads without breaking video playback
(function () {
  if (window.__dozzo_adblock_injected) return;
  window.__dozzo_adblock_injected = true;

  // 1. Inject CSS only for promotional banners, NOT player video containers
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
    /* YouTube static banner ads (never hide player internal elements) */
    ytd-ad-slot-renderer,
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-banner-promo-renderer,
    #masthead-ad,
    ytd-statement-banner-renderer,
    ytd-in-feed-ad-layout-renderer,
    .ytp-ad-overlay-container,
    .ytp-ad-message-container {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      pointer-events: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // 2. High-speed, non-disruptive YouTube Video Ad Skipper
  if (location.hostname.includes('youtube.com')) {
    function skipYouTubeAds() {
      const moviePlayer = document.querySelector('#movie_player, .html5-video-player');
      if (!moviePlayer) return;

      // Strictly verify if YouTube's player is currently in ad-showing mode
      const isAdActive =
        moviePlayer.classList.contains('ad-showing') ||
        moviePlayer.classList.contains('ad-interrupting');

      const video = moviePlayer.querySelector('video.html5-main-video') || moviePlayer.querySelector('video');

      if (isAdActive) {
        // An ad is playing: mute and fast-forward it
        if (video) {
          try {
            video.muted = true;
            video.playbackRate = 16.0;
            if (isFinite(video.duration) && video.duration > 0) {
              video.currentTime = video.duration - 0.05;
            }
          } catch (e) {}

          if (video.paused) {
            video.play().catch(() => {});
          }
        }

        // Try native internal skip method
        if (typeof moviePlayer.skipAd === 'function') {
          try {
            moviePlayer.skipAd();
          } catch (e) {}
        }

        // Click skip buttons immediately
        const skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, button.ytp-ad-skip-button-modern'
        );
        skipButtons.forEach((btn) => {
          try {
            btn.click();
          } catch (e) {}
        });
      } else {
        // Normal video is active: ensure playbackRate is 1.0 (not stuck at 16x)
        if (video && video.playbackRate > 2) {
          try {
            video.playbackRate = 1.0;
          } catch (e) {}
        }
      }

      // Dismiss overlay close button if present
      const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');
      if (overlayClose) {
        try {
          overlayClose.click();
        } catch (e) {}
      }
    }

    // Run periodically
    setInterval(skipYouTubeAds, 100);

    const observer = new MutationObserver(skipYouTubeAds);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();
