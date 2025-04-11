import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { MessBillService } from "../api/services";
import LoadingOverlay from "./LoadingOverlay";

const BILL_STATUS = ["GENERATED", "PAID", "OVERDUE"];

const MessBillForm = ({ studentId }) => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: studentId || "",
    billAmount: "",
    billGenerationDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    fine: "0",
    status: "GENERATED",
    description: "",
  });

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params = studentId ? { studentId } : {};
      const response = await MessBillService.getAll(params);
      setBills(response);
    } catch (err) {
      setError(err.message || "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const submissionData = {
        ...formData,
        studentId: parseInt(formData.studentId),
        billAmount: parseFloat(formData.billAmount),
        fine: parseFloat(formData.fine),
        billGenerationDate: new Date(formData.billGenerationDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      if (editingBill) {
        await MessBillService.update(editingBill.id, {
          billId: editingBill.id,
          status: formData.status,
          fine: parseFloat(formData.fine),
        });
      } else {
        await MessBillService.create(submissionData);
      }
      setOpenDialog(false);
      fetchBills();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save bill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        setSubmitting(true);
        await MessBillService.delete(id);
        fetchBills();
      } catch (err) {
        setError(err.message || "Failed to delete bill");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      studentId: bill.studentId.toString(),
      billAmount: bill.billAmount.toString(),
      billGenerationDate: new Date(bill.billGenerationDate)
        .toISOString()
        .split("T")[0],
      dueDate: new Date(bill.dueDate).toISOString().split("T")[0],
      fine: bill.fine.toString(),
      status: bill.status,
      description: bill.description || "",
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingBill(null);
    setFormData({
      studentId: studentId || "",
      billAmount: "",
      billGenerationDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      fine: "0",
      status: "GENERATED",
      description: "",
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  if (loading) {
    return <LoadingOverlay message="Loading bills..." />;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Mess Bills</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={submitting}
        >
          Add Bill
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Generation Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Fine</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.id}</TableCell>
                <TableCell>{bill.student?.person?.name || "Unknown"}</TableCell>
                <TableCell>{bill.studentId}</TableCell>
                <TableCell>₹{bill.billAmount}</TableCell>
                <TableCell>
                  {new Date(bill.billGenerationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(bill.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{bill.status}</TableCell>
                <TableCell>₹{bill.fine}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(bill);
                    }}
                    color="primary"
                    disabled={submitting}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(bill.id)}
                    color="error"
                    disabled={submitting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingBill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    disabled={!!studentId || submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="billAmount"
                    type="number"
                    value={formData.billAmount}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fine"
                    name="fine"
                    type="number"
                    value={formData.fine}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Generation Date"
                    name="billGenerationDate"
                    type="date"
                    value={formData.billGenerationDate}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Status"
                    name="status"
                    select
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    {BILL_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    disabled={submitting}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              {editingBill ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {submitting && (
        <LoadingOverlay
          message={editingBill ? "Updating bill..." : "Creating bill..."}
        />
      )}
    </Box>
  );
};

export default MessBillForm;
