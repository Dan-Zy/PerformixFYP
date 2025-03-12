import { useState, useEffect } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { MdFilterList } from "react-icons/md";
import GoalModal from "../Modal/AddGoal";

export default function Goal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    date: "",
    description: "",
    milestone: "Milestone #01",
    file: null,
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("http://localhost:8080/staff/get-goals", {
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const todoTasks = [];
        const progressTasks = [];
        const doneTasks = [];

        data.goals.forEach((goal) => {
          const formattedTask = {
            id: goal.goal_id,
            title: goal.task_name,
            date: goal.completion_date.split(" ")[0],
            subtasks: [goal.task_description || "No description provided"],
            milestones: goal.milestones || {},
          };

          if (goal.goal_status === "Pending") {
            todoTasks.push(formattedTask);
          } else if (goal.goal_status === "In Progress") {
            progressTasks.push(formattedTask);
          } else if (goal.goal_status === "Completed") {
            doneTasks.push(formattedTask);
          }
        });

        setTasks(todoTasks);
        setInProgressTasks(progressTasks);
        setCompletedTasks(doneTasks);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const updateGoalStatus = async (goalId, status) => {
    try {
      const response = await fetch(`http://localhost:8080/staff/update-goal-status/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchGoals();
      } else {
        console.error("Failed to update goal status");
      }
    } catch (error) {
      console.error("Error updating goal status:", error);
    }
  };

  return (
    <div className="m-2 bg-white rounded-lg px-4 py-6">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row">
        <h2 className="hidden md:block text-lg font-semibold text-gray-700">Goals</h2>
        <div className="flex flex-col sm:flex-row items-center space-x-2 sm:space-x-2 mt-4 sm:mt-0">
          <div className="relative w-full sm:w-90 mb-2 sm:mb-0">
            {/* <HiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            /> */}
            {/* {searchTerm && (
              <HiX
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )} */}
          </div>
          {/* <div className="p-1 border border-gray-300 rounded-lg m-1">
            <MdFilterList size={28} color="#777b8b" />
          </div> */}
          <button
            className="bg-blue-500 w-2/3 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            onClick={() => setIsModalOpen(true)}
          >
            <span>ADD GOAL</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[{ title: "To Do", tasks, showAdd: true }, { title: "In Progress", tasks: inProgressTasks }, { title: "Completed", tasks: completedTasks }].map((section, index) => (
          <div key={index} className="bg-gray-300 p-3 rounded-lg">
            <div className="flex justify-between items-center m-2">
              <p className="font-semibold">
                {section.title} <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">{section.tasks.length}</span>
              </p>
              {section.showAdd && (
                <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <FaPlus size={20} className="text-gray-500" />
                </button>
              )}
            </div>
            <div className="mt-2 space-y-3">
              {section.tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className="text-gray-500 text-sm">{task.date}</span>
                  </div>
                  <ul className="mt-2 text-gray-700 text-sm">
                
                    {task.subtasks.map((subtask, index) => (
                      <li key={index} className="list-disc ml-5">{subtask}</li>
                    ))}
                  </ul>
                  <ul className="mt-2 text-gray-700 text-sm">
                    {task.milestones && Object.entries(task.milestones).map(([key, value]) => (
                      <li key={key} className="list-disc ml-5">{value}</li>
                    ))}
                  </ul>
                  {section.title === "To Do" && (
                    <button onClick={() => updateGoalStatus(task.id, "In Progress")} className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded-lg">
                      Mark as In Progress
                    </button>
                  )}
                  {section.title === "In Progress" && (
                    <button onClick={() => updateGoalStatus(task.id, "Completed")} className="mt-2 bg-green-500 text-white px-3 py-1 rounded-lg">
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} newGoal={newGoal} setNewGoal={setNewGoal} addTask={() => fetchGoals()} />
    </div>
  );
}
