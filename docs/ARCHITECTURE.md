# Elephant — Arquitectura objetivo (hacia un producto tipo Duolingo)

> Este documento describe **a dónde vamos** (el estado final, listo para lanzar a nivel
> mundial). No todo existe aún: se construye por fases (ver [ROADMAP.md](./ROADMAP.md)).
> La estructura de carpetas ya está preparada para crecer hasta aquí sin rehacer nada.

## Visión
Elephant no enseña inglés: hace que **recuerdes una palabra durante años**. El producto se
sostiene sobre tres pilares:
1. **Motor de repetición espaciada** (la columna vertebral, determinista y testeada).
2. **Generación de escenas mnemotécnicas con IA** (mnemotecnia + gancho fonético).
3. **Retención**: la métrica norte es el **recuerdo a 30/90 días**, no el tiempo de uso.

## Componentes del sistema (estado final)
| Componente | Tecnología | Para qué |
|---|---|---|
| **App** (móvil + web) | Expo (React Native) + TypeScript | iOS, Android y web desde un solo código. Es el producto. |
| **Landing / marketing** | Web estática (HTML/CSS/JS) → Cloudflare Pages | Captar y convertir. Rápida y con SEO. Separada de la app. |
| **Núcleo de dominio** | Paquete TypeScript puro (`packages/core`) | Scheduler + profiler + tipos. Sin UI ni red. Cubierto por tests. Compartido por app y backend. |
| **Base de datos + Auth** | Supabase (Postgres + Auth + RLS + Storage) | Cuentas de usuario, datos en la nube, sincronización entre dispositivos, seguridad por usuario. |
| **Lógica de servidor + IA** | Supabase Edge Functions (Deno + TS) | Llamadas al LLM con la **clave secreta solo en el servidor**. |
| **LLM** | Anthropic API (`claude-sonnet-4-6`) | Generar la escena y diagnosticar el fallo (cambiar de modalidad). |
| **Pagos** | Stripe (suscripción) | Plan anual. El checkout de la landing ya lo simula. |
| **Analítica** | Eventos + panel | Medir el north-star (recuerdo 30/90d), retención, conversión. |
| **Notificaciones** | Push (Expo Notifications) | Recordatorios de repaso "justo a tiempo". |
| **CI/CD** | GitHub Actions | Tests en cada cambio; despliegues a staging/prod. |

## Modelo de datos (Postgres, con RLS por usuario)
`words` (catálogo compartido) · `user_cards` (stage, due_at, state) · `associations`
(user_trigger, modality, scene, is_active) · `reviews` (log inmutable: result, latency,
stage_at_review) · `user_memory_profile` (aciertos/intentos por modalidad). *(Detalle en el
brief del proyecto.)*

## Estructura de carpetas objetivo (monorepo)
```
elephant/
├─ README.md
├─ docs/                     # documentación viva (esto)
│   ├─ ARCHITECTURE.md
│   └─ ROADMAP.md
├─ design/                   # referencia de diseño (Claude Design)
│   ├─ prototypes/  ·  screenshots/  ·  TRASPASO_ELEPHANT.md
├─ landing/                  # web de marketing (estática)  ← EXISTE
├─ packages/
│   └─ core/                 # dominio puro TS: scheduler, profiler, tipos + tests  ← Fase 2
├─ apps/
│   └─ mobile/               # app Expo (iOS/Android/web)  ← Fase 5
├─ supabase/                 # backend  ← Fase 3-4
│   ├─ migrations/           # SQL: tablas + RLS
│   ├─ functions/            # edge functions: generate-association, diagnose-and-regenerate
│   └─ seed/                 # catálogo de palabras
└─ .github/workflows/        # CI (tests, despliegues)  ← Fase 7
```
Hoy existen `landing/`, `design/` y `docs/`. El resto se crea en su fase, encajando en este
esqueleto.

## Principios de arquitectura (no negociables)
- **El dominio (scheduler/profiler) es puro y testeado**, separado de la UI y de la base de
  datos. Así migra entre stacks (del MVP a producción) sin reescribirse.
- **Las claves de IA y de pago viven solo en el servidor** (Edge Functions), nunca en la app.
- **North-star = recuerdo demorado (30/90 días)**. Nada de rachas/leaderboards como objetivo.
- **La landing es independiente** de la app (se despliega y evoluciona por separado).
