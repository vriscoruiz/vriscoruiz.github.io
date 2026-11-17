# vrisco · Víctor Risco Ruiz

Portfolio personal de **Víctor Risco Ruiz**, técnico en sistemas y redes.

🌐 **Web:** https://vriscoruiz.github.io/

| | |
|---|---|
| 🎓 **SMX** | Grado Medio en Sistemas Microinformáticos y Redes · Institut Carles Vallbona · *Finalizado* |
| 🎓 **ASIX** | Grado Superior en Administración de Sistemas Informáticos en Red · Institut Carles Vallbona · *2º curso* |
| 💼 **Prácticas** | NTT DATA (ASIX, desde 06/2026) · Escola Pia Granollers (SMX, 2024–2025) |
| 📜 **Certificaciones** | Cisco CCST Networking · Cambridge B2 First · Cisco CCNA *(en preparación)* |
| 🗣️ **Idiomas** | Catalán y castellano (nativo) · Inglés (B2) |

## Contenido del repositorio

```
vriscoruiz.github.io/
├── index.html          ← la web (una sola página)
├── 404.html
├── assets/
│   ├── css/styles.css  ← estilos y colores (variables en :root)
│   ├── js/i18n.js      ← traducciones (catalán e inglés), terminal y lista de módulos
│   ├── js/main.js      ← tema, idioma, menú, línea de tiempo, filtros…
│   └── img/favicon.svg
├── SMX/                ← prácticas del Grado Medio, por módulos
└── ASIX/               ← prácticas del Grado Superior, por módulos
```

## Portfolio de prácticas

- [**SMX** · Sistemas Microinformáticos y Redes](./SMX/)
- [**ASIX** · Administración de Sistemas Informáticos en Red](./ASIX/)

## Cómo editar la web

- **Textos en castellano:** directamente en `index.html`.
- **Textos en catalán e inglés:** en `assets/js/i18n.js`, con la misma clave que el atributo `data-i18n` del HTML.
- **Colores:** variables al principio de `assets/css/styles.css` (`:root` para el tema oscuro y `[data-theme="light"]` para el claro).
- **Añadir un proyecto:** en la sección `07 PROYECTOS` de `index.html` hay una plantilla comentada; cópiala y rellénala.
- **Añadir prácticas:** súbelas a la carpeta del módulo (`SMX/MP05-Redes-locales/…`) y añade una fila a la tabla de su `README.md`.

Es HTML, CSS y JavaScript sin dependencias ni compilación: para verla en local basta con abrir `index.html` en el navegador.

## Publicar en GitHub Pages

*Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.*

---

[LinkedIn](https://www.linkedin.com/in/v%C3%ADctor-risco-ruiz-b4772a3b3/) · [GitHub](https://github.com/vriscoruiz)
