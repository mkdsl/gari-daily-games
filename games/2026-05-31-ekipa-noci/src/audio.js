// audio.js — Web Audio engine za Ekipa Noći
// Ceca Čujka, 2026-05-31
//
// Sve zvukove generišemo proceduralno — nula .mp3/.wav fajlova.
// AudioContext se kreira lazy (tek na prvi user klik) jer Safari/iOS
// blokira AudioContext koji nastane bez user gesture-a.

// --- INTERNI STATE ---

let ctx = null;          // AudioContext singleton
let compressor = null;   // Master DynamicsCompressorNode
let masterGain = null;   // Master gain pre kompresora

let lobbyOsc = null;     // Oscillator za lobby pulse
let lobbyGain = null;    // Gain koji se envelope-uje
let lobbyDelay = null;   // Delay za lo-fi feel
let lobbyDelayGain = null;
let lobbyRunning = false;

// --- INIT ---

/**
 * Kreira AudioContext i master output chain.
 * Mora se zvati iz user gesture handler-a (click/touch) — Safari/iOS zahtev.
 * Bezopasno ako se zove više puta (idempotentno).
 */
export function initAudio() {
  if (ctx) return; // već inicijalizovano

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    console.warn('[audio] Web Audio API nije podržan');
    return;
  }

  ctx = new AC();

  // Master kompressor — svi zvuci prolaze kroz njega da ne bi
  // pucali kard kad se više sound-ova preklapaju (npr. unlock + whoosh)
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;  // agresivno ali ne pumping
  compressor.knee.value = 6;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.15;
  compressor.connect(ctx.destination);

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(compressor);

  // iOS: kontekst može biti u "suspended" state-u čak i po kreiranju
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

// --- HELPER: provjeri da li je audio dostupan ---
function ready() {
  return ctx !== null && ctx.state !== 'closed';
}

// --- LOBBY BEAT ---

/**
 * Pokreće looping ambient lo-fi beat za lobby i ekrane između evenata.
 * Implementacija: spori sine pulse na ~80BPM (0.75s period) + lagani delay.
 * Gain je namerno nizak (0.07) da ne smeta vizuelnom čitanju karte.
 */
export function playLobbyBeat() {
  if (!ready() || lobbyRunning) return;
  lobbyRunning = true;

  const now = ctx.currentTime;

  // Spori bass-sine na 55 Hz — sub-bass frekvenca koja daje "weight"
  // bez toga bi beat zvučao tanko na mobilnim zvučnicima
  lobbyOsc = ctx.createOscillator();
  lobbyOsc.type = 'sine';
  lobbyOsc.frequency.setValueAtTime(55, now);

  // Drugi oscilator: lazy chord na 82 Hz (kvinta) za harmonski body
  const lobbyOsc2 = ctx.createOscillator();
  lobbyOsc2.type = 'sine';
  lobbyOsc2.frequency.setValueAtTime(82.4, now);

  lobbyGain = ctx.createGain();
  lobbyGain.gain.setValueAtTime(0, now);

  // Delay čvor za lo-fi echo feel — kratko vreme (160ms ≈ šesnaeestina na 80BPM)
  // daje prostornost bez pravog reverba (CPU heavy)
  lobbyDelay = ctx.createDelay(0.5);
  lobbyDelay.delayTime.value = 0.16;
  lobbyDelayGain = ctx.createGain();
  lobbyDelayGain.gain.value = 0.35; // feedback na 35% da ne postane mud

  // Biquad low-pass za lo-fi feel — reže sve iznad 800 Hz
  // lo-fi = nema visokih frekvenci, sve malo muffled
  const lofi = ctx.createBiquadFilter();
  lofi.type = 'lowpass';
  lofi.frequency.value = 800;
  lofi.Q.value = 0.7;

  // Graph: osc → gain → lofi → delay → delayGain ↩ (feedback loop)
  //                         ↓
  //                      masterGain
  lobbyOsc.connect(lobbyGain);
  lobbyOsc2.connect(lobbyGain);
  lobbyGain.connect(lofi);
  lofi.connect(masterGain);
  lofi.connect(lobbyDelay);
  lobbyDelay.connect(lobbyDelayGain);
  lobbyDelayGain.connect(lobbyDelay); // feedback
  lobbyDelayGain.connect(masterGain);

  lobbyOsc.start(now);
  lobbyOsc2.start(now);

  // Pulse envelope na 80BPM = 0.75s period
  // Gain skače na 0.07 pa polako pada — spori "heartbeat" feel
  _scheduleLobbyPulse(now);
}

