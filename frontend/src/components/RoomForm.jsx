import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { RoomService } from "../api/services";

const initialFormState = {
  roomType: "SINGLE",
  capacity: 1,
  furnitureDetails: "",
};

const RoomForm = ({ room, hostelId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (room) {
      setFormData({
        roomType: room.roomType,
        capacity: room.capacity,
        furnitureDetails: room.furnitureDetails || "",
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        hostelId,
      };

      if (room) {
        await RoomService.update(room.id, data);
      } else {
        await RoomService.create(data);
      }
      onSubmit();
    } catch (err) {
      setError(err.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {room ? "Edit Room" : "Add New Room"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  name="roomType"
                  value={formData.roomType}
                  label="Room Type"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="SINGLE">Single</MenuItem>
                  <MenuItem value="DOUBLE">Double</MenuItem>
                  <MenuItem value="TRIPLE">Triple</MenuItem>
                  <MenuItem value="DORMITORY">Dormitory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Furniture Details"
                name="furnitureDetails"
                value={formData.furnitureDetails}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : room ? (
                    "Update Room"
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RoomForm;
