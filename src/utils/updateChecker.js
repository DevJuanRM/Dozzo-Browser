// Version and Update Checking Service for Dozzo Browser
import pkg from '../../package.json';
export const CURRENT_VERSION = pkg.version || '2.0.0';
export const GITHUB_REPO = 'DevJuanRM/Dozzo-Browser';

/**
 * Compare two semantic version strings (e.g. "1.1.0" vs "1.0.0")
 * Returns 1 if vA > vB, -1 if vA < vB, 0 if equal
 */
export function compareVersions(vA, vB) {
  const cleanA = (vA || '').replace(/^v/i, '').trim();
  const cleanB = (vB || '').replace(/^v/i, '').trim();
  
  const partsA = cleanA.split('.').map((n) => parseInt(n, 10) || 0);
  const partsB = cleanB.split('.').map((n) => parseInt(n, 10) || 0);
  
  const maxLen = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLen; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Check GitHub Releases for the latest version of Dozzo Browser
 */
export async function checkForLatestRelease(force = false) {
  // Check localStorage cache to prevent GitHub API rate limiting (15 min cache)
  const CACHE_KEY = 'dozzo_latest_release_cache';
  if (!force) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const ageMs = Date.now() - (parsed.timestamp || 0);
        if (ageMs < 15 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    const latestVersion = (data.tag_name || '').replace(/^v/i, '').trim();
    const hasUpdate = compareVersions(latestVersion, CURRENT_VERSION) > 0;

    // Find Windows exe and Mac dmg direct download assets
    let downloadUrl = data.html_url;
    let windowsDownloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${latestVersion}/Dozzo.Browser.Setup.${latestVersion}.exe`;
    let macDownloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${latestVersion}/Dozzo.Browser-${latestVersion}-arm64.dmg`;

    if (Array.isArray(data.assets)) {
      const exeAsset = data.assets.find(
        (a) => a.name && a.name.endsWith('.exe') && a.name.includes('Setup')
      ) || data.assets.find((a) => a.name && a.name.endsWith('.exe'));
      if (exeAsset && exeAsset.browser_download_url) {
        windowsDownloadUrl = exeAsset.browser_download_url;
        downloadUrl = exeAsset.browser_download_url;
      }

      const dmgAsset = data.assets.find(
        (a) => a.name && a.name.endsWith('.dmg')
      );
      if (dmgAsset && dmgAsset.browser_download_url) {
        macDownloadUrl = dmgAsset.browser_download_url;
      }
    }

    const result = {
      hasUpdate,
      currentVersion: CURRENT_VERSION,
      latestVersion: latestVersion || CURRENT_VERSION,
      releaseName: data.name || `Dozzo Browser v${latestVersion}`,
      releaseNotes: data.body || 'Mejoras continuas de rendimiento, seguridad y experiencia de navegación.',
      releaseDate: data.published_at ? new Date(data.published_at).toLocaleDateString() : '',
      downloadUrl,
      windowsDownloadUrl,
      macDownloadUrl,
      releaseUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases`
    };

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: result })
    );

    return result;
  } catch (err) {
    console.warn('Could not check for updates via GitHub API:', err);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      releaseName: `Dozzo Browser v${CURRENT_VERSION}`,
      releaseNotes: '',
      downloadUrl: `https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Dozzo.Browser.Setup.${CURRENT_VERSION}.exe`,
      windowsDownloadUrl: `https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Dozzo.Browser.Setup.${CURRENT_VERSION}.exe`,
      macDownloadUrl: `https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Dozzo.Browser-${CURRENT_VERSION}-arm64.dmg`,
      releaseUrl: `https://github.com/${GITHUB_REPO}/releases`
    };
  }
}
