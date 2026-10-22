// Search Engines Configuration for Dozzo Browser
export const SEARCH_ENGINES = [
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    badge: '100% Privado',
    desc: 'Búsquedas privadas sin rastreo ni perfiles de usuario (Predeterminado)',
    homeUrl: 'https://duckduckgo.com',
    searchUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  },
  {
    id: 'google',
    name: 'Google',
    badge: 'Popular',
    desc: 'El buscador más grande y completo del mundo',
    homeUrl: 'https://www.google.com',
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  },
  {
    id: 'tor',
    name: 'Tor Search (Tor Network & Privacy)',
    badge: 'Máximo Anonimato',
    desc: 'Motor de búsqueda anónimo oficial de la red Tor sin rastros ni historial',
    homeUrl: 'https://duckduckgo.com/?t=tor',
    searchUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}&t=tor`
  },
  {
    id: 'brave',
    name: 'Brave Search',
    badge: 'Independiente',
    desc: 'Índice de búsqueda 100% independiente de Google y Bing',
    homeUrl: 'https://search.brave.com',
    searchUrl: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`
  },
  {
    id: 'bing',
    name: 'Microsoft Bing',
    badge: 'Microsoft AI',
    desc: 'Buscador de Microsoft con soporte de IA integrada',
    homeUrl: 'https://www.bing.com',
    searchUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
  },
  {
    id: 'startpage',
    name: 'Startpage',
    badge: 'Privacidad Holandesa',
    desc: 'Resultados de Google con protección de privacidad estricta',
    homeUrl: 'https://startpage.com',
    searchUrl: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`
  }
];

export function getSearchUrl(engineId, query) {
  const engine = SEARCH_ENGINES.find((e) => e.id === engineId) || SEARCH_ENGINES[0];
  return engine.searchUrl(query);
}

export function getEngine(engineId) {
  return SEARCH_ENGINES.find((e) => e.id === engineId) || SEARCH_ENGINES[0];
}
