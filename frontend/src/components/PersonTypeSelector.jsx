import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  SupportAgent as SupportIcon,
} from "@mui/icons-material";

const PersonTypeSelector = ({ onSelect, onCancel }) => {
  const personTypes = [
    {
      type: "Student",
      title: "Student",
      description:
        "Create a new student record with academic and personal details",
      icon: <SchoolIcon fontSize="large" />,
    },
    {
      type: "Warden",
      title: "Warden",
      description:
        "Create a new warden record with contact and assignment details",
      icon: <SupervisorIcon fontSize="large" />,
    },
    {
      type: "Attendant",
      title: "Attendant",
      description:
        "Create a new attendant record with duty and contact details",
      icon: <SupportIcon fontSize="large" />,
    },
  ];

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Select Person Type
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose the type of person you want to create
        </Typography>

        <Grid container spacing={3}>
          {personTypes.map((personType) => (
            <Grid item xs={12} sm={4} key={personType.type}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    {personType.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {personType.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {personType.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onSelect(personType.type)}
                  >
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonTypeSelector;
