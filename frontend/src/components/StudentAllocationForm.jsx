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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { HostelService, StudentService } from "../api/services";

const StudentAllocationForm = ({ student, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    contactNo: student?.contactNo || "",
    emergencyContact: student?.emergencyContact || "",
    fatherContact: student?.fatherContact || "",
    motherContact: student?.motherContact || "",
    personalAddress: {
      hNo: student?.personalAddress?.hNo || "",
      street: student?.personalAddress?.street || "",
      city: student?.personalAddress?.city || "",
      state: student?.personalAddress?.state || "",
      pincode: student?.personalAddress?.pincode || "",
    },
    hostelId: "",
    roomId: "",
    academicYear:
      new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    startDate: new Date().toISOString().split("T")[0],
  });
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (formData.hostelId) {
      fetchAvailableRooms(formData.hostelId);
    } else {
      setRooms([]);
    }
  }, [formData.hostelId]);

  const fetchHostels = async () => {
    try {
      const data = await HostelService.getAll();
      setHostels(data);
    } catch (err) {
      setError("Failed to fetch hostels");
      console.error(err);
    }
  };

  const fetchAvailableRooms = async (hostelId) => {
    try {
      const data = await HostelService.getRooms(hostelId);
      // Filter out rooms that are fully occupied
      const availableRooms = data.filter((room) => {
        const occupiedCount =
          room.allocations?.filter((a) => !a.endDate)?.length || 0;
        return occupiedCount < room.capacity;
      });
      setRooms(availableRooms);
    } catch (err) {
      setError("Failed to fetch rooms");
      console.error(err);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Handle nested personalAddress fields
    if (name.startsWith("personalAddress.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        personalAddress: {
          ...prev.personalAddress,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    // Validate phone numbers (must be at least 10 digits)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.contactNo && !phoneRegex.test(formData.contactNo)) {
      setError("Contact number must be a valid phone number");
      return false;
    }
    if (
      formData.emergencyContact &&
      !phoneRegex.test(formData.emergencyContact)
    ) {
      setError("Emergency contact must be a valid phone number");
      return false;
    }
    if (formData.fatherContact && !phoneRegex.test(formData.fatherContact)) {
      setError("Father's contact must be a valid phone number");
      return false;
    }
    if (formData.motherContact && !phoneRegex.test(formData.motherContact)) {
      setError("Mother's contact must be a valid phone number");
      return false;
    }

    // Validate address fields
    if (!formData.personalAddress.hNo) {
      setError("House number is required");
      return false;
    }
    if (
      !formData.personalAddress.street ||
      formData.personalAddress.street.length < 2
    ) {
      setError("Street must be at least 2 characters");
      return false;
    }
    if (
      !formData.personalAddress.city ||
      formData.personalAddress.city.length < 2
    ) {
      setError("City must be at least 2 characters");
      return false;
    }
    if (
      !formData.personalAddress.state ||
      formData.personalAddress.state.length < 2
    ) {
      setError("State must be at least 2 characters");
      return false;
    }

    // Validate pincode (must be 6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.personalAddress.pincode)) {
      setError("Pincode must be 6 digits");
      return false;
    }

    // Validate room allocation
    if (!formData.hostelId) {
      setError("Please select a hostel");
      return false;
    }
    if (!formData.roomId) {
      setError("Please select a room");
      return false;
    }
    if (!formData.academicYear) {
      setError("Academic year is required");
      return false;
    }
    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allocationData = {
        ...formData,
        roomAllocation: {
          roomId: parseInt(formData.roomId),
          academicYear: formData.academicYear,
          startDate: new Date(formData.startDate).toISOString(),
        },
      };

      await StudentService.create(allocationData);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to allocate room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Student with Room Allocation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
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
                helperText="Format: +91XXXXXXXXXX"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                helperText="Format: +91XXXXXXXXXX"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's Contact"
                name="fatherContact"
                value={formData.fatherContact}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                helperText="Format: +91XXXXXXXXXX"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother's Contact"
                name="motherContact"
                value={formData.motherContact}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                helperText="Format: +91XXXXXXXXXX"
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
                label="House Number"
                name="personalAddress.hNo"
                value={formData.personalAddress.hNo}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                name="personalAddress.street"
                value={formData.personalAddress.street}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="personalAddress.city"
                value={formData.personalAddress.city}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="personalAddress.state"
                value={formData.personalAddress.state}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="personalAddress.pincode"
                value={formData.personalAddress.pincode}
                onChange={handleChange}
                required
                helperText="6 digits"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Room Allocation Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Hostel</InputLabel>
                <Select
                  label="Hostel"
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleChange}
                  required
                >
                  {hostels.map((hostel) => (
                    <MenuItem key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Room</InputLabel>
                <Select
                  label="Room"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                  disabled={!formData.hostelId}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {`${room.roomType} - ${
                        room.allocations?.filter((a) => !a.endDate)?.length || 0
                      }/${room.capacity} occupied`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                placeholder="YYYY-YYYY"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Create Student"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StudentAllocationForm;
