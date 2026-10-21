# 🛡️ Dozzo Browser (Binance & Privacy Edition)

Un navegador web de escritorio **100% privado, moderno y ultra-rápido**, desarrollado con **React, Vite y Electron**. Diseñado especialmente para navegación sin anuncios, máxima privacidad y seguimiento de criptomonedas con Binance en tiempo real.

---

## ✨ Características Principales

### 1. 🔒 100% Privado y Sin Rastreo
* **Cero telemetría:** No envía historial, telemetría ni datos a Google, Microsoft ni terceros.
* **Buscadores Privados:** Viene configurado de fábrica con **DuckDuckGo**, **Brave Search** y **Startpage**.
* **Anti-Fingerprinting:** Protección de cabeceras para evitar que te identifiquen por tu dispositivo.

### 2. 🚫 Bloqueador de Anuncios y Rastreadores Integrado (Dozzo Shield)
* **Intercepción a nivel de red:** Bloquea peticiones a redes de anuncios como DoubleClick, Google AdServices, Criteo, Taboola, Outbrain, Facebook Pixel, etc.
* **YouTube Sin Publicidad:** Detector y saltador automático de anuncios en videos de YouTube, silenciado instantáneo y eliminación de banners invasivos.
* **Contador en vivo:** Muestra en la barra cuántos anuncios y rastreadores han sido neutralizados en tu sesión.

### 3. 🟡 Binance Crypto Hub en la Barra
* **Ticker en vivo en la barra de navegación:** Muestra el precio actual de Bitcoin / BNB.
* **Panel lateral interactivo:** Consulta en tiempo real las cotizaciones, cambios porcentuales de 24 horas y volumen de las principales criptomonedas (BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX, NEAR, SUI) directamente desde la API oficial de Binance.
* **Acceso directo a Spot:** Botón de 1 clic para abrir pares de trading en Binance Exchange.

### 4. 🎨 Diseño Moderno, Rápido y Personalizable
* **Modo Oscuro (Dark Pro)** y **Modo Claro (Light)**.
* **6 Paletas de colores:**
  * 🟡 *Binance Gold* (Predeterminado)
  * 🔵 *Cyber Cyan*
  * 🟢 *Emerald Green*
  * 🟣 *Royal Violet*
  * 🟠 *Sunset Flame*
  * 🔴 *Ruby Crimson*
* **Nueva Pestaña (Speed Dial):** Reloj en tiempo real, barra de búsqueda privada, accesos rápidos a YouTube, Binance, ChatGPT, GitHub, Reddit y Wikipedia.

---

## 🚀 Cómo Ejecutar el Navegador

Para iniciar el navegador en modo desarrollo con recarga rápida de React:

```bash
npm run dev
```

O si prefieres ejecutar directamente la versión compilada:

```bash
npm start
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl + T` | Abrir nueva pestaña |
| `Ctrl + W` | Cerrar pestaña actual |
| `Ctrl + R` | Recargar página |
| `Alt + ←` | Ir atrás en el historial |
| `Alt + →` | Ir adelante |

---

## 🛠️ Tecnologías Utilizadas

* **Electron** (Motor Chromium nativo de Google Chrome)
* **React 19** & **Vite 6**
* **Lucide Icons**
* **Binance Public Market Data API**
* **CSS3 Design Tokens & Glassmorphism**
