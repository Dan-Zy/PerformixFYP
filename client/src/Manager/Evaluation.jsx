import React, { useEffect, useState } from "react";
import axios from "axios";
import "flowbite/dist/flowbite.css";
import { Label, TextInput, Button } from "flowbite-react";
import img from "../assets/Image wrap.png";
import GraphReport from "./GraphReport";

const Evaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [viewGraph, setViewGraph] = useState(false); // Toggle state

  useEffect(() => {  
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/get-evaluations", {
          headers: { Authorization: `${token}` },
        });
    
        console.log("data:", response.data);
    
        if (response.data.success) {
          // Ensure evaluations is an array
          const evaluations = Array.isArray(response.data.evaluations) 
            ? response.data.evaluations 
            : [];
    
          setEvaluations(evaluations);
          setTotalEvaluations(response.data.total_evaluations);
    
          setFeedback(
            evaluations.length > 0
              ? evaluations.map((item) => item.feedback?.trim() || "No feedback available")
              : ["No Evaluations evaluated for you by your Admin"]
          );
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      }
    };
    
    fetchEvaluations();
  }, []);

  return (
    <div className="m-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <img src={img} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Employee Evaluation</h2>
            <p className="text-gray-500">Total Evaluations: {totalEvaluations}</p>
          </div>
        </div>

        {/* Toggle Button */}
        <Button onClick={() => setViewGraph(!viewGraph)} className="bg-blue-500 hover:bg-blue-600 p-2">
          {viewGraph ? "Evaluation List" : "Graph Evaluation"}
        </Button>
      </div>

      {viewGraph ? (
        <GraphReport />
      ) : (
        <div>
          {/* Evaluation Parameters Section */}
          <div className="flex flex-col lg:flex-row w-full mt-6 justify-between">
            <div className="m-3 lg:w-1/3">
              <h3 className="text-lg font-semibold">Evaluation Parameters</h3>
              <p className="text-sm text-gray-500">Employee performance metrics and results</p>
            </div>
            <div className="mb-6 lg:w-2/3">
              <div className="w-full bg-white p-6 rounded-lg shadow-md grid grid-cols-1 gap-4 mt-4">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.evaluation_id} className="flex flex-col space-y-2">
                    <Label htmlFor={evaluation.metric_id} value={evaluation.metric_name} />
                    <div className="flex space-x-4">
                      <TextInput
                        className="w-full"
                        id={evaluation.metric_id}
                        type="number"
                        value={evaluation.marks_obtained}
                        readOnly
                      />
                      <TextInput className="w-full" placeholder={evaluation.parameter_name} readOnly />
                    </div>
                    <span className="text-xs text-gray-500">Weightage: {evaluation.total_weightage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="flex flex-col lg:flex-row w-full mt-16 justify-between">
            <div className="m-3 w-1/3">
              <h3 className="text-lg font-semibold">Feedback</h3>
              <p className="text-sm text-gray-500">Manager's feedback on performance</p>
            </div>
            <div className="lg:w-2/3 bg-white rounded-lg p-5">
              <h3 className="text-lg font-semibold">Overall Feedback</h3>
              <ul className="list-disc list-inside">
                {feedback.length > 0 ? (
                  feedback.map((item, index) => (
                    <li key={index} className="text-sm text-gray-500">{item}</li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No feedback available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
