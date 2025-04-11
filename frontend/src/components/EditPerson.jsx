import React from "react";
import { Box, Dialog, DialogTitle, DialogContent } from "@mui/material";
import StudentForm from "./StudentForm";
import WardenForm from "./WardenForm";
import AttendantForm from "./AttendantForm";

const EditPerson = ({ open, onClose, onSuccess, person }) => {
  const handleCancel = () => {
    onClose();
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const renderForm = () => {
    if (!person) return null;

    switch (person.personType) {
      case "Student":
        return (
          <StudentForm
            student={person}
            onClose={handleCancel}
            onSuccess={handleSuccess}
          />
        );
      case "Warden":
        return (
          <WardenForm
            warden={person}
            onClose={handleCancel}
            onSuccess={handleSuccess}
          />
        );
      case "Attendant":
        return (
          <AttendantForm
            attendant={person}
            onClose={handleCancel}
            onSuccess={handleSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit {person?.personType || "Person"}</DialogTitle>
      <DialogContent>{renderForm()}</DialogContent>
    </Dialog>
  );
};

export default EditPerson;
