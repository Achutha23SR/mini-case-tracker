import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1f6f5b" },
    secondary: { main: "#44546a" },
    background: { default: "#f6f7f9" }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  }
});
