import React ,{ useState,useEffect} from "react";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const RankCard = ({ rank }) => (
  <div className="p-2 bg-white rounded-lg border-l-4 border-[#335679]">
    <h2 className="text-2xl font-semibold mb-4 text-[#335679] ms-2">My Rank</h2>
    <h2 className="text-2xl font-semibold mb-4 text-[#000000] ms-2">{rank || "Loading..."}</h2>
  </div>
);

export const SurveyCard = () => (
  <div className="p-2 bg-white rounded-lg border-l-4 border-[#1FB356]">
    <h2 className="text-2xl font-semibold mb-4 text-[#335679] ms-2">Survey</h2>
    <h2 className="text-2xl font-semibold mb-4 text-[#1FB356] ms-2">Available</h2>
  </div>
);




export const PerformanceChart = ({ chartData }) => {
  if (!chartData || chartData.labels.length === 0) {
    return <p className="text-center text-gray-500">No evaluation data available.</p>;
  }

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg  items-center justify-between">
          <h2 className="text-xl font-bold mb-4">Last Month Performance</h2>
      {/* Labels (Left Side) */}
      <div className="items-center flex justify-center">
      <div className="w-1/3 ">
      
      <ul className="space-y-2">
        {chartData.labels.map((label, index) => (
          <li key={index} className="text-gray-700 font-medium">
            <span className="inline-block w-3 h-3 mr-2 rounded-full" 
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}>
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>

    {/* Doughnut Chart (Right Side) */}
    <div className="w-2/3">
      <Doughnut
        data={chartData}
        options={{
          cutout: "70%",
          plugins: { legend: { display: false } }, // Hide default legend
        }}
      />
    </div>
      </div>
    
    </div>
  );
};


export const EvaluationList = ({ feedbackList }) => {
    console.log('Feed backe list ',feedbackList);
    
    return(
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Employee Evaluations</h2>
      <ul className="space-y-4">
        {feedbackList.length > 0 ? (
          feedbackList.map((feedback, index) => (
            <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm text-gray-700">
              {feedback}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No feedback available.</p>
        )}
      </ul>
    </div>
  )};
  

export const RecommendationForm = ({ recommendation, setRecommendation, submitRecommendation }) => (
  <div className="p-6 bg-white shadow-lg rounded-lg border">
    <h2 className="text-lg font-bold mb-4">Submit Recommendation</h2>
    <textarea className="w-full p-4 border rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-200" rows="4" placeholder="Write your recommendation here.." value={recommendation} onChange={(e) => setRecommendation(e.target.value)}></textarea>
    <div className="flex justify-end mt-3">
      <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all" onClick={submitRecommendation}>Submit</button>
    </div>
  </div>
);

export const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await axios.get("http://localhost:8080/staff/get-recent-activities", {
          headers: { Authorization: `${token}` },
        });

        if (response.data.success && response.data.recentActivities) {
          setActivities(response.data.recentActivities);
        } else {
          toast.warn("No recent activities available.");
        }
      } catch (error) {
        toast.error("Error fetching recent activities.");
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <p className="text-gray-500 text-lg cursor-pointer">View all</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-center text-gray-500">No recent activities found.</p>
      ) : (
        <ul className="relative">
          {activities.map((activity, index) => (
            <li key={activity.activity_id} className="flex items-start space-x-4 py-4 relative">
              <div className="flex flex-col bg-gray-100 p-4 rounded-lg w-full shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold">{activity.action_type}</p>
                  <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">{activity.activity_description}</p>
              </div>
              {index !== activities.length - 1 && (
                <div className="absolute left-4 top-22 h-8 w-0.5 bg-blue-500"></div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
  