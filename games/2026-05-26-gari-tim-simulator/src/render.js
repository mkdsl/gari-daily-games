// render.js — Typing effect, fade transitions, character name display
import { TYPING_SPEED } from './config.js';

let typingTimeout = null;
let isTyping = false;
let skipRequested = false;

export function startTyping(element, text, onComplete) {
  stopTyping();
  isTyping = true;
  skipRequested = false;
  element.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  element.appendChild(cursor);

  let i = 0;

  function typeChar() {
    if (skipRequested || i >= text.length) {
      // Complete immediately
      element.textContent = text;
      isTyping = false;
      if (onComplete) onComplete();
      return;
    }

    element.insertBefore(document.createTextNode(text[i]), cursor);
    i++;

    typingTimeout = setTimeout(typeChar, TYPING_SPEED);
  }

  typeChar();
}

export function stopTyping() {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  isTyping = false;
}

export function skipTyping() {
  skipRequested = true;
}

export function isCurrentlyTyping() {
  return isTyping;
}

export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  });
}

export function fadeOut(element, duration = 300) {
  return new Promise(resolve => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(resolve, duration);
  });
}

export function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function buildCharacterLabel(characterKey, charactersMap) {
  const char = charactersMap[characterKey];
  if (!char) return null;
  const span = document.createElement('span');
  span.className = `dialogue-speaker ${char.cssClass}`;
  span.textContent = char.name;
  return span;
}