function _scheduleLobbyPulse(startTime) {
  if (!lobbyRunning || !lobbyGain) return;

  const bpm = 80;
  const beat = 60 / bpm;   // 0.75s
  const pulse = beat * 2;  // svaki drugi beat = 1.5s period (sporiji, ambientalnije)

  // Koliko pulseva da zakažemo unapred — buffer od 8 sekundi
  // da Web Audio scheduler ne bude prazan
  const bufferBeats = Math.ceil(8 / pulse);
  let t = startTime;

  for (let i = 0; i < bufferBeats; i++) {
    lobbyGain.gain.setValueAtTime(0.0, t);
    lobbyGain.gain.linearRampToValueAtTime(0.07, t + 0.08);  // brzi napad
    lobbyGain.gain.exponentialRampToValueAtTime(0.001, t + pulse - 0.05); // spori decay
    t += pulse;
  }

  // Re-schedule svakih 6s da beat ne prestane
  const scheduleAgainIn = (bufferBeats * pulse - 2) * 1000;
  if (lobbyRunning) {
    setTimeout(() => {
      if (lobbyRunning && lobbyGain) {
        _scheduleLobbyPulse(ctx.currentTime);
      }
    }, Math.max(scheduleAgainIn, 500));
  }
}

/**
 * Zaustavlja ambient lobby loop sa blagim fade-out.
 */
export function stopLobbyBeat() {
  if (!lobbyRunning) return;
  lobbyRunning = false;

  if (!ready()) return;

  const now = ctx.currentTime;
  const fadeTime = 0.4;

  if (lobbyGain) {
    lobbyGain.gain.cancelScheduledValues(now);
    lobbyGain.gain.setValueAtTime(lobbyGain.gain.value, now);
    lobbyGain.gain.linearRampToValueAtTime(0, now + fadeTime);
  }

  // Disconnect posle fade-a da ne drži node-ove u memoriji
  setTimeout(() => {
    try {
      if (lobbyOsc) { lobbyOsc.stop(); lobbyOsc.disconnect(); }
      if (lobbyDelayGain) lobbyDelayGain.disconnect();
      if (lobbyDelay) lobbyDelay.disconnect();
    } catch (e) {}
    lobbyOsc = null;
    lobbyGain = null;
    lobbyDelay = null;
    lobbyDelayGain = null;
  }, (fadeTime + 0.1) * 1000);
}

// --- CARD WHOOSH ---

/**
 * Kratki whoosh zvuk pri hoveru/prevlačenju karte u draft fazi.
 * Sawtooth sweep od 200Hz→800Hz u 0.08s + brzi fade out.
 * Sawtooth (ne sine) jer nosi spektralni sadržaj koji zvuči kao vazdušni pokret.
 */
export function playCardWhoosh() {
  if (!ready()) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  // Visoki Q bandpass da izvuče taj "vazduh" iz sawtootha
  // bez filtera bi sawtooth zvučao preoštre, buzz-like
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 500;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.15);
}

// --- CARD SELECT ---

/**
 * Čvrsti "click" zvuk pri finalizaciji selekcije karte.
 * Kratki white-noise burst + sine transient — zvuči kao pritisak dugmeta
 * ali sa karakterom karte (malo "wooden").
 */
export function playCardSelect() {
  if (!ready()) return;

  const now = ctx.currentTime;

  // Sine transient — "tock" osnova
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.1);

  // Noise burst za click texture — buffer od 0.03s white noise
  const bufLen = Math.floor(ctx.sampleRate * 0.03);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 2000; // samo visoke frekvence buke = "snap" osećaj

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buf;
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSource.start(now);
}

// --- EVENT SUCCESS ---

/**
 * Pozitivan stinger po event resolve-u.
 * score 61–85: major chord C-E-G (523/659/784 Hz), 0.3s attack, 0.5s sustain, 0.2s decay
 * score 86–100: isti chord ali duži (1.5s) sa delay-based reverb simulacijom = "legenda" fanfare
 *
 * Major chord jer asocira na pobedu u svim zapadnim kulturama —
 * nema potrebe reinventovati nešto što mozak već zna da čita kao "uspeh".
 */
