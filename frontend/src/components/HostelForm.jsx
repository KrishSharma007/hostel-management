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
import { HostelService } from "../api/services";
import LoadingOverlay from "./LoadingOverlay";

const initialFormState = {
  name: "",
  contactNo: "",
  address: {
    building: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  },
  rooms: {
    SINGLE: 0,
    DOUBLE: 0,
    TRIPLE: 0,
    DORMITORY: 0,
  },
};

const HostelForm = ({ hostel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hostel) {
      setFormData({
        name: hostel.name || "",
        contactNo: hostel.contactNo || "",
        address: {
          building: hostel.hostelAddress?.building || "",
          street: hostel.hostelAddress?.street || "",
          city: hostel.hostelAddress?.city || "",
          state: hostel.hostelAddress?.state || "",
          pincode: hostel.hostelAddress?.pincode || "",
          landmark: hostel.hostelAddress?.landmark || "",
        },
        rooms: {
          SINGLE:
            hostel.rooms?.filter((r) => r.roomType === "SINGLE").length || 0,
          DOUBLE:
            hostel.rooms?.filter((r) => r.roomType === "DOUBLE").length || 0,
          TRIPLE:
            hostel.rooms?.filter((r) => r.roomType === "TRIPLE").length || 0,
          DORMITORY:
            hostel.rooms?.filter((r) => r.roomType === "DORMITORY").length || 0,
        },
      });
    }
  }, [hostel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleRoomChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [type]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Validate contact number format
      if (
        formData.contactNo &&
        !/^\+?[1-9]\d{1,14}$/.test(formData.contactNo)
      ) {
        throw new Error("Invalid contact number format");
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(formData.address.pincode)) {
        throw new Error("Pincode must be a 6-digit number");
      }

      // Validate required address fields
      const requiredAddressFields = [
        "building",
        "street",
        "city",
        "state",
        "pincode",
      ];
      const missingFields = requiredAddressFields.filter(
        (field) => !formData.address[field]?.trim()
      );
      if (missingFields.length > 0) {
        throw new Error(
          `Required address fields missing: ${missingFields.join(", ")}`
        );
      }

      const data = {
        name: formData.name,
        contactNo: formData.contactNo || undefined,
        address: {
          building: formData.address.building.trim(),
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
          landmark: formData.address.landmark?.trim() || undefined,
        },
        rooms: {
          SINGLE: formData.rooms.SINGLE || 0,
          DOUBLE: formData.rooms.DOUBLE || 0,
          TRIPLE: formData.rooms.TRIPLE || 0,
          DORMITORY: formData.rooms.DORMITORY || 0,
        },
      };

      if (hostel) {
        await HostelService.update(hostel.id, data);
      } else {
        await HostelService.create(data);
      }
      onSubmit();
    } catch (err) {
      setError(err.message || "Failed to save hostel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {hostel ? "Edit Hostel" : "Add New Hostel"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hostel Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                helperText="Optional. Format: +91XXXXXXXXXX"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Building"
                name="building"
                value={formData.address.building}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Pincode"
                name="pincode"
                value={formData.address.pincode}
                onChange={handleAddressChange}
                placeholder="6 digit pincode"
                helperText="Must be 6 digits"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Landmark"
                name="landmark"
                value={formData.address.landmark}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Room Configuration
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Single Rooms"
                value={formData.rooms.SINGLE}
                onChange={(e) => handleRoomChange("SINGLE", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Double Rooms"
                value={formData.rooms.DOUBLE}
                onChange={(e) => handleRoomChange("DOUBLE", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Triple Rooms"
                value={formData.rooms.TRIPLE}
                onChange={(e) => handleRoomChange("TRIPLE", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Dormitory Rooms"
                value={formData.rooms.DORMITORY}
                onChange={(e) => handleRoomChange("DORMITORY", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
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
                  {hostel ? "Update Hostel" : "Create Hostel"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      {loading && (
        <LoadingOverlay
          message={hostel ? "Updating Hostel..." : "Creating Hostel..."}
        />
      )}
    </Box>
  );
};

export default HostelForm;
