import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import PersonList from "./components/PersonList";
import HostelList from "./components/HostelList";
import MessBillForm from "./components/MessBillForm";
import {
  StudentService,
  WardenService,
  AttendantService,
} from "./api/services";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleDeletePerson = async (person) => {
    try {
      switch (person.personType) {
        case "Student":
          await StudentService.delete(person.id);
          break;
        case "Warden":
          await WardenService.delete(person.id);
          break;
        case "Attendant":
          await AttendantService.delete(person.id);
          break;
        default:
          throw new Error("Invalid person type");
      }
      setSnackbar({
        open: true,
        message: `${person.personType} deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting person:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete ${person.personType}: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex" }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/persons"
                element={<PersonList onDelete={handleDeletePerson} />}
              />
              <Route path="/hostels" element={<HostelList />} />
              <Route path="/bills" element={<MessBillForm />} />
            </Routes>
          </Box>
        </Box>
      </Router>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
