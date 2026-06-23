# Handoff: Elephant — app de vocabulario por mnemotecnia

## Overview
**Elephant** es una app móvil (PWA) de vocabulario. Su tesis: *no enseña inglés, hace que RECUERDES una palabra durante años.* El mecanismo combina **mnemotecnia** (una escena absurda + un gancho fonético) con **repetición espaciada**. El nombre viene de "un elefante nunca olvida".

Este paquete contiene una **landing/onboarding de scroll vertical** (10 pantallas) más una **demo interactiva** que genera escenas mnemotécnicas con IA, un checkout simulado y una pantalla de éxito.

## About the Design Files
Los archivos `.dc.html` de `designs/` son **referencias de diseño creadas en HTML** — prototipos que muestran el aspecto y el comportamiento deseados, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno del codebase destino** (React/Next, Vue, SwiftUI, etc.) siguiendo sus patrones y librerías. Si no hay codebase aún, elige el framework más apropiado (recomendado para una PWA: **React + Vite** o **Next.js**, instalable como PWA) e impleméntalos ahí.

> Detalle técnico: los `.dc.html` son "Design Components" — se renderizan con `support.js` (incluido) a partir de una plantilla + una clase de lógica embebida en `<script type="text/x-dc" data-dc-script>`. **No** hace falta portar ese runtime; úsalo solo para abrir los archivos en el navegador como referencia viva. La lógica de estado (abajo documentada) sí debe reimplementarse.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografías, espaciados, copy e interacciones son los definitivos. Recrea la UI de forma pixel-perfect con las librerías del codebase. Los valores exactos están en *Design Tokens*.

---

## Arquitectura de pantallas (flujo de scroll vertical)

El usuario recorre 10 "pantallas" a pantalla completa (cada una `min-height: 100svh`), más 2 overlays (checkout y éxito). Orden actual:

| # | Nombre | id | Fondo | Resumen |
|---|--------|----|-------|---------|
| 1 | La promesa | — | `#F4EFE7` | Hero. Logo arriba. Titular + flecha de scroll. |
| 2 | Repetir no funciona | `#metodo` | `#EFE8DB` | Marquesina de palabras + contador de repeticiones. |
| 3 | El método Elephant | `#proceso` | `#F4EFE7` | Explica el método con ilustración anotada + 3 reglas. |
| 4 | Demo (interactiva) | `#demo` | `#EFE8DB` | El corazón: adivina/genera la escena con IA. |
| 5 | La cuenta | `#lacuenta` | `#241F40` | 5/día → 1.825/año → 1.500 para hablar. |
| 6 | Para todos los niveles | — | `#F4EFE7` | "El camino": hitos Principiante→Intermedio→Avanzado. |
| 7 | La app por dentro | — | `#EFE8DB` | Mockup: sesión de hoy + progreso a Intermedio. |
| 8 | Por qué funciona | `#science` | `#F4EFE7` | "Tu cerebro no olvida idiomas. Olvida lo aburrido." |
| 9 | Credibilidad | — | `#F4EFE7` | Testimonios (tarjetas ligeramente rotadas). |
| 10 | La oferta | `#try` | `#F4EFE7` | Plan 59 €/año + garantía → checkout. |
| — | Checkout (overlay) | — | `#241F40` | Email + tarjeta + nombre. |
| — | Éxito (overlay) | — | `#241F40` | Confirmación con la palabra del usuario. |

### Sistema de fondos (intencionado, no decorativo)
- **`#F4EFE7` (arena claro)** = base, la mayoría de pantallas.
- **`#EFE8DB` (beige)** con filetes `1px #E3DBCC` arriba/abajo = beats de "contexto" (problema, demo, app).
- **`#241F40` (índigo profundo)** = momentos de golpe de efecto (la cuenta, tarjetas de escena).

---

## Pantallas en detalle

### 1 · La promesa
- Layout: flex column centrado, `min-height:100svh`, `text-align:center`.
- Logo lockup arriba centrado (`position:absolute; top:26px`): icono elefante SVG 24px (`fill #221C16`) + "Elephant" (Newsreader 600, 17px, letter-spacing -0.01em).
- H1: Newsreader 400, `clamp(34px,9vw,42px)`, line-height 1.08, letter-spacing -0.02em. Copy: **"Aprende inglés hoy."** + `<br>` + en cursiva índigo `#2B2752`: **"Recuérdalo dentro de diez años."** ("inglés" en weight 600).
- Flecha de scroll abajo (`bottom:30px`), chevron 26px stroke `#A99F90`, animación `nudge`. onClick → `scrollToId('metodo')`.

