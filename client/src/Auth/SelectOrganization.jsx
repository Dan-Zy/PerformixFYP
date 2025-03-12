import { useState, useEffect } from "react";
import { Button, Select } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios"; // Import axios
import image from "../assets/Rectangle 6052.png";

export default function SelectOrganization() {
  const navigate = useNavigate();

  // Retrieve the token from localStorage
  const token = localStorage.getItem("token");
console.log('token ', token);

  // If no token, navigate to login page
  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if token is not found
    }
  }, [token, navigate]);

  const [organizations, setOrganizations] = useState([]); // State to store organizations
  const [selectedOrganization, setSelectedOrganization] = useState(""); // State for selected organization

  // Fetch organizations from the API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get("http://localhost:8080/organization/get-organizations", {
          headers: {
            Authorization: `${token}`, // Send token in Authorization header
          },
        });
        console.log('response', response);
        
        if (response.data.success) {
          setOrganizations(response.data.organizations); // Set organizations in state
        } else {
          console.error("Failed to fetch organizations:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, [token]); // Run whenever token changes

  const handleNextClick = () => {
    // Validate that an organization is selected
    if (!selectedOrganization) {
      alert("Please select an organization.");
      return;
    }
  localStorage.removeItem("selectedOrganizationId");
    // Get the organization object from the organizations array
    const selectedOrg = organizations.find(
      (org) => org.organization_name === selectedOrganization
    );
  
    console.log("Selected Organization:", selectedOrg);
    
    
    // Save the organization ID in localStorage
    if (selectedOrg) {
      localStorage.setItem("selectedOrganizationId", selectedOrg.organization_id);
      localStorage.setItem("selectedOrganization", selectedOrg.organization_name);
    }
  
    // Navigate to the next page
    navigate("/admin/dashboard");
  };
  

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center items-center px-10 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center mb-4">Select Your Organization</h1>
          <p className="text-center text-gray-600 mb-8">
            Please select the organization you belong to.
          </p>

          {/* Organization Dropdown */}
          <div className="mb-4 w-full">
            <label
              htmlFor="organization"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Organization
            </label>
            <Select
              id="organization"
              required
              className="w-full"
              value={selectedOrganization} // Set the selected value
              onChange={(e) => setSelectedOrganization(e.target.value)} // Update the selected organization
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.organization_id} value={org.organization_name}>
                  {org.organization_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Next Button */}
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-4"
            onClick={handleNextClick} // Handle click
          >
            Next
          </Button>

          {/* Back to Login Link */}
          <div className="mt-6 text-sm text-center text-gray-700">
            <Link
              to="/login"
              className="font-medium text-blue-500 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={image}
          alt="Organization Illustration"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
