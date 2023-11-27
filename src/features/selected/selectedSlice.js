import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';

const initialState = {
  schemeName: "",
  schemeCode: "",
  data: [],
  status: "idle", //'idle' | 'loading' | 'succeeded' | 'failed',
};

let fetchResponseTimer;

const showToast = (message, variant) => {
  enqueueSnackbar(message, { variant });
};

const clearToast = () => {
  clearTimeout(fetchResponseTimer);
};

export const fetchMFData = createAsyncThunk("selected/fetchMFData", async (fund) => {

  const options = {
    method: 'GET',
    url: `https://api.mfapi.in/mf/${fund.schemeCode}`,
  };

  const res = await axios.request(options);
  return res.data;
});

const selectedSlice = createSlice({
  name: 'selected',
  initialState,
  reducers: {
    setFunds: (state, action) => {
      state.fund = action.payload;
    },
    clearFunds: (state) => {
      state.fund = {};
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMFData.pending, (state, action) => {
        const schemeName = action.meta.arg.schemeName;
        const schemeCode = action.meta.arg.schemeCode;
        
        state.schemeName = schemeName;
        state.schemeCode = schemeCode;
        state.status = "loading";
        clearTimeout(fetchResponseTimer);
        fetchResponseTimer = setTimeout(() => {
          showToast("Data fetch taking longer than expected. Please wait", "info");
        }, 3000);
      })
      .addCase(fetchMFData.fulfilled, (state, action) => {
          state.data = action.payload.data;
          state.status = "succeeded";
          clearTimeout(fetchResponseTimer);
      })
      .addCase(fetchMFData.rejected, (state, action) => {
        state.status = "error";
        clearTimeout(fetchResponseTimer);
        showToast("Error in fetching data. Try refreshing the page", "error");
      });
  }
});

export const getSelectedFundStatus = (store) => store.selected.status;

export const getSelectedFundName = (store) => store.selected.schemeName;

export const getSelectedFundCode = (store) => store.selected.schemeCode;

export const getSelectedFundData = (store) => store.selected.data;

export const {  clearFunds, } = selectedSlice.actions;

export default selectedSlice.reducer;
