// dialogue.js — DialogueEngine: processNode(), getCurrentNode(), handleChoice()
import { DIALOGUE_NODES } from '../content/dialogue_tree.js';
import { applyDelta } from './affinity.js';

export const DialogueEngine = {
  currentNodeId: null,
  state: null,

  init(state) {
    this.state = state;
  },

  setNode(nodeId) {
    this.currentNodeId = nodeId;
  },

  getCurrentNode() {
    if (!this.currentNodeId) return null;
    return DIALOGUE_NODES[this.currentNodeId] || null;
  },

  processNode(nodeId) {
    this.currentNodeId = nodeId;
    return this.getCurrentNode();
  },

  handleChoice(choiceKey) {
    const node = this.getCurrentNode();
    if (!node || !node.choices) return null;

    const choice = node.choices.find(c => c.key === choiceKey);
    if (!choice) return null;

    // Apply affinity delta
    if (choice.delta && this.state) {
      applyDelta(this.state, choice.delta);
    }

    // Apply flags
    if (choice.flags && this.state) {
      Object.assign(this.state.flags, choice.flags);
    }

    // Navigate to next node
    this.currentNodeId = choice.next || null;
    return choice;
  },

  hasChoices() {
    const node = this.getCurrentNode();
    return node && node.choices && node.choices.length > 0;
  },
};
