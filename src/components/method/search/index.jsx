import { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { TrieSearch } from './helper/trieSearch';
import "./index.css"

/**
 * Search Component
 *
 * Provides a searchable autocomplete dropdown for STAC plume items using a trie-based prefix search.
 * Allows searching by a combination of location (country, state, region) and plume ID.
 *
 * @param {Object} props
 * @param {Array<Object>} props.vizItems - Array of STAC items to be indexed and searched.
 * @param {Function} props.onSelectedVizItemSearch - Callback invoked with `vizItemId` when a plume is selected.
 * @param {Function} props.setFromSearch - Toggles view state to indicate search-initiated navigation.
 *
 * @returns {JSX.Element}
 */
export function Search({ vizItems, onSelectedVizItemSearch, setFromSearch }) {
  /**
   * Creates searchable keys in the format:
   * `Plume ID: region_state_country_plumeID`
   */
  const ids = vizItems?.map((vizItem) => {
    const id = vizItem?.id
    const plumeId = vizItem?.plumeProperties?.plumeId;
    const location = vizItem?.plumeProperties?.location;
    const locationString = location
      ?.split(',')
      .reverse()
      .map((part) => part.trim())
      .join('_');
    const value = plumeId ? `${plumeId} (${locationString})` : String(id ?? "")
    return { id, value }
  });

  const trieSearch = useRef(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  /**
   * Performs prefix search using trie.
   * @param {string} prefix - User input
   * @returns {string[]} Array of matching entries
   */
  const handleSearch = (prefix) => {
    const searchResult = trieSearch.current.getRecommendations(prefix);
    return searchResult;
  };
  /**
   * When a user selects a search suggestion, notify parent with corresponding plume ID.
   */
  const handleOnInputTextChange = (event) => {
    const text = event.target.value;
    /**
     * Reset the search when the input text is cleared
     */
    if (text === '') {
      setFromSearch(false);
    }
    const searchResults = handleSearch(text);
    setSearchOptions(searchResults);
  };

  const handleOnOptionClicked = (event, clickedValue) => {
    if (!clickedValue) return;
    setSelectedOption(null); // reset to allow re-selection
    setSelectedOption(clickedValue);
    const vizItemId = clickedValue?.id
    setFromSearch(true);
    onSelectedVizItemSearch(vizItemId);
    setSelectedOption(null);
  };

  useEffect(() => {
    trieSearch.current = new TrieSearch();
    // id in ids are expected to be _ separated for better search result.
    if (ids && ids.length) trieSearch.current.addItems(ids);
  }, [ids]);

  return (
    <Autocomplete
      freeSolo
      id='free-solo-2-demo'
      disableClearable
      options={searchOptions}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option?.value)}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        if (typeof option === 'string' || typeof value === 'string') return option === value
        return option.id === value.id && option.value === value.value
      }}
      style={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          id='outlined-basic'
          label='Search by Plume ID or Location'
          variant='outlined'
          size="small"
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
          }}
          onChange={handleOnInputTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          InputLabelProps={{
            style: { color: 'grey !important', fontSize: '13px' },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "grey !important"
              },
              "&:hover fieldset": {
                borderColor: "grey !important"
              },

              "&.Mui-focused fieldset": {
                borderColor: "grey !important",
              }
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#808080 !important", // Replace with your desired color
            }
          }}
        />
      )}

      onChange={handleOnOptionClicked}
      value={selectedOption}
    />
  );
}
