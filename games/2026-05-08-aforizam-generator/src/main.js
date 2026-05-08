import { generator } from './generator.js';
import { showAforizam, showAforizmImmediate } from './ui.js';
import { shareAforizam } from './share.js';
import { initInput } from './input.js';

document.addEventListener('DOMContentLoaded', () => {
  // Init generator, get first aforizam
  const first = generator.init();
  showAforizmImmediate(first);

  // Wire input handlers
  initInput(
    // onNext
    () => {
      const next = generator.next();
      showAforizam(next);
    },
    // onCopy
    () => {
      shareAforizam(generator.current);
    }
  );
});
