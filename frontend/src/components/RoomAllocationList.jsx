import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { RoomAllocationService } from "../api/services";
import LoadingOverlay from "./LoadingOverlay";

const RoomAllocationList = ({ roomId, onEdit, onDelete, onAdd }) => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RoomAllocationService.getByRoom(roomId);
      setAllocations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchAllocations();
    }
  }, [roomId, fetchAllocations]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
  };

  const getStatusColor = (endDate) => {
    return endDate ? "error" : "success";
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      !searchTerm ||
      allocation.student.person.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && !allocation.endDate) ||
      (statusFilter === "INACTIVE" && allocation.endDate);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingOverlay message="Loading allocations..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Room Allocations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Allocation
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by student name..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilter}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAllocations.length > 0 ? (
              filteredAllocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon />
                      {allocation.student.person.name}
                    </Box>
                  </TableCell>
                  <TableCell>{allocation.academicYear}</TableCell>
                  <TableCell>
                    {new Date(allocation.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {allocation.endDate
                      ? new Date(allocation.endDate).toLocaleDateString()
                      : "Active"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={allocation.endDate ? "Inactive" : "Active"}
                      color={getStatusColor(allocation.endDate)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(allocation)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(allocation)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No allocations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RoomAllocationList;
