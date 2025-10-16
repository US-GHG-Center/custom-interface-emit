class TrieNode {
  constructor() {
    this.children = {};
    this.isCompleteWord = false;
    this.payloads = [];
  }
}

export class TrieTree {
  constructor() {
    this.tireRoot = new TrieNode();
  }

  insert = (word, payload) => {
    let node = this.tireRoot;
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!(letter in node.children)) {
        node.children[letter] = new TrieNode();
      }
      node = node.children[letter];
    }
    node.isCompleteWord = true;
    if (!node.payloads.some((p) => p.id === payload.id)) {
      node.payloads.push(payload);
    }
  };

  search = (word) => {
    let node = this.tireRoot;
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!(letter in node.children)) {
        return [];
      }
      node = node.children[letter];
    }
    // now based off that node, do a dfs and then get all the complete word.
    let result = [];

    const dfs = (currentNode) => {
      if (!currentNode) {
        return;
      }

      if (currentNode.isCompleteWord) {
        result.push(...currentNode.payloads);
      }

      for (const child in currentNode.children) {
        dfs(currentNode.children[child]);
      }
    };

    dfs(node);
    return result;
  };
}
