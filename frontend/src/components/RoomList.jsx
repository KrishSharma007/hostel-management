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
import { RoomService } from "../api/services";
import LoadingOverlay from "./LoadingOverlay";

const RoomList = ({ hostelId, onEdit, onDelete, onAdd }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");

  useEffect(() => {
    if (hostelId) {
      fetchRooms();
    }
  }, [hostelId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await RoomService.getByHostel(hostelId);
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoomTypeFilter = (event) => {
    setRoomTypeFilter(event.target.value);
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case "SINGLE":
        return "success";
      case "DOUBLE":
        return "info";
      case "TRIPLE":
        return "warning";
      case "DORMITORY":
        return "error";
      default:
        return "default";
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !searchTerm ||
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      roomTypeFilter === "ALL" || room.roomType === roomTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <LoadingOverlay message="Loading rooms..." />;
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
        <Typography variant="h4">Rooms</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Room
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
              placeholder="Search by room type..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomTypeFilter}
                label="Room Type"
                onChange={handleRoomTypeFilter}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="SINGLE">Single</MenuItem>
                <MenuItem value="DOUBLE">Double</MenuItem>
                <MenuItem value="TRIPLE">Triple</MenuItem>
                <MenuItem value="DORMITORY">Dormitory</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Occupied</TableCell>
              <TableCell>Furniture Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <Chip
                      label={room.roomType}
                      color={getRoomTypeColor(room.roomType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<PersonIcon />}
                      label={`${room.allocations?.length || 0}/${
                        room.capacity
                      }`}
                      color={
                        room.allocations?.length === room.capacity
                          ? "error"
                          : "success"
                      }
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{room.furnitureDetails || "Standard"}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(room)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(room)}
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
                <TableCell colSpan={5} align="center">
                  No rooms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RoomList;
