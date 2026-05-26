// dialogue.js — DialogueEngine
import { DIALOGUE_NODES } from '../content/dialogue_tree.js';
import { applyDelta } from './affinity.js';

export class DialogueEngine {
  constructor(state) {
    this.state = state;
    this.currentNodeId = null;
  }

  setNode(nodeId) {
    this.currentNodeId = nodeId;
  }

  getCurrentNode() {
    return DIALOGUE_NODES[this.currentNodeId] || null;
  }

  handleChoice(choiceIndex) {
    const node = this.getCurrentNode();
    if (!node || !node.choices) return null;
    const choice = node.choices[choiceIndex];
    if (!choice) return null;

    // Apply affinity delta
    if (choice.delta) applyDelta(this.state, choice.delta);

    // Apply flag
    if (choice.flag) {
      const [flagKey, flagVal] = choice.flag;
      this.state.flags[flagKey] = flagVal;
    }

    // Next node
    const next = choice.next;
    if (next) this.currentNodeId = next;
    return { next, choice };
  }

  processNode(nodeId) {
    this.currentNodeId = nodeId;
    return this.getCurrentNode();
  }
}