### 2 · Repetir no funciona
- Fondo `#EFE8DB`, filetes superior/inferior `1px #E3DBCC`.
- Eyebrow: Hanken 500, 13px, uppercase, letter-spacing 0.16em, `#A99F90` → "El método tradicional".
- H2: Newsreader 400, `clamp(32px,9vw,46px)` → "Repetir no funciona."
- Marquesina: 4 spans de palabras (`data-rep="1..4"`) que cruzan horizontalmente (animaciones `mqL`/`mqR`), Newsreader `clamp(34px,11vw,56px)`, tonos arena `#C2B299 #D2C6B0 #BFAF95 #CBBCA4`. Cada vez que una pasa por el centro, incrementa el contador.
- Contador: "repetición nº" (Hanken 12px) + número grande `{reps}` (Newsreader `clamp(48px,14vw,68px)`, `#2B2752`) + "…y sigue sin quedarse." (Newsreader italic).
- Flecha → `scrollToId('proceso')`.

### 3 · El método Elephant
- Eyebrow centrado con icono elefante 18px `#B0917E` + "El método Elephant" (Hanken 600, 12px, letter-spacing 0.22em, uppercase).
- H2: "Lo ridículo " + cursiva índigo "no se olvida". Newsreader `clamp(32px,8.5vw,42px)`.
- **Hero (tarjeta `#241F40`, radius 24px, padding 20-22px):** ilustración SVG de línea (dromedario asomando de un cajón, trazo crema `#F4EFE7` 3px, salpicaduras doradas `#E8B881`) dentro de un stage `position:relative; width:280px; height:191px`. Sobre ella, 3 *pins* numerados (círculos 24px) posicionados absolutamente:
  - Pin **1** en la cabeza del dromedario — bg `#8E88C4` (lila) — regla *Paradójica*.
  - Pin **2** en el cajón — bg `#E8B881` (oro) — *Sensorial*.
  - Pin **3** en el escupitajo — bg `#8FB596` (verde) — *Con acción*.
  - Texto manuscrito "¡pfft!" (fuente **Caveat** 700, 26px, `#E8B881`, rotado -8º, animación `spitPop`) junto al escupitajo.
- **Leyenda · 3 reglas:** fila de 3 tarjetas iguales (`#FBF7F0`, border `1px #EBE4D7`, radius 15px). Cada una: círculo numerado (24px, colores 1=`#2B2752`, 2=`#C9823F`, 3=`#5C7A61`) + título Newsreader 17px + gloss Hanken 11.5px `#8B8174`. Contenido: **Paradójica** (imposible y ridícula) · **Sensorial** (se oye y se nota) · **Con acción** (algo te pasa).
- **Cierre (franja `#2B2752`, radius 18px):** círculo con estrella dorada + "Una historia memorable *para cada palabra*." (Newsreader 21px crema) + "Creada por nuestra IA, a tu medida." (Hanken 500, 12.5px, `#E8B881`).

### 4 · Demo (interactiva — el corazón)
Tres sub-estados controlados por `curatedStage` y `live`:

**A · Curado ("cajón" → "drawer"):**
- "¿Cómo se dice en inglés?" + mini-pantalla con "cajón" (Newsreader `clamp(44px,11vw,54px)`).
- Input de texto (`placeholder "Escríbela en inglés…"`, border `1.5px #DDD0BC`, radius 13px) + botón "No la sé".
- Al enviar: si el texto == "drawer" (normalizado, sin artículo) → **pantalla de éxito** (check verde `#5C7A61`, "¡Correcto!", "cajón" tachado → "drawer"). Si no → revela la **tarjeta de escena** completa.
- **Tarjeta de escena** (`#241F40`): "Cajón en inglés" + **drawer** (Newsreader `clamp(44px,12vw,58px)`) + pronunciación `/ˈdrɔː.ər/`. Tres pasos:
  - PASO 1 (píldora borde dorado): puente fonético `drawer → «dro» → DROmedario` ("DRO" resaltado en oro).
  - PASO 2 (píldora clara): ilustración + frase "Abres el cajón y un DROmedario asoma entre tus calcetines y braguitas y te escupe en plena cara." (palabra clave subrayada en oro).
  - PASO 3 (botón dorado `#E8B881`): "Cierra los ojos e imagínala" → `speechSynthesis` dice "drawer" en `en-US`.

**B · Selector (live):** 5 palabras preparadas — **armario, grifo, bañera, cojín, colchón** (píldoras `#EFE8DB`). El usuario elige una → "¿Cómo se dice en inglés?" → genera escena con IA.

**C · Generación con IA:** `window.claude.complete(prompt)` devuelve JSON `{ eng, hook, gloss, pron, scene }`. Loader con 3 mensajes rotando. **Timeout 13s** + **fallback** de plantilla pre-cocinada por palabra si la IA falla. La tarjeta resultante es idéntica a la curada + botón "Quédatela para siempre" → checkout.

