import React, { useState, useEffect } from "react";
import { Card, Dropdown } from "flowbite-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import PaginatedTable from "../Flowbite/PaginatedTable";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Last Month");
  const [activities, setActivities] = useState([]);

  const organization_id = localStorage.getItem("selectedOrganizationId");
  const token = localStorage.getItem("token");

  // Fetch Data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/user/view-admin-dashboard/${organization_id}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (response.data.success) {
          const data = response.data.data;
          setDashboardData(data);

          // Format Chart Data
          const formattedChartData = data.performance_data.map((item) => ({
            name: item.department_name,
            totalScore: item.total_performance_score,
            date: new Date(item.date),
          }));
          setChartData(formattedChartData);
          setFilteredChartData(formattedChartData);

          // Set Employee Data
          const employeeData = data.employees_data.map((emp) => ({
            ...emp,
            date: new Date(emp.date), // Convert to Date object
          }));
          setEmployees(employeeData);
          setFilteredEmployees(employeeData);

          // Set Activities Data
          setActivities(data.recent_activities || []);

          // toast.success("Dashboard data fetched successfully!");
        } else {
          toast.error("Failed to fetch dashboard data.");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        toast.error("Error fetching dashboard data.");
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/user/get-recent-activities`,
          {
            headers: { Authorization: `${token}` },
          }
        );
    console.log('response', response.data);
    
        if (response.data.success) {
          const data = response.data.recentActivities.map((activity) => ({
            id: activity.activity_id,
            title: activity.table_name, // You can modify this as needed
            time: new Date(activity.timestamp).toLocaleString(),
            description: activity.activity_description,
          }));
    
          setActivities(data);
        } else {
          toast.error("Failed to fetch recent activities.");
        }
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        toast.error("Error fetching recent activities.");
      }
    };
    

    fetchData();
    fetchActivities();
  }, [organization_id, token]);

  // Filter Function
  const filterData = (filter) => {
    setSelectedFilter(filter);
    const today = new Date();
    let startDate;

    if (filter === "Last Month") {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    } else if (filter === "This Month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (filter === "Last Week") {
      startDate = new Date(today.setDate(today.getDate() - 7));
    }

    const filteredChart = chartData.filter(
      (item) => item.date >= startDate
    );
    setFilteredChartData(filteredChart);

    const filteredEmp = employees.filter(
      (emp) => emp.date >= startDate
    );
    setFilteredEmployees(filteredEmp);
  };

  const columns = [
    { header: "Employee Name", key: "full_name" },
    { header: "Email Address", key: "email" },
    { header: "Department", key: "department_name" },
    { header: "Performance Score", key: "performance_score" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer />

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { title: "Total Departments", value: dashboardData.total_departments || 0 },
          { title: "Total Employees", value: dashboardData.total_employees || 0 },
          { title: "Active Users", value: dashboardData.total_active_employees || 0 },
        ].map((card, index) => (
          <Card key={index} className="shadow bg-white">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-[#325679]">{card.title}</p>
              <p className="text-3xl font-bold text-gray-700">{card.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Department Performance</h2>

          {/* Dropdown for Filter */}
          <Dropdown label={selectedFilter} inline arrowIcon className="cursor-pointer">
            <Dropdown.Item onClick={() => filterData("Last Month")}>Last Month</Dropdown.Item>
            <Dropdown.Item onClick={() => filterData("This Month")}>This Month</Dropdown.Item>
            <Dropdown.Item onClick={() => filterData("Last Week")}>Last Week</Dropdown.Item>
          </Dropdown>
        </div>

        {/* Scrollable Chart Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="totalScore" fill="#0160c9" barSize={25} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table and Recent Activity Section */}
      <div className="flex flex-col lg:flex-row gap-4 my-4">
        <div className="bg-white shadow p-6 rounded-lg lg:w-2/3">
          <h2 className="text-xl font-bold mb-4">Top Employees</h2>
          <PaginatedTable data={filteredEmployees} columns={columns} row={5} />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow-lg p-6 rounded-lg lg:w-1/3">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Recent Activity</h2>
    <p className="text-gray-500 text-lg cursor-pointer hover:underline">View all</p>
  </div>
  <ul className="relative">
    {activities.length > 0 ? (
      activities.map((activity) => (
        <li key={activity.id} className="flex items-start space-x-4 py-4 relative">
          <div className="w-4 flex flex-col items-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-full w-0.5 bg-blue-500"></div>
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
    </div>
  );
}
