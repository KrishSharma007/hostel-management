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
  WardenService,
  HostelService,
  WardenAssignmentService,
} from "../api/services";

const WardenAllocationForm = ({ warden, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    wardenId: warden?.id || "",
    hostelId: "",
    assignmentDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const [hostels, setHostels] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostels();
    if (!warden?.id) {
      fetchWardens();
    }
    if (warden?.id) {
      fetchCurrentAssignments(warden.id);
    }
  }, [warden]);

  useEffect(() => {
    // Update available hostels when hostels or current assignments change
    if (hostels.length > 0) {
      const assignedHostelIds = currentAssignments
        .filter((assignment) => !assignment.endDate) // Only consider active assignments
        .map((assignment) => assignment.hostelId);

      const available = hostels.filter(
        (hostel) => !assignedHostelIds.includes(hostel.id)
      );
      setAvailableHostels(available);
    }
  }, [hostels, currentAssignments]);

  const fetchHostels = async () => {
    try {
      const data = await HostelService.getAll();
      setHostels(data);
    } catch (err) {
      setError("Failed to fetch hostels");
      console.error(err);
    }
  };

  const fetchWardens = async () => {
    try {
      const data = await WardenService.getAll();
      setWardens(data);
    } catch (err) {
      setError("Failed to fetch wardens");
      console.error(err);
    }
  };

  const fetchCurrentAssignments = async (wardenId) => {
    try {
      const assignments = await WardenAssignmentService.getByWarden(wardenId);
      setCurrentAssignments(assignments);
    } catch (err) {
      console.error("Error fetching current assignments:", err);
      setError("Failed to fetch current assignments");
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
      await WardenAssignmentService.create({
        wardenId: formData.wardenId,
        hostelId: formData.hostelId,
        assignmentDate: formData.assignmentDate,
        endDate: formData.endDate || null,
      });

      // Refresh current assignments
      await fetchCurrentAssignments(formData.wardenId);

      // Reset form
      setFormData((prev) => ({
        ...prev,
        hostelId: "",
        assignmentDate: new Date().toISOString().split("T")[0],
        endDate: "",
      }));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleEndAssignment = async (assignmentId) => {
    try {
      setLoading(true);
      await WardenAssignmentService.update(assignmentId, {
        endDate: new Date().toISOString().split("T")[0],
      });
      await fetchCurrentAssignments(formData.wardenId);
    } catch (err) {
      setError(err.message || "Failed to end assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {warden ? "Manage Warden Assignments" : "Assign Warden to Hostel"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {!warden && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Warden</InputLabel>
                  <Select
                    name="wardenId"
                    value={formData.wardenId}
                    onChange={handleChange}
                    label="Warden"
                  >
                    {wardens.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.person?.name || "Unknown"}
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
                  {availableHostels.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      {h.name}
                    </MenuItem>
                  ))}
                  {availableHostels.length === 0 && (
                    <MenuItem disabled>No available hostels</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Assignment Date"
                name="assignmentDate"
                value={formData.assignmentDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                name="endDate"
                value={formData.endDate}
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
                  disabled={loading || !formData.hostelId}
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

        {currentAssignments.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Current Assignments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Assignment Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.hostel?.name}</TableCell>
                      <TableCell>
                        {new Date(
                          assignment.assignmentDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assignment.endDate
                          ? new Date(assignment.endDate).toLocaleDateString()
                          : "Active"}
                      </TableCell>
                      <TableCell align="right">
                        {!assignment.endDate && (
                          <Tooltip title="End Assignment">
                            <IconButton
                              size="small"
                              onClick={() => handleEndAssignment(assignment.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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

export default WardenAllocationForm;
