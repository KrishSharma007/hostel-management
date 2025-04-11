import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MeetingRoom as RoomIcon,
} from "@mui/icons-material";
import { HostelService } from "../api/services";
import HostelForm from "./HostelForm";
import LoadingOverlay from "./LoadingOverlay";

const HostelList = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addHostelOpen, setAddHostelOpen] = useState(false);
  const [editHostelOpen, setEditHostelOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const data = await HostelService.getAll();
      setHostels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddHostel = () => {
    setSelectedHostel(null);
    setAddHostelOpen(true);
  };

  const handleEditHostel = (hostel) => {
    setSelectedHostel(hostel);
    setEditHostelOpen(true);
  };

  const handleDeleteHostel = (hostel) => {
    setSelectedHostel(hostel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await HostelService.delete(selectedHostel.id);
      await fetchHostels();
      setDeleteDialogOpen(false);
      setSelectedHostel(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedHostel) {
        await HostelService.update(selectedHostel.id, formData);
      } else {
        await HostelService.create(formData);
      }
      await fetchHostels();
      setAddHostelOpen(false);
      setEditHostelOpen(false);
      setSelectedHostel(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredHostels = hostels.filter((hostel) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return hostel.name.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return <LoadingOverlay message="Loading hostels..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Error: {error}</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchHostels}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
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
        <Typography variant="h4">Hostels</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddHostel}
        >
          Add Hostel
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name..."
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Rooms</TableCell>
              <TableCell>Wardens</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Attendants</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHostels.map((hostel) => (
              <TableRow key={hostel.id}>
                <TableCell>{hostel.name}</TableCell>
                <TableCell>{hostel.hostelAddress?.building}</TableCell>
                <TableCell>{hostel.contactNo}</TableCell>
                <TableCell>{hostel.rooms.length}</TableCell>
                <TableCell>{hostel.wardenCount}</TableCell>
                <TableCell>{hostel.studentCount}</TableCell>
                <TableCell>{hostel.attendantCount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditHostel(hostel)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteHostel(hostel)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={addHostelOpen}
        onClose={() => setAddHostelOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Hostel</DialogTitle>
        <DialogContent>
          <HostelForm
            onSubmit={handleFormSubmit}
            onCancel={() => setAddHostelOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editHostelOpen}
        onClose={() => setEditHostelOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Hostel</DialogTitle>
        <DialogContent>
          <HostelForm
            hostel={selectedHostel}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditHostelOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Hostel</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedHostel?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <Box p={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default HostelList;
