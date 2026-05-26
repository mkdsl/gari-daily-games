// ui.js — renderScene(), renderNarration(), renderDialogue(), renderChoices(), renderShareCard(), showEnding()
import { CHARACTER_COLORS, CHOICE_KEYS, SCENE_LABELS } from './config.js';
import { startTyping, clearElement } from './render.js';
import { attachChoiceHandlers, attachContinueHandler } from './input.js';
import { AudioManager } from './audio.js';

const els = {
  narration: () => document.getElementById('narration-box'),
  dialogue:  () => document.getElementById('dialogue-box'),
  choices:   () => document.getElementById('choices-box'),
  shareCard: () => document.getElementById('share-card'),
  container: () => document.getElementById('scene-container'),
  loading:   () => document.getElementById('loading-overlay'),
};

export function hideLoading() {
  const el = els.loading();
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => { el.style.display = 'none'; }, 600);
  }
}

export function clearScene() {
  clearElement(els.narration());
  clearElement(els.dialogue());
  clearElement(els.choices());
}

export function renderNarration(text, onComplete) {
  const box = els.narration();
  clearElement(box);
  box.classList.add('scene-enter');
  setTimeout(() => box.classList.remove('scene-enter'), 400);
  startTyping(box, text, onComplete);
}

export function renderDialogueLine(speaker, text, container, onComplete) {
  const line = document.createElement('div');
  line.className = 'dialogue-line';

  if (speaker) {
    const char = CHARACTER_COLORS[speaker];
    const speakerEl = document.createElement('span');
    speakerEl.className = `dialogue-speaker ${char ? char.cssClass : ''}`;
    speakerEl.textContent = char ? char.name : speaker;
    line.appendChild(speakerEl);
  }

  const textEl = document.createElement('span');
  textEl.className = 'dialogue-text';
  line.appendChild(textEl);

  container.appendChild(line);

  startTyping(textEl, text, onComplete);
  return line;
}

export function renderDialogueSequence(lines, onAllComplete) {
  const box = els.dialogue();
  clearElement(box);

  function renderNext(index) {
    if (index >= lines.length) {
      if (onAllComplete) onAllComplete();
      return;
    }
    const { speaker, text } = lines[index];
    renderDialogueLine(speaker, text, box, () => {
      setTimeout(() => renderNext(index + 1), 80);
    });
  }

  renderNext(0);
}

export function renderChoices(choices, onChoice) {
  const box = els.choices();
  clearElement(box);

  const buttons = [];

  choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.key = choice.key || CHOICE_KEYS[i];
    btn.setAttribute('aria-label', `Opcija ${choice.key || CHOICE_KEYS[i]}: ${choice.text}`);

    const keySpan = document.createElement('span');
    keySpan.className = 'choice-key';
    keySpan.textContent = choice.key || CHOICE_KEYS[i];

    const textSpan = document.createElement('span');
    textSpan.className = 'choice-text';
    textSpan.textContent = choice.text;

    btn.appendChild(keySpan);
    btn.appendChild(textSpan);
    box.appendChild(btn);
    buttons.push(btn);
  });

  attachChoiceHandlers(buttons);

  // Wire to callback
  const { onChoiceSelected } = require_input_callback(onChoice);
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('disabled')) {
        onChoice(btn.dataset.key);
      }
    }, { once: true });
  });

  return buttons;
}

function require_input_callback(cb) {
  // Wrapper stub — actual attachment done in attachChoiceHandlers
  return { onChoiceSelected: cb };
}

export function renderContinueButton(label, callback) {
  const box = els.choices();
  clearElement(box);
  const btn = document.createElement('button');
  btn.className = 'continue-btn';
  btn.textContent = label || 'Nastavi →';
  box.appendChild(btn);
  attachContinueHandler(btn, callback);
  return btn;
}

export function fadeSceneOut(callback) {
  const container = els.container();
  container.classList.add('fading');
  setTimeout(() => {
    container.classList.remove('fading');
    if (callback) callback();
  }, 300);
}

export function showEnding(endingData, onRestart, onShare) {
  const shareCard = els.shareCard();
  shareCard.classList.remove('hidden');
  clearElement(shareCard);

  const inner = document.createElement('div');
  inner.className = 'share-card-inner';

  // Label
  const label = document.createElement('div');
  label.className = 'share-card-label';
  label.textContent = 'GARI TIM SIMULATOR — Kraj';

  // Ending title
  const title = document.createElement('div');
  title.className = 'share-card-ending-title';
  title.style.color = endingData.characterColor || '#E8E8E8';
  title.textContent = endingData.title;

  // Narration
  const narration = document.createElement('div');
  narration.className = 'share-card-narration ending-narration';
  narration.style.borderColor = endingData.characterColor || '#E8E8E8';
  narration.textContent = endingData.narration;

  // Share text
  const shareText = document.createElement('div');
  shareText.className = 'share-card-share-text';
  shareText.textContent = `"${endingData.shareText}"`;

  // Actions
  const actions = document.createElement('div');
  actions.className = 'share-card-actions';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn share-btn-primary';
  shareBtn.textContent = 'Podeli';
  shareBtn.addEventListener('click', () => onShare && onShare());

  const copyBtn = document.createElement('button');
  copyBtn.className = 'share-btn share-btn-secondary';
  copyBtn.textContent = 'Kopiraj tekst';
  copyBtn.addEventListener('click', () => {
    if (onShare) onShare('copy');
  });

  const restartBtn = document.createElement('button');
  restartBtn.className = 'share-btn share-btn-restart';
  restartBtn.textContent = 'Restartuj';
  restartBtn.addEventListener('click', () => onRestart && onRestart());

  // Copy feedback
  const feedback = document.createElement('div');
  feedback.className = 'copied-feedback';
  feedback.id = 'copy-feedback';

  actions.appendChild(shareBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(restartBtn);

  inner.appendChild(label);
  inner.appendChild(title);
  inner.appendChild(narration);
  inner.appendChild(shareText);
  inner.appendChild(actions);
  inner.appendChild(feedback);

  shareCard.appendChild(inner);

  AudioManager.playDing();
}

export function showLoseEnding(onRestart) {
  const narBox = els.narration();
  clearElement(narBox);
  narBox.textContent = 'Gari te gleda kratko. „Procić́aj nam email kad stigneš.“ Niko ne gleda gore. Sastanak se završava bez tebe.';

  const box = els.choices();
  clearElement(box);
  const btn = document.createElement('button');
  btn.className = 'continue-btn';
  btn.textContent = 'Restartuj';
  btn.addEventListener('click', () => onRestart && onRestart());
  box.appendChild(btn);
}
