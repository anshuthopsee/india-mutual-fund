import { createTheme } from '@mui/material/styles';

const components = {
  MuiAccordion: {
    styleOverrides: {
     root: {
       "&:before": {
         backgroundColor: "transparent",
       },
     },
    },
   },
};

const accent = {
  primary: "#ff834f",
  secondary: "#4cc257"
};

const lightTheme = createTheme({
  palette: {
    mode: 'light', // Enable light mode
    background: {
      default: '#ebebeb', // Set the background color for light mode
      contrast: "white",
      loading: "rgba(255, 255, 255, 0.5)"
    },
    text: {
      primary: "#000000",
      secondary: "#2e2d2d",
      tabsPrimary: "#ff834f",
      tooltip: "white"
    },
    border: {
      secondary: "#cccccc"
    },
    accent
  },
  components
});

// Define the dark mode theme (you can customize it as needed)
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Enable dark mode
    background: {
      default: '#0d0d0d', // Set the background color for dark mode
      contrast: "#1f1f1f",
      loading: "rgba(31, 31, 31, 0.5)"
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff",
      tabsPrimary: "#ff834f",
      tooltip: "black"
    },
    border: {
      secondary: "#494a49"
    },
    accent
  },
  components
});

export { lightTheme, darkTheme };