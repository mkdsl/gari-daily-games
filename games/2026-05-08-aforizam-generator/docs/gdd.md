# GDD — Aforizam Generator
**Verzija:** 1.0 | **Datum:** 2026-05-08 | **Balancer:** Mile Mehanika

---

## 1. Aforizam Bank Specifikacija

### Broj po kategoriji
| Kategorija | Broj |
|---|---|
| Ljubav / Odnosi | 12 |
| Grad / Ulica | 10 |
| Noć / Klub (novo) | 12 |
| Ples / Ritam (novo) | 10 |
| Filozofija / Apsurd | 8 |
| **UKUPNO** | **52** |

### Style guide — Pera Period glas (za Jovu koji piše nove kategorije)

**Pera Period JESTE:**
- Kratka rečenica koja zvuči kao da je neko već dugo razmišljao, pa odustao. Max 15 reči.
- Kontrast između banalne situacije i pretencioznog zaključka — ili obrnuto.
- Glagol u prezentu, direktno obraćanje ili apstraktni subjekt ("Ritam", "Noć", "DJ").
- Lagana ironija koja ne eksplodira — samo zubom pipne.

**Pera Period NIJE:**
- Motivacijski poster. Nema "veruj u sebe", nema "zaslužuješ bolje".
- Rima. Nikad.
- Više od jedne ideje po aforizmu.
- Anglicizmi osim kad su jedina opcija ("DJ", "vibe" samo ako rečenica ne funkcioniše bez).

### Primeri — Noć / Klub (za stil referencu)
1. "DJ je jedini čovek koji zna šta nam treba pre nego što to znamo mi."
2. "Klub se puni do tri. Posle tri, samo ostaju oni koji nemaju kuda."
3. "Subwoofer ne laže. Sve ostalo — možda."
4. "Noć koja počne u deset, završi se ujutru bez dogovora."
5. "Svaki drop je obećanje koje beat drži bolje od ljudi."

### Primeri — Ples / Ritam (za stil referencu)
1. "Noge znaju puteve koje glava još nije ucrtala."
2. "Ritam nije metronomski. On čeka tvoj loš korak i prihvata ga."
3. "Pleše se ili ne pleše. Treće je samo čekanje."
4. "Telo pamti muziku duže nego što mozak pamti reči."
5. "Svaki ples je kratak. Zato ga niko ne žali."

---

## 2. Selekcija Mehanika

### Fisher-Yates Shuffle (pseudo-kod)
```
function shuffle(arr):
    i = arr.length
    while i > 0:
        j = floor(random() * i)
        i -= 1
        swap(arr[i], arr[j])
    return arr
```

### Session tracking
- `sessionQueue = shuffle([...allAphorisms])` — kreira se jednom na page load.
- `pointer = 0` — pomera se +1 na svaki klik.
- Prikazuje se `sessionQueue[pointer]`.
- **Reset uslov:** kad `pointer >= sessionQueue.length` → `sessionQueue = shuffle([...allAphorisms])`, `pointer = 0`.
- **Auto-load:** na `DOMContentLoaded` prikazuje `sessionQueue[0]`, `pointer = 1`.

---

## 3. Share Mehanika — Opcija B (odabrana)

**Pristup:** `navigator.clipboard.writeText(aforizam + " — Pera Period × Kluboslavija")`

**Zašto B, ne A:**
- Canvas + `toBlob()` zahteva async permission na iOS Safari — puca u 15% slučajeva.
- IG Stories prihvata plain text paste; watermark u tekstu je funkcionalan i čitljiv.
- Implementacija: 4 linije koda. Canvas rešenje: 40+ linija, 3 edge case-a.
- Trade-off prihvatljiv jer je win condition share, ne vizualni branding.

**Implementacija:**
```
onShareClick:
    text = currentAforizam + " — Pera Period × Kluboslavija"
    navigator.clipboard.writeText(text)
    showToast("Kopirano! Nalepi u IG story.", 2000ms)
```

**Mobilno:** `navigator.clipboard` radi na iOS 13.4+ i Android Chrome 66+. Fallback: `document.execCommand('copy')` na starijim.

---

## 4. UI States

| State | Opis |
|---|---|
| `idle` | NE POSTOJI — app odmah ulazi u `showing` na load |
| `showing` | Aforizam vidljiv, dugmad "Sledeći" i "Kopiraj" aktivna |
| `transitioning` | Fade out → swap teksta → fade in, dugmad `pointer-events: none` |

---

## 5. Pacing

| Parametar | Vrednost |
|---|---|
| Fade out trajanje | 200ms |
| Fade in trajanje | 300ms |
| Ukupna tranzicija | 500ms |
| Debounce (min vreme pre sledećeg klika) | 600ms (blokira se tokom `transitioning`) |
| Session kapacitet pre reset-a | 52 aforizama (ceo pool) |

---

## 6. Animacija Spec (za CSS)

**Fade mehanika:** Card se NE "odlazi" — tekst se prepiše na istom mestu.
```css
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
```
Sekvenca: `fadeOut 200ms` → `textContent = noviAforizam` → `fadeIn 300ms`.

**Tipografija:**
| Breakpoint | Font size |
|---|---|
| Mobilno (< 480px) | `5.5vw` (min 18px) |
| Tablet (480–768px) | `3.5vw` |
| Desktop (> 768px) | `28px` |

**Font:** serif, italic. Line-height: 1.5. Max-width: 640px, centrirano.

---

*GDD je operativan. Nema otvorenih pitanja. Jova, kodiraš direktno iz ovoga.*
