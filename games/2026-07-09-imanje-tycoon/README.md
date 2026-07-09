# Standard Game Template

Ova skela je startna tačka svake dnevne igre. Jova (dev) kopira ovaj folder, preimenuje ga u `games/YYYY-MM-DD-naziv-igre/`, pa popunjava modul po modul.

## Šta radi van kutije

- ES6 moduli (import/export)
- responsive full-screen canvas
- game loop sa delta time
- save/load u localStorage (ključ `gari-daily-game`, versioned)
- input handling (kbd + mouse + touch, sa pressed/released detekcijom)
- HUD + menu overlay sa CSS-om
- ima mesto za audio, systems, entities, levels

## Šta Jova MORA da uradi

1. Kopira folder, preimenuje u `games/YYYY-MM-DD-slug/`
2. Preimenuje `manifest.json.template` u `manifest.json` i popuni vrednosti
3. Ažurira `index.html` title + meta
4. Popunjava config konstante iz Miletovog GDD-a
5. Proširi `state.js` shape po GDD-u
6. Implementira systems, entities, render po konceptu
7. Brend-ira UI preko Perinog CSS-a

## Pravilo

Ako modul nije potreban za ovaj konkretan žanr igre — **obriši ga**. Manifest.json mora da reflektuje šta STVARNO postoji u folderu.
