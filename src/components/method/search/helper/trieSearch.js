import { TrieTree } from './trieTree';

/**
 * TrieSearch
 *
 * Manages a searchable trie index for plume identifiers.
 * Designed to support autocomplete-style prefix search on structured IDs.
 * For example: `Mexico_Durango_BV1_BV1-1` allows search by country, state, region, or plume ID.
 */

export class TrieSearch {
  constructor() {
    this.trieTree = new TrieTree();
  }

  addItems(items) {
    if (!items || !items.length) {
      return;
    }
    // add items to the tire tree
    items.forEach((item) => {
      // here item is in the format CH4_PlumeComplex-<plume_id> <country>_<state>_<region>. e.g. "CH4_PlumeComplex-931 (United States_California_Valencia)"
      const original = String(item);
      const capitalizedItem = item.toUpperCase();

      // Algorithm:
      // basically we want to create tire tree for, all of these
      // <plume_id> <country>_<state>_<region>
      // <country>_<state>_<region>
      // <state>_<region>
      // <region>
      // <plume_id>

      //insert only once in the trieTree
      const inserted = new Set();
      const insertOnce = (s) => {
        if (!s) return;
        const key = String(s).trim().toUpperCase();
        if (!key || inserted.has(key)) return;
        inserted.add(key);
        this.trieTree.insert(key, original);
      };

      insertOnce(capitalizedItem);

      //extract id from string
      const idMatch = original.match(/(\d+)(?!.*\d)/);
      if (idMatch) {
        const idToken = idMatch[0].toUpperCase();
        insertOnce(idToken);
      }

      // extract location inside parentheses if present
      const parenMatch = original.match(/\(([^)]+)\)/);
      if (parenMatch) {
        const locationRaw = parenMatch[1].trim(); // e.g. "United States California Valencia"
        const locationNormalized = locationRaw.toUpperCase();

        // Insert the full location string
        if (locationNormalized) {
          insertOnce(locationNormalized);
        }

        // Insert individual tokens (split on non-word chars) so "United" or  "States" or "California" or " Valencia" match
        const locTokens = locationNormalized
          .split(/[^A-Z0-9]+/)
          .filter(Boolean);
        locTokens.forEach((tok) => insertOnce(tok));

        // Insert individual tokens (split on non-word chars) so "United States California Valencia" or its _ variant  match
        for (let i = 0; i < locTokens.length; i++) {
          insertOnce(locTokens.slice(i).join(' '));
          if (locTokens.length > 1) insertOnce(locTokens.slice(i).join('_'));
        }
      }
    });
  }

  getRecommendations(prefix) {
    if (!prefix) {
      return [];
    }
    prefix = prefix.toUpperCase();
    // return all recommendations
    const results = this.trieTree.search(prefix);
    return [...new Set(results)];
  }
}