> Prompt (resumen): pide traducir al inglés cotidiano, buscar 1-2 palabras españolas cuyo sonido imite al inglés (gancho), y montar UNA escena absurda, vívida y con acción. Responde solo JSON.

### 5 · La cuenta
- Fondo `#241F40`. Eyebrow crema translúcido "La cuenta es simple".
- Secuencia: **5 palabras/día** → **1.825 al año** → **con 1.500 ya hablas un idioma**. Cifras grandes en Newsreader, texto de apoyo en Hanken.

### 6 · Para todos los niveles ("El camino")
- Eyebrow "Desde cero hasta fluido" + H2 "Hay sitio para *todos los niveles*." + sub "Empiezas donde estás. Elephant sube contigo."
- **Recorrido horizontal:** una línea con 3 hitos (puntos que crecen de tamaño: 15/19/23px; el 3º dorado `#E8B881`, los otros índigo con anillo crema). Línea sólida índigo `#2B2752` 2px bajo los 3, luego **continuación punteada dorada** (`border-top:2px dotted #C9823F`) + flecha + etiqueta "SIN TECHO". Cada hito: cifra encima (2.000/3.000/+5.000) y nombre debajo (Principiante/Intermedio/Avanzado).

### 7 · La app por dentro
- Fondo `#EFE8DB`. Eyebrow "Así se ve por dentro" + H2 "Cinco minutos al día. *Memoria de años.*"
- **Mockup de app** (tarjeta `#FBF7F0`, radius 28px, border `1px #E8E1D3`, sombra `0 30px 60px -28px rgba(40,34,24,0.45)`, `max-width:340px`):
  - Header: logo "Elephant" + fecha "Martes, 22 jun".
  - **Sesión de hoy** (tarjeta oscura `#241F40`): "Tu sesión de hoy" + **5** (Newsreader 48px) "palabras nuevas" + "+ 15 para repasar · menos de 5 minutos" + botón dorado "Empezar".
  - **Progreso** (tarjeta blanca, border `1px #EDE6D8`, radius 20px): "Desde que empezaste" + **236** (Newsreader 56px `#2B2752`) "palabras ya son tuyas". Barra de progreso al nivel actual: pista `#ECE4D6` 10px, relleno 16% `#2B2752`, marcador dorado 14px con "16%" centrado encima; al final, nodo de meta + "1.500" encima + etiquetas "Principiante" (izq) / "Intermedio" (der, centrada sobre el nodo). El nodo final = subir de nivel.

### 8 · Por qué funciona
- `id="science"`. Eyebrow "Por qué «no» funciona" + H2 "Tu cerebro no olvida idiomas. *Olvida lo aburrido.*" Flecha → `scrollToId('proceso')`.

### 9 · Credibilidad
- Eyebrow "Lo que cuentan". 3 testimonios en tarjetas `#FBF7F0` (border `1px #EBE4D7`, radius 18px) **ligeramente rotadas** (`rotate(-1.6deg / 1.4deg / -0.8deg)`), texto Newsreader 19px + avatar inicial con color suave.

### 10 · La oferta
- "Elephant · acceso completo" + precio **59 €** / año (Newsreader `clamp(44px,10vw,52px)`). CTA → checkout. Chip "Garantía de 30 días" (icono candado). La palabra del usuario viaja al checkout.
- **Checkout overlay** (`#241F40`): resumen del plan + inputs (email, tarjeta, nombre y apellidos) + botón "Pagar" + "Pagos cifrados · cancela cuando quieras".
- **Éxito overlay**: check verde grande + "Bienvenido a Elephant." + línea personalizada con la palabra elegida + botón "Abrir Elephant".

---

## Interactions & Behavior
- **Navegación**: chevrons "nudge" llaman a `scrollToId(id)` → scroll suave (vertical) al elemento. En la versión review lado-a-lado también scrollea en horizontal.
- **Demo curada**: Enter o botón valida el input; "drawer" → éxito; otro → revela escena. Hay un "beat de silencio" de **2100 ms** antes de permitir revelar.
- **Demo live**: elegir palabra → `assoc` → `loading` (IA) → `done`. Fallback de plantilla si la IA falla o supera 13s.
- **Voz**: `speechSynthesis`, `lang='en-US'`, `rate=0.9`. Botón "Dilo en voz alta".
- **Checkout**: `goCheckout` pone `view='checkout'` y hace `scrollTo(0,0)`; "Pagar" → `view='success'`.
- **Animaciones / keyframes**: `reveal` (420ms `cubic-bezier(.16,1,.3,1)`), `fadeUp` (350ms ease), `nudge` (1.8s loop), `spin` (loader), `mqL`/`mqR` (marquesina), `spitPop` (el "¡pfft!"), `growBar`. Respeta `prefers-reduced-motion` (duraciones → 0.001ms).

