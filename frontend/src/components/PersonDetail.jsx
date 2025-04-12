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
  IconButton,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  SupportAgent as SupportIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  MeetingRoom as RoomIcon,
  ContactPhone as EmergencyIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";

const PersonDetail = ({ open, onClose, person }) => {
  if (!person) return null;

  const getPersonTypeColor = () => {
    switch (person.personType) {
      case "Student":
        return "#3f51b5";
      case "Warden":
        return "#4caf50";
      case "Attendant":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  const renderAddress = () => {
    if (!person.personalAddress) return "Not Available";

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

  const renderPersonalInfoCard = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: getPersonTypeColor() }}>
            {person.name.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {person.name}
            <Chip
              label={person.personType}
              size="small"
              sx={{ ml: 1, bgcolor: getPersonTypeColor(), color: "white" }}
            />
          </Typography>
        }
        action={
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon color="action" fontSize="small" />
            <Typography variant="body1">
              {person.contactNo || "Not Available"}
            </Typography>
          </Box>

          <Box display="flex" alignItems="flex-start" gap={1}>
            <LocationIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
            <Typography variant="body1">{renderAddress()}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTableWithTitle = (
    title,
    icon,
    data,
    columns,
    renderRow,
    emptyMessage
  ) => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        avatar={icon}
        title={<Typography variant="h6">{title}</Typography>}
      />
      <CardContent>
        {data && data.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell key={index}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>{data.map(renderRow)}</TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderStudentDetails = () => {
    if (person.personType !== "Student") return null;

    return (
      <>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardHeader
            avatar={<EmergencyIcon color="error" />}
            title={<Typography variant="h6">Emergency Contacts</Typography>}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Emergency Contact
                </Typography>
                <Typography variant="body2">
                  {person.emergencyContact || "Not Available"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Father's Contact
                </Typography>
                <Typography variant="body2">
                  {person.fatherContact || "Not Available"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mother's Contact
                </Typography>
                <Typography variant="body2">
                  {person.motherContact || "Not Available"}
                </Typography>
              </Grid>
              {person.remark && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Remark
                  </Typography>
                  <Typography variant="body2">{person.remark}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {renderTableWithTitle(
          "Room Allocation History",
          <RoomIcon color="primary" />,
          person.roomAllocations,
          ["Hostel", "Room", "Academic Year", "Start Date", "End Date"],
          (allocation) => (
            <TableRow key={allocation.id} hover>
              <TableCell>{allocation.room?.hostel?.name || "N/A"}</TableCell>
              <TableCell>{allocation.room?.roomType || "N/A"}</TableCell>
              <TableCell>{allocation.academicYear}</TableCell>
              <TableCell>
                {new Date(allocation.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {allocation.endDate ? (
                  new Date(allocation.endDate).toLocaleDateString()
                ) : (
                  <Chip size="small" label="Current" color="success" />
                )}
              </TableCell>
            </TableRow>
          ),
          "No room allocations found"
        )}

        {renderTableWithTitle(
          "Mess Bills",
          <PaymentIcon color="primary" />,
          person.messBills,
          [
            "Bill ID",
            "Amount",
            "Generation Date",
            "Due Date",
            "Status",
            "Fine",
          ],
          (bill) => (
            <TableRow
              key={bill.id}
              hover
              sx={
                bill.status === "OVERDUE"
                  ? { bgcolor: "rgba(244, 67, 54, 0.08)" }
                  : {}
              }
            >
              <TableCell>{bill.id}</TableCell>
              <TableCell>₹{bill.billAmount.toLocaleString()}</TableCell>
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
              <TableCell>
                {bill.fine > 0 ? (
                  <Typography color="error">
                    ₹{bill.fine.toLocaleString()}
                  </Typography>
                ) : (
                  "₹0"
                )}
              </TableCell>
            </TableRow>
          ),
          "No mess bills found"
        )}
      </>
    );
  };

  const renderWardenDetails = () => {
    if (person.personType !== "Warden") return null;

    return (
      <>
        {renderTableWithTitle(
          "Hostel Assignments",
          <SupervisorIcon color="primary" />,
          person.hostelAssignments,
          ["Hostel", "Assignment Date", "End Date"],
          (assignment) => (
            <TableRow key={assignment.id} hover>
              <TableCell>{assignment.hostel?.name || "N/A"}</TableCell>
              <TableCell>
                {new Date(assignment.assignmentDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {assignment.endDate ? (
                  new Date(assignment.endDate).toLocaleDateString()
                ) : (
                  <Chip size="small" label="Current" color="success" />
                )}
              </TableCell>
            </TableRow>
          ),
          "No hostel assignments found"
        )}
      </>
    );
  };

  const renderAttendantDetails = () => {
    if (person.personType !== "Attendant") return null;

    return (
      <>
        {renderTableWithTitle(
          "Duty Schedule",
          <CalendarIcon color="primary" />,
          person.duties,
          ["Hostel", "Duty Type", "Shift", "Date"],
          (duty) => (
            <TableRow key={duty.id} hover>
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
          ),
          "No duties assigned"
        )}
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {renderPersonalInfoCard()}

        {renderStudentDetails()}
        {renderWardenDetails()}
        {renderAttendantDetails()}

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={onClose}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PersonDetail;
