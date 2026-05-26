# Gari Tim Simulator — Premortem

## Šta može da krene naopako

1. **Dialogue tree complexity** — Scene 3 ima 4 verzije × 3 pitanja × 3 opcije = 36 node-ova samo tu. Rizik: greška u node linkovima.
2. **Affinity kalkulacija** — Endings logika je sekvencijalna (lose → E1 → E5 → E6 → E2/3/4). Rizik: pogrešan redosled proverava.
3. **Audio unlock** — Web Audio API zahteva user gesture. Rizik: ambient nikad ne startuje na mobilnom.
4. **Typing effect + skip** — Ako user klikne pre nego što tekst završi, mora se prikazati ceo tekst odmah. Rizik: race condition sa setInterval.
5. **Mobile touch targets** — Opcije moraju biti min 44px. Rizik: zaboraviti na kratkim labelama.
6. **LocalStorage kvote** — Flags history može rasti. Rizik: QuotaExceededError tiho guta greške.
7. **Share API fallback** — Web Share API nije dostupan svuda. Clipboard copy mora biti fallback.
