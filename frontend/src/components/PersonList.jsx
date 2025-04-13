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
  MenuItem,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  MeetingRoom as MeetingRoomIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import {
  StudentService,
  WardenService,
  AttendantService,
} from "../api/services";
import AddPerson from "./AddPerson";
import EditPerson from "./EditPerson";
import PersonDetail from "./PersonDetail";
import WardenAllocationForm from "./WardenAllocationForm";
import AttendantAllocationForm from "./AttendantAllocationForm";
import LoadingOverlay from "./LoadingOverlay";

const PersonList = ({ onDelete }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    personType: "",
    searchTerm: "",
  });
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [viewPersonOpen, setViewPersonOpen] = useState(false);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [allocateAttendantOpen, setAllocateAttendantOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    fetchPersons();
  }, [filters.personType]);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch each type of person separately to isolate errors
      let students = [];
      let wardens = [];
      let attendants = [];

      try {
        students = await StudentService.getAll();
      } catch (err) {
        console.error("Error fetching students:", err);
      }

      try {
        wardens = await WardenService.getAll();
      } catch (err) {
        console.error("Error fetching wardens:", err);
      }

      try {
        attendants = await AttendantService.getAll();
      } catch (err) {
        console.error("Error fetching attendants:", err);
      }

      // Map the data to a common format
      const mappedPersons = [
        ...students.map((student) => ({
          ...student,
          personType: "Student",
          name: student.person?.name || "Unknown",
          contactNo: student.person?.contactNo || "N/A",
          personalAddress: student.person?.personalAddress || null,
        })),
        ...wardens.map((warden) => ({
          ...warden,
          personType: "Warden",
          name: warden.person?.name || "Unknown",
          contactNo: warden.person?.contactNo || "N/A",
          personalAddress: warden.person?.personalAddress || null,
        })),
        ...attendants.map((attendant) => ({
          ...attendant,
          personType: "Attendant",
          name: attendant.person?.name || "Unknown",
          contactNo: attendant.person?.contactNo || "N/A",
          personalAddress: attendant.person?.personalAddress || null,
        })),
      ];

      // Filter by person type if specified
      const filteredPersons = filters.personType
        ? mappedPersons.filter(
            (person) => person.personType === filters.personType
          )
        : mappedPersons;

      setPersons(filteredPersons);
    } catch (err) {
      console.error("Error in fetchPersons:", err);
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleSearch = (event) => {
    setFilters({
      ...filters,
      searchTerm: event.target.value,
    });
  };

  const handleAddPerson = () => {
    setAddPersonOpen(true);
  };

  const handleAddPersonClose = () => {
    setAddPersonOpen(false);
  };

  const handleAddPersonSuccess = () => {
    fetchPersons();
  };

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
    setEditPersonOpen(true);
  };

  const handleEditPersonClose = () => {
    setEditPersonOpen(false);
    setSelectedPerson(null);
  };

  const handleEditPersonSuccess = () => {
    fetchPersons();
  };

  const handleViewPerson = async (person) => {
    try {
      let detailedPerson;
      let student, warden, attendant;

      switch (person.personType) {
        case "Student":
          student = await StudentService.getById(person.id);
          detailedPerson = {
            ...student,
            id: student.personId,
            name: student.person.name,
            personType: "Student",
            contactNo: student.person.contactNo,
            personalAddress: student.person.personalAddress,
            emergencyContact: student.emergencyContact,
            fatherContact: student.fatherContact,
            motherContact: student.motherContact,
            remark: student.remark,
            roomAllocations: student.roomAllocations,
            messBills: student.messBills,
          };
          break;
        case "Warden":
          warden = await WardenService.getById(person.id);
          detailedPerson = {
            ...warden,
            id: warden.personId,
            name: warden.person.name,
            personType: "Warden",
            contactNo: warden.person.contactNo,
            personalAddress: warden.person.personalAddress,
            hostelAssignments: warden.hostelAssignments,
          };
          break;
        case "Attendant":
          attendant = await AttendantService.getById(person.id);
          detailedPerson = {
            ...attendant,
            id: attendant.personId,
            name: attendant.person.name,
            personType: "Attendant",
            contactNo: attendant.person.contactNo,
            personalAddress: attendant.person.personalAddress,
            duties: attendant.duties,
          };
          break;
        default:
          detailedPerson = person;
      }

      setSelectedPerson(detailedPerson);
      setViewPersonOpen(true);
    } catch (err) {
      console.error("Error fetching person details:", err);
      // Still show the dialog with the basic information we have
      setSelectedPerson(person);
      setViewPersonOpen(true);
    }
  };

  const handleViewPersonClose = () => {
    setViewPersonOpen(false);
    setSelectedPerson(null);
  };

  const handleDeletePerson = async (person) => {
    try {
      await onDelete(person);
      // Refresh the list after successful deletion
      await fetchPersons();
    } catch (error) {
      console.error("Error in handleDeletePerson:", error);
    }
  };

  const handleAllocateWarden = (person) => {
    if (person.personType === "Warden") {
      setSelectedPerson(person);
      setAllocationOpen(true);
    }
  };

  const handleAllocationSuccess = () => {
    fetchPersons();
    setAllocationOpen(false);
  };

  const handleAllocationCancel = () => {
    setAllocationOpen(false);
  };

  const handleAllocateAttendant = (person) => {
    if (person.personType === "Attendant") {
      setSelectedPerson(person);
      setAllocateAttendantOpen(true);
    }
  };

  const handleCloseAllocateAttendant = () => {
    setAllocateAttendantOpen(false);
    setSelectedPerson(null);
  };

  const filteredPersons = persons.filter((person) => {
    if (filters.personType && person.personType !== filters.personType) {
      return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return person.name.toLowerCase().includes(searchLower);
    }

    return true;
  });

  if (loading) {
    return <LoadingOverlay message="Loading persons..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Error: {error}</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchPersons}
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
        <Typography variant="h4">People</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPerson}
        >
          Add Person
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleSearch}
              placeholder="Search by name..."
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Person Type"
              name="personType"
              value={filters.personType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Warden">Warden</MenuItem>
              <MenuItem value="Attendant">Attendant</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPersons.length > 0 ? (
              filteredPersons.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.personType}</TableCell>
                  <TableCell>{person.contactNo || "N/A"}</TableCell>
                  <TableCell>
                    {person.personalAddress
                      ? `${person.personalAddress.city}, ${person.personalAddress.state}`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPerson(person)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPerson(person)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {person.personType === "Warden" && (
                        <Tooltip title="Assign to Hostel">
                          <IconButton
                            size="small"
                            onClick={() => handleAllocateWarden(person)}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {person.personType === "Attendant" && (
                        <Tooltip title="Assign Duty">
                          <IconButton
                            size="small"
                            onClick={() => handleAllocateAttendant(person)}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePerson(person)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No persons found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddPerson
        open={addPersonOpen}
        onClose={handleAddPersonClose}
        onSuccess={handleAddPersonSuccess}
      />

      <EditPerson
        open={editPersonOpen}
        onClose={handleEditPersonClose}
        onSuccess={handleEditPersonSuccess}
        person={selectedPerson}
      />

      <PersonDetail
        open={viewPersonOpen}
        onClose={handleViewPersonClose}
        person={selectedPerson}
      />

      <Dialog
        open={allocationOpen}
        onClose={handleAllocationCancel}
        maxWidth="md"
        fullWidth
      >
        <WardenAllocationForm
          warden={selectedPerson}
          onSuccess={handleAllocationSuccess}
          onCancel={handleAllocationCancel}
        />
      </Dialog>

      <Dialog
        open={allocateAttendantOpen}
        onClose={handleCloseAllocateAttendant}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assign Attendant Duty</DialogTitle>
        <DialogContent>
          <AttendantAllocationForm
            attendant={selectedPerson}
            onSuccess={handleCloseAllocateAttendant}
            onCancel={handleCloseAllocateAttendant}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PersonList;
