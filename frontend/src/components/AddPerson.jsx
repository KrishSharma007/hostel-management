import React, { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent } from "@mui/material";
import PersonTypeSelector from "./PersonTypeSelector";
import StudentForm from "./StudentForm";
import WardenForm from "./WardenForm";
import AttendantForm from "./AttendantForm";
import StudentAllocationForm from "./StudentAllocationForm";

const AddPerson = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [studentData, setStudentData] = useState(null);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleCancel = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep(1);
      setSelectedType(null);
      setStudentData(null);
    }
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
    // Reset the state for next time
    setStep(1);
    setSelectedType(null);
    setStudentData(null);
  };

  const handleStudentNext = (data) => {
    setStudentData(data);
    setStep(3);
  };

  const handleBack = () => {
    setStep(2);
  };

  const renderForm = () => {
    switch (selectedType) {
      case "Student":
        return step === 2 ? (
          <StudentForm
            onClose={handleCancel}
            onSuccess={handleSuccess}
            onNext={handleStudentNext}
          />
        ) : (
          <StudentAllocationForm
            student={studentData}
            onClose={handleSuccess}
            onSuccess={handleSuccess}
            onBack={handleBack}
          />
        );
      case "Warden":
        return <WardenForm onClose={handleCancel} onSuccess={handleSuccess} />;
      case "Attendant":
        return (
          <AttendantForm onClose={handleCancel} onSuccess={handleSuccess} />
        );
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    if (step === 1) return "Add New Person";
    if (selectedType === "Student" && step === 3) return "Allocate Room";
    return `Add New ${selectedType}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <PersonTypeSelector
            onSelect={handleTypeSelect}
            onCancel={handleCancel}
          />
        ) : (
          renderForm()
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPerson;
