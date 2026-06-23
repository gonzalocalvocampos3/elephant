# Elephant — Hoja de ruta (de la idea al lanzamiento mundial)

> Plan por **fases**. Cada fase se construye, se prueba y se valida antes de la siguiente.
> Arquitectura final en [ARCHITECTURE.md](./ARCHITECTURE.md).
> Estado: ✅ hecho · 🔭 en curso · ⬜ pendiente.

---

### Fase 0 · Landing de validación 🔭
**Objetivo:** explicar el producto y medir si engancha (antes de construir la app entera).
- Web estática con la demo guionizada (escenas fijas, sin IA ni coste) + checkout simulado.
- **Entregable:** landing publicada y compartible. **Carpeta:** `landing/`.
- **Tú necesitas:** nada (la publico en Cloudflare Pages como las otras webs).

### Fase 1 · MVP de la app (web + Gemini gratis, datos en el dispositivo) ⬜
**Objetivo:** validar el **bucle de memoria** real con usuarios (incluido tú).
- App web instalable: aprender palabra → captura → escena → repaso (pass/fail) → reprogramación.
- Motor de repetición espaciada + perfil de memoria, todo **en local** (sin cuentas).
- IA = **Gemini gratis** (vía el Worker que ya tienes), o escenas pre-cocinadas.
- **Entregable:** puedes aprender una palabra y que reaparezca a su tiempo. **Carpeta:** `apps/` (o un MVP web aparte).
- **Tú necesitas:** nada (Gemini gratis).

### Fase 2 · Núcleo de dominio + tests ⬜
**Objetivo:** blindar la "columna vertebral" para que sea portable y fiable.
- Scheduler (intervalos/stages) y profiler (epsilon-greedy) en TypeScript puro, con **tests**.
- **Entregable:** tests verdes del scheduler. **Carpeta:** `packages/core/`.

### Fase 3 · Backend real (Supabase) ⬜
**Objetivo:** cuentas de usuario, datos en la nube y sincronización entre dispositivos.
- Postgres + Auth + seguridad por usuario (RLS) + catálogo de palabras (seed).
- Migrar los datos locales del MVP al modelo en la nube.
- **Entregable:** inicio de sesión + tus datos te siguen en cualquier dispositivo. **Carpeta:** `supabase/`.
- **Tú necesitas:** crear una **cuenta de Supabase** (gratis para empezar). Te guío.

### Fase 4 · IA de producción ⬜
**Objetivo:** generación y diagnóstico de escenas con calidad de producto.
- Edge Functions (servidor) que llaman a **Anthropic** (`claude-sonnet-4-6`); clave solo en servidor.
- Generador (escena) + diagnóstico de fallo (cambia de modalidad) + perfil que aprende.
- **Entregable:** al fallar, aparece una escena de otra modalidad y el perfil se actualiza. **Carpeta:** `supabase/functions/`.
- **Tú necesitas:** una **clave de la API de Anthropic** y una tarjeta (coste por uso, céntimos al principio).

### Fase 5 · App nativa (Expo) ⬜
**Objetivo:** apps de verdad para iOS y Android (y web), publicables en las tiendas.
- Misma base de código (Expo + TypeScript) para los tres.
- **Entregable:** app instalable en tu móvil desde TestFlight / Play interno. **Carpeta:** `apps/mobile/`.
- **Tú necesitas:** cuentas de desarrollador (Apple ~99 $/año, Google ~25 $ una vez) cuando toque publicar.

### Fase 6 · Monetización (Stripe) ⬜
**Objetivo:** cobrar la suscripción (el checkout de la landing pasa a ser real).
- Stripe Checkout + gestión de suscripción + estados de cuenta (prueba/activo/cancelado).
- **Entregable:** un usuario puede pagar y desbloquear el acceso. 
- **Tú necesitas:** cuenta de **Stripe**.

### Fase 7 · Lanzamiento y escala ⬜
**Objetivo:** preparado para crecer a nivel mundial.
- **Analítica** del north-star (recuerdo 30/90d), retención y conversión.
- **Notificaciones push** (recordatorios de repaso).
- **Catálogo grande** de palabras y **más idiomas** (i18n).
- **CI/CD** (tests automáticos + despliegues), observabilidad, rendimiento y costes de IA.
- **Entregable:** producto público, estable y medible.

---

## Resumen del orden
**Landing (validar mensaje) → MVP del bucle (validar producto) → núcleo testeado → nube/cuentas
→ IA de producción → app nativa → pagos → escala/lanzamiento.**

Filosofía: **validar barato y pronto** en cada paso, y no construir la maquinaria cara (IA de
pago, apps nativas, infra) hasta que lo anterior demuestre que merece la pena.
