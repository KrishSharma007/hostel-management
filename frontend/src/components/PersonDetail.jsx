import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Divider,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  SupportAgent as SupportIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

const PersonDetail = ({ open, onClose, person }) => {
  if (!person) return null;

  const getPersonIcon = () => {
    switch (person.personType) {
      case "Student":
        return <SchoolIcon fontSize="large" color="primary" />;
      case "Warden":
        return <SupervisorIcon fontSize="large" color="primary" />;
      case "Attendant":
        return <SupportIcon fontSize="large" color="primary" />;
      default:
        return null;
    }
  };

  const renderAddress = () => {
    if (!person.personalAddress) return "N/A";

    return (
      <>
        {person.personalAddress.hNo && `${person.personalAddress.hNo}, `}
        {person.personalAddress.street && `${person.personalAddress.street}, `}
        {person.personalAddress.city && `${person.personalAddress.city}, `}
        {person.personalAddress.state && `${person.personalAddress.state}, `}
        {person.personalAddress.pincode && person.personalAddress.pincode}
      </>
    );
  };

  const renderStudentDetails = () => {
    if (person.personType !== "Student") return null;

    return (
      <>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Emergency Contacts
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Emergency Contact
          </Typography>
          <Typography variant="body1">
            {person.emergencyContact || "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Father's Contact
          </Typography>
          <Typography variant="body1">
            {person.fatherContact || "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Mother's Contact
          </Typography>
          <Typography variant="body1">
            {person.motherContact || "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Remark
          </Typography>
          <Typography variant="body1">{person.remark || "N/A"}</Typography>
        </Grid>

        {/* Room Allocation */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Room Allocation
          </Typography>
        </Grid>
        {person.roomAllocations && person.roomAllocations.length > 0 ? (
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {person.roomAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        {allocation.room?.hostel?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {allocation.room?.roomType || "N/A"}
                      </TableCell>
                      <TableCell>{allocation.academicYear}</TableCell>
                      <TableCell>
                        {new Date(allocation.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {allocation.endDate
                          ? new Date(allocation.endDate).toLocaleDateString()
                          : "Current"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No room allocations found</Typography>
          </Grid>
        )}

        {/* Mess Bills */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Mess Bills
          </Typography>
        </Grid>
        {person.messBills && person.messBills.length > 0 ? (
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Bill ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Generation Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Fine</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {person.messBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.id}</TableCell>
                      <TableCell>₹{bill.billAmount}</TableCell>
                      <TableCell>
                        {new Date(bill.billGenerationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bill.status}
                          color={
                            bill.status === "PAID"
                              ? "success"
                              : bill.status === "OVERDUE"
                              ? "error"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>₹{bill.fine}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No mess bills found</Typography>
          </Grid>
        )}
      </>
    );
  };

  const renderWardenDetails = () => {
    if (person.personType !== "Warden") return null;

    return (
      <>
        {/* Hostel Assignments */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Hostel Assignments
          </Typography>
        </Grid>
        {person.hostelAssignments && person.hostelAssignments.length > 0 ? (
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Assignment Date</TableCell>
                    <TableCell>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {person.hostelAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.hostel?.name || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(
                          assignment.assignmentDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assignment.endDate
                          ? new Date(assignment.endDate).toLocaleDateString()
                          : "Current"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No hostel assignments found</Typography>
          </Grid>
        )}
      </>
    );
  };

  const renderAttendantDetails = () => {
    if (person.personType !== "Attendant") return null;

    return (
      <>
        {/* Duties */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Duties
          </Typography>
        </Grid>
        {person.duties && person.duties.length > 0 ? (
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Duty Type</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {person.duties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.hostel?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={duty.dutyType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={duty.shiftType}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(duty.dutyDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">No duties assigned</Typography>
          </Grid>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {getPersonIcon()}
          <Typography variant="h5">
            {person.name} ({person.personType})
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{person.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Number
              </Typography>
              <Typography variant="body1">
                {person.contactNo || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">{renderAddress()}</Typography>
            </Grid>

            {renderStudentDetails()}
            {renderWardenDetails()}
            {renderAttendantDetails()}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button variant="outlined" onClick={onClose}>
                  Close
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default PersonDetail;
