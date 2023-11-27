import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useDispatch, useSelector } from 'react-redux';
import { switchTheme, getTheme } from '../features/theme/themeSlice';
import "@fontsource/exo/700.css";

const Header = () => {
  const dispatch = useDispatch();
  const theme = useSelector(getTheme);

  const handleThemeChange = () => {
    dispatch(switchTheme());
  };

  return (
    <>
      <AppBar elevation={0} variant="dense" component="nav" sx={{ height: 60, backgroundColor: "background.contrast", zIndex: 9,  color: "#2d2e2e", borderBottom: 2, borderBottomColor: "#ff834f", position: "fixed" }}>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
          <div style={{ display: "inline-flex", height: "100%", alignItems: "center" }}>
            <QueryStatsIcon sx={{ mr: "5px", fontSize: 20, backgroundColor: "#ff834f", color: "white" }} />
            <Typography component="div" variant="h6" fontWeight="bold" fontFamily="Exo" sx={{ color: "text.secondary" }}>
              India Mutual Fund
            </Typography>
          </div>
          <IconButton aria-label="mode" sx={{ ml: "auto", fontSize: 24, color: "text.secondary" }} onClick={handleThemeChange}>
            {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Container>
      </AppBar>
    </>
  );
};

export default Header;