## State Management
Clase de lógica (reimplementar en el framework destino). Variables clave:
```
view: 'landing' | 'checkout' | 'success'
curatedStage: 'input' | 'loading' | 'revealed' | 'success'
live: 'pick' | 'assoc' | 'loading' | 'done'
beatDone: boolean            // beat de 2.1s antes de revelar
reps: number                 // contador de la marquesina
userWord: string             // palabra española elegida en el selector
userAssoc: string            // intento del usuario en inglés
scene: { eng, hook, gloss, pron, scene } | null
```
Data fetching: **una sola** llamada a IA por palabra (`window.claude.complete`), con timeout 13s y fallback local. En producción, sustituir por el endpoint de IA del codebase (la forma de respuesta JSON es la misma).

## Design Tokens
**Color**
| Token | Hex | Uso |
|---|---|---|
| bg | `#F4EFE7` | Fondo base |
| bg-2 (beige) | `#EFE8DB` | Beats de contexto |
| card | `#FBF7F0` | Tarjetas claras |
| indigo | `#2B2752` | Acento primario / voz de marca |
| indigo-deep | `#241F40` | Tarjetas de escena / momentos oscuros |
| gold | `#E8B881` | Gancho fonético · CTA de voz · acentos (uso escaso) |
| ink | `#221C16` | Texto principal |
| text-2 | `#6E655A` | Texto secundario |
| muted | `#A99F90` / `#8B8174` / `#B0917E` | Eyebrows / apoyo |
| green | `#5C7A61` / `#8FB596` | Acierto / "con acción" |
| lilac | `#8E88C4` | Pin "paradójica" |
| terracota | `#BC5640` | Tachones/correcciones manuscritas (variante "divertida") |
| borders | `#E3DBCC` `#EBE4D7` `#E8E1D3` `#EDE6D8` `#DDD0BC` | Bordes y filetes |

**Tipografía**
- Display/cuerpo: **Newsreader** (serif, Google Fonts), pesos 300–600 + itálicas.
- UI/etiquetas: **Hanken Grotesk** (Google Fonts), pesos 400–700.
- Manuscrita (solo variante "divertida"): **Caveat** 600/700.
- Eyebrows: Hanken 600, 11–13px, `text-transform:uppercase`, `letter-spacing:0.14–0.22em`.

**Radii**: botones 12–16 · tarjetas 15–28 · marco de teléfono 36 · píldoras 999.
**Sombras**: marco teléfono `0 24px 60px -28px rgba(40,34,24,0.5)` · mockup `0 30px 60px -28px rgba(40,34,24,0.45)`.
**Ancho objetivo**: columna móvil `max-width:430px`; los tamaños usan `clamp()` acotado para ~430px.

**Prohibido** (decisiones de marca): gradientes de fondo · emojis (excepto 🔊 del CTA de voz) · rachas/leaderboards · Inter/Roboto.

## Assets
- **Todo el arte es SVG inline** (logo elefante, ilustraciones de escena por palabra estilo línea, iconos). No hay imágenes externas que portar.
- **Fuentes**: Google Fonts (Newsreader, Hanken Grotesk, Caveat).
- **Logo elefante** (viewBox `0 0 64 64`): dos orejas (elipses) + cuerpo/trompa (path). Disponible en los archivos para extraer.

## Files (en `designs/`)
- `Elephant App movil.dc.html` — **el flujo completo en una sola columna** (canónico para móvil). *Empieza por aquí.*
- `Elephant Pantallas lado a lado.dc.html` — las 10 pantallas en fila + **toda la lógica de estado y la demo interactiva** (la mejor referencia de comportamiento).
- `Elephant App.dc.html` — versión aislada y limpia de la pantalla 7. (Las pantallas 3 y 6 viven ya integradas dentro del archivo lado-a-lado.)
- `Elephant Brand Book.dc.html` — manual de marca (logo, color, tipografía, lenguaje de ilustración, motion, tokens).
- `support.js` — runtime para abrir los `.dc.html` en el navegador (no portar).
- `TRASPASO_ELEPHANT.md` — notas de diseño originales.

Para ver cualquier diseño: abrir el `.dc.html` en un navegador (necesita `support.js` al lado).

## Screenshots
`designs/screenshots/01..10` — captura de referencia de cada pantalla, en orden de scroll (01 La promesa … 10 La oferta). Muestran el objetivo visual; los valores exactos están en *Design Tokens* y en los `.dc.html`.
