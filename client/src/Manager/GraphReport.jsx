import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const GraphReport = () => {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/get-evaluations", {
          headers: { Authorization: `${token}` },
        });
  
        if (response.data.success) {
          // Ensure evaluations is always an array
          const evaluations = Array.isArray(response.data.evaluations) 
            ? response.data.evaluations 
            : [];
  
          setEvaluations(evaluations);
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      }
    };
  
    fetchEvaluations();
  }, []);
  
  const labels = evaluations.length > 0 ? evaluations.map((e) => e.metric_name) : [];
  const dataValues = evaluations.length > 0 ? evaluations.map((e) => e.marks_obtained) : [];
  const totalWeightages = evaluations.length > 0 ? evaluations.map((e) => e.total_weightage) : [];
  

  const doughnutData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: ["#A9D1FF", "#0057FF", "#C4DFF6", "#4A9EFF"],
        hoverBackgroundColor: ["#8ABAE3", "#0047D4", "#B0CCE8", "#3A8ADC"],
        borderWidth: 0,
      },
    ],
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Performance",
        data: dataValues,
        borderColor: "#4A9EFF",
        backgroundColor: "rgba(74, 158, 255, 0.2)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = evaluations.map((e) => ({
    name: e.metric_name,
    performance: e.marks_obtained,
    total: e.total_weightage,
  }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Last Month Performance</h2>
          <div className="flex items-center justify-center">
            <div className="w-1/3">
              <ul className="space-y-2">
                {doughnutData.labels.map((label, index) => (
                  <li key={index} className="text-gray-700 font-medium">
                    <span
                      className="inline-block w-3 h-3 mr-2 rounded-full"
                      style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[index] }}
                    ></span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Doughnut Chart */}
            <div className="w-2/3">
              <Doughnut
                data={doughnutData}
                options={{
                  cutout: "70%",
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-[#484A54]">Performance Trends</h2>
          <div className="min-w-[500px] h-[400px]">
            <Line data={lineChartData} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-8 shadow-lg">
        <div className="min-w-[900px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="performance" fill="#0160c9" barSize={25} radius={[5, 5, 0, 0]} />
              <Bar dataKey="total" fill="#7ea8f8" barSize={25} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraphReport;
