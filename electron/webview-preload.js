// Webview Preload Script (Runs at document-start before any page scripts execute)
(function () {
  try {
    // Intercept ytInitialPlayerResponse at the earliest possible stage
    let _playerResponse = undefined;
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
      get() {
        if (_playerResponse) {
          delete _playerResponse.adPlacements;
          delete _playerResponse.adSlots;
          delete _playerResponse.playerAds;
        }
        return _playerResponse;
      },
      set(val) {
        if (val) {
          delete val.adPlacements;
          delete val.adSlots;
          delete val.playerAds;
        }
        _playerResponse = val;
      },
      configurable: true,
      enumerable: true
    });

    // Intercept window.fetch for YouTube player responses
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

      if (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/browse') || url.includes('/youtubei/v1/next')) {
        try {
          const clone = response.clone();
          const json = await clone.json();
          if (json.adPlacements || json.adSlots || json.playerAds) {
            delete json.adPlacements;
            delete json.adSlots;
            delete json.playerAds;
            return new Response(JSON.stringify(json), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        } catch (e) {}
      }
      return response;
    };

    // Intercept XMLHttpRequest for YouTube internal player calls
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._requestUrl = url;
      return origOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      if (typeof this._requestUrl === 'string' && this._requestUrl.includes('/youtubei/v1/player')) {
        this.addEventListener('readystatechange', function () {
          if (this.readyState === 4 && this.status === 200) {
            try {
              const data = JSON.parse(this.responseText);
              if (data.adPlacements || data.adSlots || data.playerAds) {
                delete data.adPlacements;
                delete data.adSlots;
                delete data.playerAds;
                Object.defineProperty(this, 'responseText', {
                  value: JSON.stringify(data),
                  writable: false
                });
                Object.defineProperty(this, 'response', {
                  value: JSON.stringify(data),
                  writable: false
                });
              }
            } catch (err) {}
          }
        });
      }
      return origSend.apply(this, args);
    };
  } catch (err) {
    console.warn('[Dozzo Preload] Hook warning:', err);
  }
})();
