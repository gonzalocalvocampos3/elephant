# 🐘 Elephant

App de vocabulario que **no enseña inglés: hace que recuerdes una palabra durante años**,
combinando mnemotecnia (una escena absurda + un gancho fonético) con repetición espaciada.
*"Un elefante nunca olvida."*

## Estructura del repositorio
```
elephant/
├─ landing/      → web de marketing (la que funciona hoy). Demo guionizada, sin coste.
├─ design/       → referencia de diseño de Claude Design
│   ├─ prototypes/    (*.dc.html + support.js)
│   ├─ screenshots/   (01..10)
│   └─ TRASPASO_ELEPHANT.md
└─ docs/
    ├─ ARCHITECTURE.md → a dónde vamos (arquitectura final, tipo Duolingo)
    └─ ROADMAP.md      → el plan por fases hasta el lanzamiento mundial
```

## Empezar (la landing)
```bash
cd landing
node server.js     # http://localhost:3700
```
No necesita instalar dependencias.

## Cómo está pensado
- **`landing/`** valida el mensaje del producto. La "generación con IA" de la demo es un
  efecto: las escenas están pre-escritas (sin red ni coste).
- El producto completo (app móvil, cuentas, IA de producción, pagos) se construye **por fases**
  sobre esta misma base. Lee primero **[docs/ROADMAP.md](docs/ROADMAP.md)** y
  **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.
