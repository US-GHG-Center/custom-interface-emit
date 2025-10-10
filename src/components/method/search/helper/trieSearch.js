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
    console.log({ items });
    // add items to the tire tree
    items.forEach((item) => {
      // here item is in the format CH4_PlumeComplex-<plume_id> <country>_<state>_<region>. e.g. "CH4_PlumeComplex-931 (United States_California_Valencia)"
      const original = String(item);
      const capitalizedItem = item.toUpperCase();

      this.trieTree.insert(capitalizedItem, original);
      // Algorithm:
      // basically we want to create tire tree for, all of these
      // <plume_id> <country>_<state>_<region>
      // <country>_<state>_<region>
      // <state>_<region>
      // <region>
      // <plume_id>

      //extract id from string
      const idMatch = original.match(/(\d+)(?!.*\d)/);
      if (idMatch) {
        const idToken = idMatch[0].toUpperCase();
        this.trieTree.insert(idToken, original);
      }

      // extract location inside parentheses if present
      const parenMatch = original.match(/\(([^)]+)\)/);
      if (parenMatch) {
        const locationRaw = parenMatch[1].trim(); // e.g. "United States California Valencia"
        const locationNormalized = locationRaw.toUpperCase();

        // Insert the full location string
        if (locationNormalized) {
          this.trieTree.insert(locationNormalized, original);
        }

        // Insert individual tokens (split on non-word chars) so "United" or  "States" or "California" or " Valencia" match
        const locTokens = locationNormalized
          .split(/[^A-Z0-9]+/)
          .filter(Boolean);
        locTokens.forEach((tok) => this.trieTree.insert(tok, original));

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
