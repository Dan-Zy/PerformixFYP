import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "flowbite-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import EditParameter from "./EditParameter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewParameter = ({ isOpen, onClose, parameterData }) => {
  console.log("parameterData:", parameterData);
  
  const [parameters, setParameters] = useState([]);
  const [metric_id, setMetricId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Update metric_id whenever parameterData.id changes
  useEffect(() => {
    if (parameterData?.id) {
      setMetricId(parameterData.id);
    }
  }, [parameterData.id]);

  useEffect(() => {
    if (metric_id) {
      fetchParameters();
    }
  }, [metric_id]);

  const fetchParameters = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("metric_id:", metric_id);

      const response = await axios.get(
        `http://localhost:8080/performance/get-all-parameters/${metric_id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setParameters(response.data.parameters);
      console.log("Parameters:", response.data.parameters);
    } catch (error) {
      console.error("Error fetching parameters:", error);
    }
  };

  const handleEditClick = (param) => {
    setSelectedParameter(param); // Set the selected parameter
    setIsEditOpen(true); // Open the edit modal
  };

  const handleEditClose = () => {
    setIsEditOpen(false); // Close the edit modal
    setSelectedParameter(null); // Clear selected parameter
    fetchParameters(); // Refresh parameter list after edit
  };

  const handleDeleteClick = async (param) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${param.parameter_name}"?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/performance/delete-parameter/${param.parameter_id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      toast.success("Parameter deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      fetchParameters(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting parameter:", error);
      toast.error("Failed to delete parameter. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <Modal
        show={isOpen}
        size="lg"
        onClose={onClose}
        popup
        className="bg-gray-100"
      >
        <Modal.Header />
        <Modal.Body>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            View Parameter Details
          </h3>
          <div className="grid gap-4">
            {parameters?.map((param) => (
              <div key={param.parameter_id} className="border-b pb-2 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-600">Parameter Name:</h4>
                    <p className="text-gray-800">{param.parameter_name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FiEdit
                      className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleEditClick(param)}
                      title="Edit"
                    />
                    <FiTrash2
                      className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
                      onClick={() => handleDeleteClick(param)}
                      title="Delete"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <h4 className="font-bold text-gray-600">Description:</h4>
                    <p className="text-gray-800">
                      {param.parameter_description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <Button color="blue" onClick={onClose}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Parameter Modal */}
      <EditParameter
        isOpen={isEditOpen}
        onClose={handleEditClose}
        parameterData={selectedParameter}
      />
    </>
  );
};

export default ViewParameter;
