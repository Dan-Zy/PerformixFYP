import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";

import GraphReport from "./Report/GraphReport";
import DetailReport from "./Report/DetailReport";

export default function Report() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activeTab, setActiveTab] = useState("graph"); 

 
  return (
    <div className="m-2 p-4 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4 flex-col lg:flex-row gap-4">
        <form>
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Start Time */}
            {/* <div className="flex flex-col">
              <label
                htmlFor="start-time"
                className="text-sm font-semibold text-[#030303] dark:text-white"
              >
                Start Time:
              </label>
              <div className="flex">
                <input
                  type="time"
                  id="start-time"
                  className="shrink-0 rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 p-2.5"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <select
                  id="start-timezones"
                  name="start-timezone"
                  className="bg-gray-50 border border-s-0 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  required
                >
                  <option value="America/New_York" selected>
                    UTC-5
                  </option>
                </select>
              </div>
            </div> */}

            {/* End Time */}
            {/* <div className="flex flex-col">
              <label
                htmlFor="end-time"
                className="text-sm font-semibold text-[#030303] dark:text-white"
              >
                End Time:
              </label>
              <div className="flex">
                <input
                  type="time"
                  id="end-time"
                  className="shrink-0 rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 p-2.5"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
                <select
                  id="end-timezones"
                  name="end-timezone"
                  className="bg-gray-50 border border-s-0 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  required
                >
                  <option value="America/New_York" selected>
                    UTC-5
                  </option>
                </select>
              </div>
            </div> */}
          </div>
        </form>

        {/* Download & Tabs */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-end">
          {/* Download Button */}
          <button className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-300 hover:bg-gray-100">
            <FaDownload className="mr-2 text-gray-500" />
            Download
          </button>

          {/* Tab Buttons */}
          <div className="p-1 bg-white rounded-lg flex gap-0 shadow-md border border-gray-300">
            <button
              className={`px-4 py-2 font-medium rounded-lg ${
                activeTab === "graph"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600"
              }`}
              onClick={() => setActiveTab("graph")}
            >
              Graph Report
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-lg ${
                activeTab === "detail"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600"
              }`}
              onClick={() => setActiveTab("detail")}
            >
              Detail Report
            </button>
          </div>
        </div>
      </div>

<div>
{activeTab === "graph" && <GraphReport />}
{activeTab === "detail" && <DetailReport />}
</div>
    </div>
  );
}
