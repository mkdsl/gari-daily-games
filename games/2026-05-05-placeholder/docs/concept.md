# Bespuće

## Žanr
Arkada + Roguelike mini

## Premisa
Lebdiš kroz proceduralno generisane ruševine starog sveta — brod bez motora, samo inercija i odbitak. Svaki let je jedinstven. Svaka smrt je permanentna. Svet pamti tvoje kosti ali ne i tvoje ime.

## Core Gameplay Loop
Igrač upravlja lebdećim brodom kroz hodnik ruševina — levo/desno, gore/dole, uz neizbežnu gravitaciju koja vuče nadole. Svakih 15-30 sekundi: izbeći zid ili prepreku (dodge), skupiti energetsku ćeliju (pickup), odabrati jedan od dva nasumična power-up-a na mini-checkpointu. Brzina raste. Hodnik mutira. Brod eksplodira. Počni ponovo — ali sa jednom trajnom nadogradnjom iz prethodnog runa.

## Hook
Svaki run traje 90 sekundi — ali ti uvek kažeš "još jedan" jer si prošli put bio tako blizu rekorda.

## Vizuelna Estetika
Tamna pozadina (#0a0a0f) sa neonskim rubovima zidova u electric plavo-ljubičastom (#4a9eff, #c244ff). Brod je geometrijska formacija — trougao sa plamenom thruster-a generisanim Canvas-om. Prepreke su prozirni poligoni sa outline-om, bez fill-a — kao hologrami. Particule eksplozije su sitni kvadratići koji lete na sve strane. "Dark sci-fi neon brutalist" — Tron sreo Geometry Dash u sivim cevima.

## Audio Mood
Proceduralni drum machine — kick na svake 4 beata, hi-hat koji ubrzava s nivoom, bass pulse koji drhti kad se premaši rekord. Web Audio API oscilatori: square wave za brod thrust, short sine burst za pickup, distorted sawtooth crash za smrt. Zvuk treba da pritiska grudi na velikoj brzini.

## Win Condition
Nema kraja — igra je beskonačna sa rastućom težinom. Cilj je najviši score (distanca × multiplier). Svaki run ostavlja "best ghost" senku koja se pojavljuje u sledećem runu. Meta napredak: 3 trajne nadogradnje između runova (max brzina, shield pulse, magnet za pickupe) koje se otključavaju skupljenim kristalima.

## Targetirana dužina sesije
5-8 minuta (3-5 runova po sesiji, svaki run 60-120 sekundi)
