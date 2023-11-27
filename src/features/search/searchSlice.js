import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showToast } from "../../utils";

const MFAPI_URL = import.meta.env.VITE_MFAPI_URL;

const initialState = {
  inputedText: "",
  results: [],
  memoizedResults: {}, /* { text: { results: [] } */
  status: "idle", //'idle' | 'loading' | 'succeeded' | 'failed',
  error: null,
};

let fetchResponseTimer;

export let controller;

export const fetchMFSearchResults = createAsyncThunk("search/fetchMFSearchResults", async (formattedText) => {
  controller = new AbortController();

  const options = {
    method: 'GET',
    url: MFAPI_URL+`search?q=${formattedText}`,
    signal: controller.signal
  };

  const res = await axios.request(options);
  return { text: formattedText, results: res.data };
});

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setInputedText(state, action) {
      const { text, loading } = action.payload;
      if (loading) {
        state.status = "loading";
      };
      state.inputedText = text;
      state.error = null;
    },
    setResults(state, action) {
      state.status = "succeeded";
      state.results = action.payload;
    },
    clearResults(state) {
      state.results = [];
      state.status = "idle";
    }
  },
  extraReducers(builder) {
    builder
    .addCase(fetchMFSearchResults.pending, (state) => {
      state.status = "loading";

      clearTimeout(fetchResponseTimer);
      fetchResponseTimer = setTimeout(() => {
        showToast("Search is taking longer than expected. Please wait", "info");
      }, 3000);
    })
    .addCase(fetchMFSearchResults.fulfilled, (state, action) => {
      const results = action.payload.results;
      state.status = "succeeded";
      const inputedText = state.inputedText.split(",")[0];
      if (inputedText === action.payload.text) {
        state.results = results;
      };
      state.memoizedResults = {...state.memoizedResults, 
        [action.payload.text]: results
      };
      state.error = null;

      clearTimeout(fetchResponseTimer);
    })
    .addCase(fetchMFSearchResults.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
      console.log(action.error.message)
      state.results = [];

      clearToast();
      if (action.error.message !== "canceled") {
        showToast("Something went wrong. Please try again", "error");
      };
    });
  }
});

export const getSearchStatus = (store) => store.search.status;

export const getSearchError = (store) => store.search.error;

export const getInputedText = (store) => store.search.inputedText;

export const { setInputedText, clearResults, setResults } = searchSlice.actions;

export const getResults = (store) => store.search.results;

export const getMemoizedResults = (store) => store.search.memoizedResults;

export default searchSlice.reducer;