export function playEventSuccess(score) {
  if (!ready()) return;

  const isLegenda = score >= 86;
  const now = ctx.currentTime;

  // C-E-G na 5. oktavi (C5 = 523.25 Hz)
  // Kvinta (C-G) daje stabilnost, terca (C-E) daje brightness
  const chordFreqs = [523.25, 659.25, 783.99];
  const sustainTime = isLegenda ? 1.0 : 0.5;
  const decayTime  = isLegenda ? 0.5 : 0.2;
  const totalTime  = 0.3 + sustainTime + decayTime;

  const oscNodes = [];

  chordFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    // Treći ton (G) malo sinusoidniji — vrh chorda treba biti mekši
    osc.type = i === 2 ? 'sine' : 'triangle';
    osc.frequency.value = freq;

    // Malo detune po glasu da ne zvuči machine-perfect
    // Savršen unison zvuči jeftino/digitalno; lagani detune = živ
    osc.detune.value = (i - 1) * 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);   // attack
    gain.gain.setValueAtTime(0.12, now + 0.3 + sustainTime); // sustain
    gain.gain.exponentialRampToValueAtTime(0.001, now + totalTime); // decay

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + totalTime + 0.05);
    oscNodes.push({ osc, gain });
  });

  // Legenda mode: delay reverb sim — isti chord čujemo "odjekuje"
  if (isLegenda) {
    _addReverbTail(chordFreqs, now, sustainTime, decayTime);
  }
}

// Reverb simulacija kroz dva delay čvora sa različitim temporary — zvuči
// kao mali hall reverb ali bez ConvolverNode koji je CPU heavy na mobilnom
function _addReverbTail(freqs, now, sustainTime, decayTime) {
  const delays = [0.08, 0.17]; // dva refleksiona puta

  delays.forEach((delayTime, di) => {
    freqs.forEach((freq, fi) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (fi - 1) * 2;

      const delay = ctx.createDelay(0.3);
      delay.delayTime.value = delayTime;

      const reverbGain = ctx.createGain();
      // Svaki odbijeni zvuk je tiši — simulacija gašenja energije u prostoru
      const tailGain = 0.04 / (di + 1);
      const startTime = now + delayTime;
      reverbGain.gain.setValueAtTime(0.0, startTime);
      reverbGain.gain.linearRampToValueAtTime(tailGain, startTime + 0.3);
      reverbGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3 + sustainTime + decayTime);

      osc.connect(delay);
      delay.connect(reverbGain);
      reverbGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3 + sustainTime + decayTime + 0.1);
    });
  });
}

// --- EVENT KIKS (fail) ---

/**
 * Negativan stinger — score 0–30: minor chord sa distorzijom, "oops" energy.
 * A minor (A-C-E, 220/261/330 Hz) — minor tercа asocira na neuspeh.
 * Distorzija dodaje "loše" teksture — nije gruba, ali ima edge koji
   asocira na grešku/napetost pre nego na harmoničnost.
 */
export function playEventKiks() {
  if (!ready()) return;

  const now = ctx.currentTime;

  // A minor chord na 3. oktavi — niže frekvencije od success-a
  // Niže = teže, mračnije, kontrast prema success-u koji je viši
  const minorFreqs = [220.0, 261.63, 329.63];

  minorFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; // sawtooth zvuči grublje od triangle — odgovara "kriza" momentu
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * -8; // detuning u suprotnom smeru od success = "van tone"

    // WaveShaper za "soft distortion" — ne kliping, nego harmonsko zasićenje
    // daje taj "oops" karakter bez zvučanja preterano harshly
    const distortion = ctx.createWaveShaper();
    distortion.curve = _makeDistortionCurve(50);
    distortion.oversample = '2x';

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.setValueAtTime(0.1, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.65);
  });

  // Pitch drop na kraju — "wah wah" konačnost
  const dropOsc = ctx.createOscillator();
  dropOsc.type = 'sine';
  dropOsc.frequency.setValueAtTime(220, now + 0.15);
  dropOsc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

  const dropGain = ctx.createGain();
  dropGain.gain.setValueAtTime(0.0, now + 0.15);
  dropGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
  dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

  dropOsc.connect(dropGain);
  dropGain.connect(masterGain);
  dropOsc.start(now + 0.15);
  dropOsc.stop(now + 0.7);
}

