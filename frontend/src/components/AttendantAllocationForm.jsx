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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  AttendantService,
  HostelService,
  AttendantDutyService,
} from "../api/services";

const DUTY_TYPES = [
  "CLEANING",
  "ROOM_MANAGEMENT",
  "BASIC_ASSISTANCE",
  "SECURITY",
];

const SHIFT_TYPES = ["MORNING", "EVENING", "NIGHT"];

const AttendantAllocationForm = ({ attendant, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    attendantId: attendant?.id || "",
    hostelId: "",
    dutyDate: new Date().toISOString().split("T")[0],
    dutyType: "",
    shiftType: "",
  });
  const [hostels, setHostels] = useState([]);
  const [attendants, setAttendants] = useState([]);
  const [currentDuties, setCurrentDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostels();
    if (!attendant?.id) {
      fetchAttendants();
    }
    if (attendant?.id) {
      fetchCurrentDuties(attendant.id);
    }
  }, [attendant]);

  const fetchHostels = async () => {
    try {
      const data = await HostelService.getAll();
      setHostels(data);
    } catch (err) {
      setError("Failed to fetch hostels");
      console.error(err);
    }
  };

  const fetchAttendants = async () => {
    try {
      const data = await AttendantService.getAll();
      setAttendants(data);
    } catch (err) {
      setError("Failed to fetch attendants");
      console.error(err);
    }
  };

  const fetchCurrentDuties = async (attendantId) => {
    try {
      const duties = await AttendantDutyService.getByAttendant(attendantId);
      setCurrentDuties(duties);
    } catch (err) {
      console.error("Error fetching current duties:", err);
      setError("Failed to fetch current duties");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AttendantDutyService.create({
        attendantId: formData.attendantId,
        hostelId: formData.hostelId,
        dutyDate: formData.dutyDate,
        dutyType: formData.dutyType,
        shiftType: formData.shiftType,
      });

      // Refresh current duties
      await fetchCurrentDuties(formData.attendantId);

      // Reset form
      setFormData((prev) => ({
        ...prev,
        hostelId: "",
        dutyDate: new Date().toISOString().split("T")[0],
        dutyType: "",
        shiftType: "",
      }));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Failed to create duty");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDuty = async (dutyId) => {
    try {
      setLoading(true);
      await AttendantDutyService.delete(dutyId);
      await fetchCurrentDuties(formData.attendantId);
    } catch (err) {
      setError(err.message || "Failed to delete duty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {attendant ? "Manage Attendant Duties" : "Assign Attendant Duty"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {!attendant && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Attendant</InputLabel>
                  <Select
                    name="attendantId"
                    value={formData.attendantId}
                    onChange={handleChange}
                    label="Attendant"
                  >
                    {attendants.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.person?.name || "Unknown"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Hostel</InputLabel>
                <Select
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleChange}
                  label="Hostel"
                >
                  {hostels.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      {h.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Duty Type</InputLabel>
                <Select
                  name="dutyType"
                  value={formData.dutyType}
                  onChange={handleChange}
                  label="Duty Type"
                >
                  {DUTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Shift Type</InputLabel>
                <Select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleChange}
                  label="Shift Type"
                >
                  {SHIFT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="date"
                label="Duty Date"
                name="dutyDate"
                value={formData.dutyDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
                  disabled={
                    loading ||
                    !formData.hostelId ||
                    !formData.dutyType ||
                    !formData.shiftType
                  }
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AddIcon />
                  }
                >
                  Assign
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {currentDuties.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Current Duties
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Duty Type</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentDuties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.hostel?.name}</TableCell>
                      <TableCell>{duty.dutyType.replace(/_/g, " ")}</TableCell>
                      <TableCell>{duty.shiftType}</TableCell>
                      <TableCell>
                        {new Date(duty.dutyDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete Duty">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDuty(duty.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AttendantAllocationForm;
