import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResults, fetchMFSearchResults, getInputedText, getSearchStatus, getMemoizedResults, setResults, clearResults, setInputedText, controller } from '../features/search/searchSlice';
import { getSelectedFundName, fetchMFData } from '../features/selected/selectedSlice';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';

const Search = () => {
  const dispatch = useDispatch();
  const fetchStartTimerRef = useRef(null);
  const memoizedTimerRef = useRef(null);
  const inputedText = useSelector(getInputedText);
  const results = useSelector(getResults);
  const searchStatus = useSelector(getSearchStatus);
  const memoizedResults = useSelector(getMemoizedResults);
  const fundName = useSelector(getSelectedFundName);

  const handleChange = (e) => {
    const text = e.target.value.trimStart().replace(/\s+/g, " ");

    clearTimeout(fetchStartTimerRef.current);
    clearTimeout(memoizedTimerRef.current);

    if (text.length === 0) {
      dispatch(setInputedText({ text, loading: true}));
      dispatch(clearResults());

    } else if (memoizedResults[text]) {
      dispatch(setInputedText({ text, loading: true}));
      memoizedTimerRef.current = setTimeout(() => {
        dispatch(setResults(memoizedResults[text]));
      }, 100);

    } else {
      if (controller) {
        controller.abort();
      };

      if (text.length > 1) {
        dispatch(setInputedText({ text, loading: true}));
        fetchStartTimerRef.current = setTimeout(() => {
          dispatch(fetchMFSearchResults(text));
        }, 600);

      } else {
        dispatch(setInputedText({ text, loading: false}));
        dispatch(clearResults());
      };
    };
  };

  const handleFundSelect = (e, option) => {
    if (option.schemeName !== fundName) {
      dispatch(fetchMFData({...option}));
    };
  };

  return (
    <Box spacing={2} sx={{ width: "100%", mb: "10px", position: "relative", p: "7px" , display: "flex", justifyContent: "center", flexDirection: "column", backgroundColor: "background.contrast", borderRadius: "5px" }}>
      <Autocomplete
        size='small'
        id="mutual-fund-search"
        freeSolo
        forcePopupIcon
        disableClearable
        options={results}
        inputValue={inputedText}
        getOptionLabel={(option) => option.schemeName}
        onChange={handleFundSelect}
        filterOptions={(options) => options}
        noOptionsText={searchStatus === "loading" ? "Loading..." : "No results"}
        renderInput={(params) => (
          <TextField
            {...params}
            onChange={(handleChange)}
            label="Search mutual funds"
            InputProps={{
              ...params.InputProps,
            }}
            sx={{ 
              backgroundColor: "background.contrast", 
              '& fieldset': {
                borderRadius: "5px",
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const isSelected = option.schemeName === fundName;
          return (
            <Box key={option.schemeName} {...props} sx={{ position: "relative", width: "100%", pointerEvents: isSelected ? "none" : "auto", borderBottom: 1, borderBottomColor: "border.secondary" }}>
              <span>{option.schemeName}</span>
              {isSelected ?
                <CheckIcon sx={{ marginLeft: "auto", color: "accent.secondary" }} /> :
                <AddIcon sx={{ marginLeft: "auto", color: "text.secondary" }} />
              }
            </Box>
          );
        }}
      />
      {searchStatus === "loading" ? 
        <CircularProgress size="1.2rem" sx={{ position: "absolute", right: "40px" }} /> : 
        <SearchIcon sx={{ position: "absolute", right: "45px", fontSize: "18px" }} />
      }
    </Box>
  );
};

export default Search;