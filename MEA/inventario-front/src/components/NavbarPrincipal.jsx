import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // camioncito

const colorPrimary = "#f4ce75";

export default function NavbarPrincipal() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navItems = [
    { label: "Inicio", path: "/", icon: <HomeIcon /> },
    { label: "Pedidos", path: "/pedidos", icon: <LocalShippingIcon /> }, // camioncito para pedidos
    { label: "Productos", path: "/productos", icon: <InventoryIcon /> },
  ];

  return (
    <AppBar
      position="relative"
      sx={{
        backgroundColor: "#fff",
        color: colorPrimary,
        mb: isMobile ? 2 : 0,
      }}
      elevation={1}
    >
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {navItems.map(({ path, icon, label }) => (
            <IconButton
              key={label}
              onClick={() => navigate(path)}
              sx={{ color: colorPrimary }}
              aria-label={label}
            >
              {icon}
            </IconButton>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
