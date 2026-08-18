# Patch Queue — Crew Recruiter: Izgradi Ekipu

## Otvoreni patčevi

- [ ] P1 `src/systems/deck.js` + `src/state.js` — hand clearance regresija: `drawCards(n, state)` push-uje na `state.hand` bez prethodnog brisanja; ako `enterDrawPhase()` u main.js ne radi explicit `state.hand = []` pre poziva, svaka nova faza akumulira karte iz prethodne — posle 3 faze ruka prelazi 6 karata, UI puca i game flow je broken; verifikuj da `state.js resetForNewRun()` pokriva i međufazni hand clear, ne samo novi run

- [ ] P2 `src/ui/cards.js` + `src/input.js` — keyboard assign flow nepotvrdjen: Enter/Space šalje sintetički `PointerEvent` sa `clientX: 0, clientY: 0` koji ne aktivira `pointermove`-based drag; nije verifikovano da click-based tok (klik karte → klik slota) radi kao nezavisan fallback bez drag-a; potvrdi da flow prolazi end-to-end bez pointera, i dodaj keyboard hint u `src/ui/tutorial.js` korak 2 ako drag nije jedini put

- [ ] P2 `src/systems/ending.js` + `src/content/brand_hooks.js` — Guncati CTA nepotvrdjena: igra deklaruje `brand_serves: ["guncati"]` ali `getCTA(type, eventType)` i `brand_hooks.js` nisu verifikovani da vraćaju Guncati string ni za jedan `type`/`eventType` kombinaciju; proveri sve grane u `getCTA()`; ako Guncati CTA nedostaje, dodaj ga kao fallback za `eventType !== "outdoor"` (Guncati masterclass hook)

- [ ] P2 `src/config.js` — Vibe Start bez napetosti: `VIBE_START = 20` uz `CHURN_PENALTY = 3` i `EMPTY_SLOT_PENALTY` čini matematički crash u prvoj rundi skoro nemogućim — igrač nema razloga da pazi; podesi `VIBE_START = 30`, `CHURN_PENALTY = 4`, preračunaj `PHASE_THRESHOLDS` da oba kraja krive (legendary / crash) ostanu dostižni bez novih CRITICAL rizika

- [ ] P2 `styles/ui.css` — dva accessibility duga iz iter 1: (1) `.slot-label { font-size: 0.58rem }` — ~9px na 96dpi, ispod minimuma čitljivosti na low-DPI ekranima, podesi na `0.7rem`; (2) zaključane event type kartice koriste `aria-disabled` bez `disabled` atributa na `<button>` elementima — screen reader i keyboard fokus prolaze kroz zaključane opcije, dodaj `disabled` atribut uz `aria-disabled="true"`

## Završeni patčevi

(prazno — igra upravo released)
