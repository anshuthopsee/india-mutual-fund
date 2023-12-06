import { configureStore } from '@reduxjs/toolkit';
import themeReducer, { setTheme, } from './features/theme/themeSlice';
import searchReducer from './features/search/searchSlice';
import selectedReducer, { fetchMFData } from './features/selected/selectedSlice';
import drawerReducer from './features/drawer/drawerSlice';

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "selected/fetchMFData/pending" || 
    action.type === "selected/removeFund") {

    const selected = {
      schemeName: store.getState().selected.schemeName,
      schemeCode: store.getState().selected.schemeCode,
    };

    localStorage.setItem("selectedFund", JSON.stringify(selected));
  };

  if (action.type === "theme/switchTheme") {
    const theme = {
      mode: store.getState().theme.mode
    };

    localStorage.setItem("appTheme", JSON.stringify(theme));
  };

  return result;
};

const store = configureStore({
  reducer: {
    theme: themeReducer,
    search: searchReducer,
    selected: selectedReducer,
    drawer: drawerReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});

const savedSelectedFund = JSON.parse(localStorage.getItem("selectedFund"));
const savedAppTheme = JSON.parse(localStorage.getItem("appTheme"));

const presetFund = {
  schemeName: "HSBC Asia Pacific (Ex Japan) Dividend Yield Fund - Growth Direct",
  schemeCode: "127071"
};

store.dispatch(fetchMFData(savedSelectedFund || presetFund));

if (savedAppTheme) {
  store.dispatch(setTheme(savedAppTheme.mode));
};

export default store;
