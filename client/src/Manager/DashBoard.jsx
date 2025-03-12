import React, { useState, useEffect } from "react";
import { Card, Dropdown } from "flowbite-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import PaginatedTable from "../Flowbite/PaginatedTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [cardData, setCardData] = useState([
    { title: "Total Departments", value: "0" },
    { title: "Total Employees", value: "0" },
    { title: "To be Evaluated", value: "0" },
  ]);

  const [chartData, setChartData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Last Month");

  const token = localStorage.getItem("token");

  // Dummy Activities Data
  

  const [activities , setActivities] =useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/lm/view-lm-dashboard", {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (response.data.success) {
          const dashboardData = response.data.data;

          // Update card data
          setCardData([
            { title: "Total Departments", value: dashboardData.total_departments },
            { title: "Total Employees", value: dashboardData.total_employees },
            { title: "To be Evaluated", value: dashboardData.pending_evaluations },
          ]);

          // Update chart data
          const formattedChartData = dashboardData.performance_data.map((item) => ({
            name: item.department_name,
            performanceScore: item.total_performance_score,
          }));
          setChartData(formattedChartData);

          // Update employees data
          setEmployees(
            dashboardData.employees_data.map((emp) => ({
              name: emp.full_name,
              email: emp.email,
              department: emp.department_name,
              performanceScore: emp.performance_score,
            }))
          );
          // toast.success("Dashboard data fetched successfully!");
        } else {
          toast.error(response.data.message || "Failed to fetch dashboard data.");
        }
      } catch (error) {
        toast.error("Error fetching dashboard data.");
        console.error("Error:", error);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await axios.get("http://localhost:8080/lm/get-recent-activities", {
          headers: { Authorization: `${token}` },
        });
    
        if (response.data.success) {
          const formattedActivities = response.data.recentActivities.map((activity) => ({
            id: activity.activity_id,  // Unique ID for key
            title: activity.table_name.replace(/_/g, " "), // Format table name
            description: activity.activity_description,
            time: new Date(activity.timestamp).toLocaleString(), // Format time
          }));
    
          setActivities(formattedActivities);
        } else {
          toast.error(response.data.message || "Failed to fetch recent activities.");
        }
      } catch (error) {
        toast.error("Error fetching recent activities.");
        console.error("Error:", error);
      }
    };
    

    fetchActivities();
    fetchDashboardData();
  }, [token]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    console.log(`Filter selected: ${filter}`);
  };

  const columns = [
    { header: "Employee Name", key: "name" },
    { header: "Email Address", key: "email" },
    { header: "Department", key: "department" },
    { header: "Performance Score", key: "performanceScore" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer position="top-right" autoClose={3000}  />

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cardData.map((card, index) => (
          <Card key={index} className="shadow bg-white">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-[#325679] dark:text-white">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                {card.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Graphical Performance</h2>
          {/* <Dropdown
            label={selectedFilter}
            inline={true}
            arrowIcon={true}
            className="cursor-pointer"
          >
            <Dropdown.Item onClick={() => handleFilterChange("Last Month")}>
              Last Month
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange("This Month")}>
              This Month
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange("Last Week")}>
              Last Week
            </Dropdown.Item>
          </Dropdown> */}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="performanceScore" fill="#0160c9" barSize={25} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
  {/* Top Employees Section (8 columns on large screens) */}
  <div className="bg-white shadow p-6 rounded-lg lg:col-span-8">
    <h2 className="text-xl font-bold mb-4">Top Employees</h2>
    <PaginatedTable data={employees} columns={columns} row={5} />
  </div>

  {/* Recent Activity Section (4 columns on large screens) */}
  <div className="bg-white shadow-lg p-6 rounded-lg lg:col-span-4">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Recent Activity</h2>
    <p className="text-gray-500 text-lg cursor-pointer hover:underline">View all</p>
  </div>
  <ul className="relative">
    {activities.length > 0 ? (
      activities.map((activity, index) => (
        <li key={activity.id} className="flex items-start space-x-4 py-4 relative">
          <div className="w-4 flex flex-col items-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            {index !== activities.length - 1 && <div className="h-full w-0.5 bg-blue-500"></div>}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg w-full shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
          </div>
        </li>
      ))
    ) : (
      <p className="text-gray-500">No recent activity found.</p>
    )}
  </ul>
</div>

</div>


      {/* Employees Table */}
     
    </div>
  );
}
