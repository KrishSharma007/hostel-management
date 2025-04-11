import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import RoomAllocationList from "./RoomAllocationList";
import RoomAllocationForm from "./RoomAllocationForm";

const AllocationList = ({ roomId }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const handleAdd = () => {
    setSelectedAllocation(null);
    setShowForm(true);
  };

  const handleEdit = (allocation) => {
    setSelectedAllocation(allocation);
    setShowForm(true);
  };

  const handleDelete = async (allocation) => {
    // This would typically call an API to delete the allocation
    console.log("Delete allocation:", allocation);
  };

  const handleSubmit = () => {
    setShowForm(false);
    // Refresh the list after submission
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <Box>
      {showForm ? (
        <RoomAllocationForm
          allocation={selectedAllocation}
          roomId={roomId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Room Allocations</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Allocation
            </Button>
          </Box>
          <RoomAllocationList
            roomId={roomId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </>
      )}
    </Box>
  );
};

export default AllocationList;
