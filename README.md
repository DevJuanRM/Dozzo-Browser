# 🛡️ Dozzo Browser (Official & Latest Release)

<div align="center">

![Dozzo Browser](https://raw.githubusercontent.com/DevJuanRM/Dozzo-Browser/main/public/icon.svg)

Un navegador web **100% privado, moderno y ultra-rápido**, desarrollado con **React, Vite y Electron**.  
Diseñado especialmente para navegación sin anuncios, máxima privacidad, seguimiento cripto en tiempo real, búsqueda por voz inteligente y dock con efecto lupa estilo macOS.

[![GitHub Release](https://img.shields.io/github/v/release/DevJuanRM/Dozzo-Browser?color=F0B90B&label=Versi%C3%B3n%20Oficial)](https://github.com/DevJuanRM/Dozzo-Browser/releases/latest)
[![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D6?logo=windows&logoColor=white)](https://github.com/DevJuanRM/Dozzo-Browser/releases/latest)
[![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon%20%26%20Intel-000000?logo=apple&logoColor=white)](https://github.com/DevJuanRM/Dozzo-Browser/releases/latest)
[![Android / iOS](https://img.shields.io/badge/Mobile-Android%20%26%20iPhone%20(PWA)-3DDC84?logo=android&logoColor=white)](https://devjuanrm.github.io/Dozzo-Browser/)
[![License](https://img.shields.io/badge/Licencia-Privada-yellow)](#)

---

### 📥 Descargas Oficiales (Última Versión)

Siempre se descarga automáticamente la versión más reciente y actualizada de Dozzo Browser:

| Plataforma | Tipo | Enlace de Descarga Directa (1-Click) |
| :--- | :--- | :--- |
| 💻 **Windows** (Recomendado) | `.exe` (Instalador con auto-actualizador) | [⬇️ **Descargar Dozzo Setup (.exe)**](https://github.com/DevJuanRM/Dozzo-Browser/releases/download/v4.5.0/Dozzo.Browser.Setup.4.5.0.exe) |
| 💻 **Windows Portable** | `.exe` (Ejecutable sin instalación) | [⬇️ **Descargar Dozzo Portable (.exe)**](https://github.com/DevJuanRM/Dozzo-Browser/releases/download/v4.5.0/Dozzo.Browser.4.5.0.exe) |
| 🍏 **macOS** (Mac Silicon M1/M2/M3/M4) | `.dmg` (Instalador Apple oficial) | [⬇️ **Descargar Dozzo para Mac (.dmg)**](https://github.com/DevJuanRM/Dozzo-Browser/releases/download/v4.5.0/Dozzo.Browser-4.5.0-arm64.dmg) |
| 🍏 **macOS ZIP** (Alternativo) | `.zip` (Comprimido para Mac) | [⬇️ **Descargar Dozzo Mac (.zip)**](https://github.com/DevJuanRM/Dozzo-Browser/releases/download/v4.5.0/Dozzo.Browser-4.5.0-arm64-mac.zip) |
| 📱 **Android & iPhone** | PWA (Web App Nativa Móvil) | [📲 **Abrir Dozzo Mobile App**](https://devjuanrm.github.io/Dozzo-Browser/) |

> 📌 **Historial y Notas de Versión:** Puedes consultar todas las novedades y archivos en [GitHub Releases](https://github.com/DevJuanRM/Dozzo-Browser/releases/latest).

</div>

---

## 🍏 Instalación en macOS

Para usuarios de Mac (MacBook Air, MacBook Pro, Mac mini, Mac Studio, iMac):

### Opción 1: Descarga Directa (1-Click)
1. Haz clic aquí para descargar el instalador directo:  
   👉 [⬇️ **Descargar Dozzo Browser para Mac (.dmg)**](https://github.com/DevJuanRM/Dozzo-Browser/releases/download/v4.5.0/Dozzo.Browser-4.5.0-arm64.dmg)
2. Abre el archivo `.dmg` descargado y arrastra **Dozzo Browser** a tu carpeta de **Aplicaciones**.

### Opción 2: Compilar y Ejecutar en Mac en 2 pasos
Si tienes Node.js en tu Mac:
```bash
git clone https://github.com/DevJuanRM/Dozzo-Browser.git
cd Dozzo-Browser
npm install
npm run dev
```
Para generar el instalador `.dmg` de Mac:
```bash
npm run dist:mac
```

---

## 📱 Cómo Instalar en Celulares (Android y iPhone)

Dozzo Browser incluye soporte **PWA (Progressive Web App)** nativo con ícono de alta resolución, ejecución a pantalla completa, barra de navegación móvil y pestañas flotantes:

### 🤖 En Celulares Android:
1. Abre el enlace en tu navegador móvil (Google Chrome o Brave):  
   👉 **https://devjuanrm.github.io/Dozzo-Browser/**
2. Verás el botón o aviso en la parte inferior: **"Agregar Dozzo Browser a la pantalla principal"** o **"Instalar aplicación"**.
3. Si no sale el aviso, toca el menú de los **3 puntos** (arriba a la derecha) y presiona **"Instalar aplicación"**.
4. ¡Listo! Se creará el ícono oficial en tu pantalla con acceso directo independiente como si fuera un APK nativo.

### 🍏 En iPhone (iOS Safari):
1. Abre el enlace en **Safari**:  
   👉 **https://devjuanrm.github.io/Dozzo-Browser/**
2. Toca el botón de **Compartir** (el ícono del cuadrado con la flecha hacia arriba en la barra inferior de Safari).
3. Desliza hacia abajo y presiona **"Agregar a pantalla de inicio"** (*Add to Home Screen*).
4. Toca **"Agregar"**. Dozzo se instalará como una App nativa a pantalla completa con su ícono oficial.

---

## ✨ Características Principales

### 1. 🔒 100% Privado y Sin Rastreo
* **Cero telemetría:** No envía historial, telemetría ni datos a Google, Microsoft ni terceros.
* **Buscadores Privados:** Configurado con **Google**, **DuckDuckGo**, **Brave Search** y **Startpage**.
* **Anti-Fingerprinting:** Protección de cabeceras para evitar rastreo entre sitios.

### 2. 🚫 Bloqueador de Anuncios Integrado (Dozzo Shield)
* **Intercepción a nivel de red:** Bloquea peticiones a redes de anuncios como DoubleClick, Google AdServices, Criteo, Taboola, Outbrain, Facebook Pixel, etc.
* **YouTube Sin Publicidad:** Detector y saltador automático de anuncios en videos de YouTube, silenciado instantáneo y eliminación de banners invasivos.
* **Contador en vivo:** Muestra en la barra cuántos anuncios y rastreadores han sido neutralizados en tu sesión.

### 3. 🔍 Barra de Búsqueda Láser & Búsqueda por Voz
* **Efecto BorderBeam dinámico:** Se activa en la bienvenida, al seleccionar la barra, al escribir o al dictar por voz.
* **Búsqueda por Voz Inteligente:** Botón de micrófono integrado con reconocimiento de voz en tiempo real y envío automático.
* **Sugerencias y URLs directas:** Autocompletado inteligente con navegación por teclado.

### 4. 📈 Vigilancia de Mercados y Criptomonedas (Watchlist)
* Tarjeta limpia y compacta en reposo con tipografía redondeada **Lato**.
* Despliegue fluido en hover hacia abajo mostrando 5 activos en tiempo real.
* Rotación automática fluida entre Índices (S&P 500, BTC, Tech), Criptos alternativas y Materias primas (Oro, Petróleo Brent).

### 5. 📰 Mazo de Noticias en Vivo (Card Deck Carousel)
* Mazo de noticias apiladas en 3D con fotografías de prensa reales y logotipo original.
* Detección automática del idioma del usuario (Español / Inglés).
* En reposo se muestra como un rectángulo plano; al hacer hover se abanica suavemente y despliega el titular y la descripción completa.

### 6. 🖥️ Dock Lateral Estilo macOS con Efecto Lupa
* Iconos monocromáticos oscuros minimalistas (WhatsApp, Instagram, Figma, Slack, Twitter/X, Notas, ChatGPT IA y Configuración).
* Magnificación suave con físicas de resorte libres de oscilaciones.
* Tooltips flotantes independientes que nunca se cortan en pantalla.

### 7. 📱 Experiencia Móvil 100% Dedicada
* Omnibar superior estilo Chrome Mobile con indicador de seguridad y contador de pestañas.
* Barra de navegación inferior con acceso a historial, favoritos, recarga y selector de pestañas en cuadrícula táctil.
* Búsqueda activa y navegación web instantánea tanto en teléfonos como en tablets.

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + T` | Abrir nueva pestaña |
| `Ctrl + W` | Cerrar pestaña actual |
| `Ctrl + R` / `F5` | Recargar página |
| `Ctrl + Shift + R` | Recargar interfaz de Dozzo |
| `Alt + ←` | Ir atrás en el historial |
| `Alt + →` | Ir adelante |

---

## 🛠️ Tecnologías Utilizadas

* **Electron 45** (Chromium nativo)
* **React 19** & **Vite 8**
* **Framer Motion**
* **Lucide Icons**
* **CSS3 Design Tokens & Glassmorphism**
* **Web Speech API**
* **electron-updater & electron-builder**
