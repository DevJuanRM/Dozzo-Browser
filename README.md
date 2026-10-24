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

## ⌨️ Atajos de Teclado (55+ Shortcuts de Navegación Pro)

Dozzo Browser cuenta con una suite completa de más de 50 atajos de teclado profesionales organizados por categorías para máxima productividad (compatibles tanto con **Windows** como con **macOS**):

### 📑 1. Pestañas y Ventanas (18 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Ctrl + T` | `Cmd + T` | **Nueva Pestaña** limpia con barra láser y accesos rápidos |
| `Ctrl + Shift + T` | `Cmd + Shift + T` | **Restaurar Pestaña Cerrada** recientemente (historial de sesión) |
| `Ctrl + W` | `Cmd + W` | **Cerrar Pestaña Actual** |
| `Ctrl + Shift + W` | `Cmd + Shift + W` | **Cerrar Todas las Pestañas** y volver al inicio |
| `Ctrl + Tab` | `Cmd + Option + →` | **Pestaña Siguiente** (cíclico continuo) |
| `Ctrl + Shift + Tab` | `Cmd + Option + ←` | **Pestaña Anterior** |
| `Ctrl + 1` | `Cmd + 1` | Saltar directo a la **1ª Pestaña** |
| `Ctrl + 2` | `Cmd + 2` | Saltar directo a la **2ª Pestaña** |
| `Ctrl + 3` | `Cmd + 3` | Saltar directo a la **3ª Pestaña** |
| `Ctrl + 4` | `Cmd + 4` | Saltar directo a la **4ª Pestaña** |
| `Ctrl + 5` | `Cmd + 5` | Saltar directo a la **5ª Pestaña** |
| `Ctrl + 6` | `Cmd + 6` | Saltar directo a la **6ª Pestaña** |
| `Ctrl + 7` | `Cmd + 7` | Saltar directo a la **7ª Pestaña** |
| `Ctrl + 8` | `Cmd + 8` | Saltar directo a la **8ª Pestaña** |
| `Ctrl + 9` | `Cmd + 9` | Saltar directo a la **Última Pestaña** abierta |
| `Ctrl + N` | `Cmd + N` | **Nueva Ventana** independiente de Dozzo Browser |
| `Ctrl + Shift + N` | `Cmd + Shift + N` | **Nueva Ventana Privada / Incógnito** |
| `Ctrl + M` | `Cmd + M` | **Minimizar Ventana** al dock o barra de tareas |

### 🧭 2. Navegación Web y Búsqueda (8 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Alt + ←` / `Backspace` | `Cmd + [ ` / `Delete` | **Ir Atrás** en el historial de navegación |
| `Alt + →` / `Shift + Backspace` | `Cmd + ] ` | **Ir Adelante** |
| `Ctrl + R` / `F5` | `Cmd + R` | **Recargar Página** web actual |
| `Ctrl + Shift + R` / `Ctrl + F5` | `Cmd + Shift + R` | **Recarga Forzada** (Hard Reload ignorando caché) |
| `Escape` | `Escape` | **Detener Carga** o cerrar modales y paneles abiertos |
| `Alt + Home` | `Option + Home` | **Ir a la Página de Inicio** / Dashboard de Dozzo |
| `Ctrl + L` / `Alt + D` / `F6` | `Cmd + L` | **Enfocar y Seleccionar** la barra de direcciones Omnibar |
| `Ctrl + K` / `Ctrl + E` | `Cmd + K` | **Búsqueda Rápida** en el buscador por defecto |

### 🪟 3. Vista Dividida y Multitarea (5 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Alt + 1` | `Option + 1` | Activar **Vista Simple** (1 Pantalla completa) |
| `Alt + 2` | `Option + 2` | Activar **Doble Pantalla Horizontal** (Split Screen 50/50) |
| `Alt + 3` | `Option + 3` | Activar **Doble Pantalla Vertical** |
| `Alt + 4` | `Option + 4` | Activar **Cuadrícula Multitarea** (4 Pestañas simultáneas) |
| `Alt + S` | `Option + S` | **Desacoplar Pestaña** (Pop Out a ventana independiente) |

### 📂 4. Paneles, Historial y Dozzo Apps (11 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Ctrl + J` | `Cmd + Option + L` | Abrir / Cerrar **Panel de Descargas** |
| `Ctrl + H` / `Ctrl + Y` | `Cmd + Y` | Abrir / Cerrar **Historial de Navegación** |
| `Ctrl + D` | `Cmd + D` | **Guardar o Quitar Marcador** de la página actual |
| `Ctrl + B` | `Cmd + Shift + B` | Abrir / Cerrar **Gestor de Marcadores** |
| `Ctrl + ,` (Coma) | `Cmd + ,` | Abrir **Panel de Configuración** general de Dozzo |
| `Alt + B` | `Option + B` | Desplegar **Binance Watchlist & Cripto Tracker** |
| `Alt + C` | `Option + C` | Abrir / Cerrar Drawer lateral de **ChatGPT IA** |
| `Alt + W` | `Option + W` | Abrir / Cerrar Drawer lateral de **WhatsApp Web** |
| `Alt + P` | `Option + P` | Abrir monitor de **Dozzo Shield** (Bloqueador de Anuncios) |
| `Alt + N` | `Option + N` | Abrir Drawer de **Notas Rápidas** |
| `Alt + T` | `Option + T` | Alternar al instante entre **Modo Oscuro / Modo Claro** |

### 🔍 5. Zoom, Pantalla y Desplazamiento (6 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Ctrl + +` / `Ctrl + =` | `Cmd + +` | **Aumentar Zoom** (+10%) |
| `Ctrl + -` | `Cmd + -` | **Reducir Zoom** (-10%) |
| `Ctrl + 0` | `Cmd + 0` | **Restablecer Zoom** al 100% original |
| `F11` | `Cmd + Ctrl + F` | Alternar **Modo Pantalla Completa** |
| `Alt + ↑` | `Option + ↑` | **Scroll Rápido Hacia Arriba** |
| `Alt + ↓` | `Option + ↓` | **Scroll Rápido Hacia Abajo** |

### 🛠️ 6. Dev Studio & Responsive Mode (4 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `F12` / `Ctrl + Shift + I` | `Cmd + Option + I` | Abrir / Cerrar **Herramientas de Desarrollador (DevTools)** |
| `Ctrl + Shift + M` | `Cmd + Shift + M` | Alternar **Simulador de Dispositivos Móviles (DevMode)** |
| `Ctrl + Shift + C` | `Cmd + Option + C` | Activar **Inspector de Elementos DOM** |
| `Ctrl + U` | `Cmd + Option + U` | Ver el **Código Fuente** de la página actual |

### 📄 7. Gestión de Página y Limpieza (3 Atajos)
| Windows / Linux | macOS | Acción |
| :--- | :--- | :--- |
| `Ctrl + P` | `Cmd + P` | **Imprimir** página o exportar como PDF |
| `Ctrl + Shift + Supr` | `Cmd + Shift + Backspace` | **Borrar Historial** y datos de navegación de la sesión |
| `Espacio` / `Shift + Espacio` | `Espacio` / `Shift + Espacio` | **Avanzar / Retroceder una Pantalla Completa** de lectura |

---

## 🛠️ Tecnologías Utilizadas

* **Electron 45** (Chromium nativo)
* **React 19** & **Vite 8**
* **Framer Motion**
* **Lucide Icons**
* **CSS3 Design Tokens & Glassmorphism**
* **Web Speech API**
* **electron-updater & electron-builder**
