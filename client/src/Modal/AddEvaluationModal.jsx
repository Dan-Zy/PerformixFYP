import React from "react";
import axios from "axios";
import { Modal, Button } from "flowbite-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddEvaluationModal = ({ isOpen, onClose, employeeData, parameterData }) => {
  const token = localStorage.getItem("token");

  const validationSchema = Yup.object({
    marksObt: Yup.number()
      .required("Marks obtained is required")
      .min(0, "Marks must be a positive number")
      .max(100, "Marks must not exceed 100"),
    feedback: Yup.string().required("Feedback is required"),
  });

  const handleAddEvaluation = async (values, { setSubmitting, resetForm }) => {
    if (!token || !employeeData || !parameterData) {
      console.error("Missing required data.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/user/evaluate-lm",
        {
          line_manager_id: employeeData.user_id,
          metric_id: parameterData.metric_id,
          parameter_id: parameterData.parameter_id,
          marks_obt: values.marksObt,
          feedback: values.feedback,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Evaluation added successfully!");
        onClose();
        resetForm();
      } else {
        console.error("Failed to add evaluation:", response.data.message);
        alert("Failed to add evaluation. Please try again.");
      }
    } catch (error) {
      console.error("Error adding evaluation:", error);
      alert("An error occurred while adding the evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg" popup position="center" className="bg-gray-100">
      <Modal.Header>Add Evaluation</Modal.Header>
      <Modal.Body>
        <p className="font-semibold">Evaluating: {employeeData?.full_name}</p>
        <p className="text-sm text-gray-600">Metric ID: {parameterData?.metric_id}</p>
        <p className="text-sm text-gray-600 mb-4">Parameter ID: {parameterData?.parameter_id}</p>
        
        <Formik
          initialValues={{ marksObt: "", feedback: "" }}
          validationSchema={validationSchema}
          onSubmit={handleAddEvaluation}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="number"
                  name="marksObt"
                  placeholder="Marks Obtained"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <ErrorMessage name="marksObt" component="div" className="text-red-500 text-sm" />
              </div>
              
              <div className="mb-4">
                <Field
                  as="textarea"
                  name="feedback"
                  placeholder="Enter feedback..."
                  className="w-full h-32 p-2 border border-gray-300 rounded-md"
                />
                <ErrorMessage name="feedback" component="div" className="text-red-500 text-sm" />
              </div>
              
              <Modal.Footer>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                >
                  {isSubmitting ? "Saving..." : "Submit"}
                </Button>
                <Button 
                  type="button" 
                  color="gray" 
                  onClick={onClose} 
                  className="bg-gray-400 text-white hover:bg-gray-500 focus:ring-4 focus:ring-gray-300"
                >
                  Cancel
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddEvaluationModal;