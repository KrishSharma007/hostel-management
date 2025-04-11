import React from "react";
import { Box, Typography } from "@mui/material";
import RoomAllocationForm from "./RoomAllocationForm";

const AllocationForm = ({ roomId, onSubmit, onCancel }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Room Allocation
      </Typography>
      <RoomAllocationForm
        roomId={roomId}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Box>
  );
};

export default AllocationForm;
