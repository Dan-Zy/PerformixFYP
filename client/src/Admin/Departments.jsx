import React, { useState, useEffect, useCallback } from "react";
import { HiSearch, HiX } from "react-icons/hi"; // Importing search & close icons
import PaginatedTable from "../Flowbite/PaginatedTable";
import AddDepartmentModal from "../Modal/AddDepartmentModal";
import EditDepartmentModal from "../Modal/EditDepartmentModal";
import axios from "axios";

// Toastify for notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Departments = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]); // State for departments
  const [loading, setLoading] = useState(false); // State to track loading status

  // Retrieve the token and organization ID from localStorage
  const token = localStorage.getItem("token");
  const organizationId = localStorage.getItem("selectedOrganizationId");

  // Check for token and organizationId in console
  console.log("token :", token, "organizationId :", organizationId);

  // Column definitions for the table
  const columns = [
    { header: "Department Name", accessor: "department_name", key: "department_name" },
    { header: "Employee Count", accessor: "employee_count", key: "employee_count" },
    { header: "Department ID", accessor: "department_id", key: "department_id" },
    { header: "Action", accessor: "action", isAction: true, key: "action" },
  ];

  // Fetch departments data using useCallback for memoization
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/department/get-departments/${organizationId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        setDepartments(response.data.departments); // Set the fetched departments

        // Success toast for fetching data
        toast.success("Departments fetched successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        console.error("Failed to fetch departments:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, token]);

  // Call fetchDepartments when token and organizationId are available
  useEffect(() => {
    if (token && organizationId) {
      fetchDepartments();
    } else {
      console.error("Token or Organization ID is missing.");
    }
  }, [token, organizationId]);


  const handleEdit = useCallback((department) => {
    setSelectedOrg(department);
    setEditModalOpen(true);
  }, [fetchDepartments]);

  const handleDelete = useCallback(
    async (department) => {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the department "${department.department_name}"?`
      );

      if (confirmDelete) {
        try {
          // Send the department_id to the delete API
          const response = await axios.delete(
            `http://localhost:8080/department/delete-department/${department.department_id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          if (response.data.success) {
            // Success toast for deletion
            toast.success(`Department "${department.department_name}" deleted successfully.`, {
              position: "top-right",
              autoClose: 3000,
            });

            fetchDepartments(); // Refresh departments after deletion
          } else {
            toast.error(`Failed to delete department: ${response.data.message}`, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error("Error deleting department:", error);
          toast.error("There was an error deleting the department.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    },
    [fetchDepartments, token]
  );

  // Filtered data based on search input
  const filteredData = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Department Management</h2>

        {/* Search & Add Department Button */}
        <div className="flex items-center space-x-2">
          <div className="relative w-72">
            <HiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {searchTerm && (
              <HiX
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => setModalOpen(true)}
          >
            + Add Department
          </button>
        </div>
      </div>

      {/* Paginated Table Component */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <PaginatedTable
          data={filteredData} // Use filtered data
          columns={columns}
          row={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        refreshDepartments={fetchDepartments}
      />
      <EditDepartmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        departmentData={selectedOrg}
        refreshDepartments={fetchDepartments}
      />
    </div>
  );
};

export default Departments;