// WaveShaper curve za soft distortion — tanh-like sigmoid
// Vrednost amount određuje "koliko" zasićenja: 50 = middle ground
function _makeDistortionCurve(amount) {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// --- UNLOCK CARD ---

/**
 * Ascending arpeggio, 3–4 tona, bright — kada se otključa nova karta.
 * C-E-G-C (523→659→784→1046 Hz) — oktavni skok na kraju pojačava "otvorenost".
 * Svaki ton ulazi sa malo delay-a da bude arpeggio, ne simultani chord.
 */
export function playUnlockCard() {
  if (!ready()) return;

  const now = ctx.currentTime;

  // Bright major arpeggio — C pentatonic ascending
  // Pentatonic jer nema disonantnih polustepena, uvek zvuči "ispravno"
  const arpeggioFreqs = [523.25, 659.25, 783.99, 1046.5];
  const noteStep = 0.09; // vreme između tonova u arpeggiu

  arpeggioFreqs.forEach((freq, i) => {
    const startAt = now + i * noteStep;

    const osc = ctx.createOscillator();
    osc.type = 'triangle'; // triangle = čist ali sa harmonicima; sintel zvuči previše prazno
    osc.frequency.value = freq;

    // Vibrato na poslednji ton — malo oscilovanje frekvence daje "sjaj"
    if (i === arpeggioFreqs.length - 1) {
      const vibratoOsc = ctx.createOscillator();
      vibratoOsc.type = 'sine';
      vibratoOsc.frequency.value = 6; // 6 Hz vibrato
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.value = 8; // ±8 cents dubina
      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibratoOsc.start(startAt);
      vibratoOsc.stop(startAt + 0.5);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, startAt);
    gain.gain.linearRampToValueAtTime(0.15, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.35);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startAt);
    osc.stop(startAt + 0.4);
  });
}

// --- LOCKED CARD (nema budžeta) ---

/**
 * Subtle thud / mute zvuk kad igrač pokuša da uzme kartu bez budžeta.
 * Kratki low-pass filtered noise burst + low sine thud.
 * Zvuči kao karton koji udara o sto — fizički, muffled, ne alarm.
 */
export function playLockedCard() {
  if (!ready()) return;

  const now = ctx.currentTime;

  // Low "thud" sine — 80Hz je frekvenca koja se oseća više nego čuje
  // (sub-bass udarac) — fizički feedback bez iritacije
  const thud = ctx.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(90, now);
  thud.frequency.exponentialRampToValueAtTime(40, now + 0.1);

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.0, now);
  thudGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  thud.connect(thudGain);
  thudGain.connect(masterGain);
  thud.start(now);
  thud.stop(now + 0.2);

  // Kratki muffled noise — paper/cardboard texture
  const bufLen = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  // Lowpass agresivno reže — samo niski "thump" bez brightness
  const muteFilter = ctx.createBiquadFilter();
  muteFilter.type = 'lowpass';
  muteFilter.frequency.value = 200;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.08, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buf;
  noiseSource.connect(muteFilter);
  muteFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSource.start(now);
}

// --- TOUR END ---

/**
 * Finalni fanfare proporcionalan Tour Score-u (zbir svih Event Score-ova).
 * Tri nivoa:
 *   tourScore < 200  → kratki single chord (tiho + brzo)
 *   tourScore 200-349 → success-like fanfare
 *   tourScore >= 350  → legenda tier: dugi fanfare + reverb tail
 *
 * Legenda tier ide na D major chord (D-F#-A, 587/740/880 Hz) —
 * D major je standardna fanfare tonalnost (brass fanfara, think F1, Olimpijada).
 */
export function playTourEnd(tourScore) {
  if (!ready()) return;

  const now = ctx.currentTime;

  if (tourScore >= 350) {
    // LEGENDA: dug, D major, reverb tail, na 1.5x glasnoće vs normal
    _playFanfareChord(now, [587.33, 739.99, 880.0], 1.5, true);
    // Drugi chord posle 1.2s za "epilog" osećaj
    setTimeout(() => {
      if (ready()) _playFanfareChord(ctx.currentTime, [659.25, 880.0, 1046.5], 1.2, false);
    }, 1200);
  } else if (tourScore >= 200) {
    // DOBRO: standardni fanfare, C major
    _playFanfareChord(now, [523.25, 659.25, 783.99], 1.0, false);
  } else {
    // SLABO: jedva čujan kratki chord, bez fanfara
    // Igrač treba da oseća da nije baš uspeo
    _playFanfareChord(now, [523.25, 659.25, 783.99], 0.5, false);
  }
}

function _playFanfareChord(now, freqs, gainMultiplier, withReverb) {
  const attackT  = 0.15;
  const sustainT = 0.9;
  const decayT   = 0.45;
  const totalT   = attackT + sustainT + decayT;

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'triangle';
    // Sawtooth na basu = horn-like fundament; triangle na harmonicima = sjaj
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * 4;

    const gain = ctx.createGain();
    const peak = 0.13 * gainMultiplier;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(peak, now + attackT);
    gain.gain.setValueAtTime(peak, now + attackT + sustainT);
    gain.gain.exponentialRampToValueAtTime(0.001, now + totalT);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + totalT + 0.1);
  });

  if (withReverb) {
    _addReverbTail(freqs, now, sustainT, decayT);
  }
}
