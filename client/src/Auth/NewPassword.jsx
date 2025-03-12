import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";  
import image from "../assets/Rectangle 6052.png";

export default function NewPassword() {
  const [verificationToken, setVerificationToken] = useState(""); // New input field for token
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => { 
    // Validate inputs
    if (!verificationToken) {
      toast.error("Verification token is required!", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Both password fields are required!", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const token =verificationToken;
      // Send API request with user-entered token
      const response = await axios.post(
        `http://localhost:8080/user/update-password/${token}`,
        { newPassword: newPassword }
      );

      toast.success("Password reset successfully!", { position: "top-right", autoClose: 3000 });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred, please try again.", { position: "top-right", autoClose: 3000 });
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer />

      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center items-center px-10 bg-gray-50">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4">Create a New Password</h1>
          <p className="text-center text-gray-600 mb-8">Enter your verification token and a new password</p>

          {/* Verification Token Field */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Verification Token</label>
            <TextInput
              type="text"
              placeholder="Enter your token"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              required
            />
          </div>

          {/* New Password Field */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
            <TextInput
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
            <TextInput
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Reset Password Button */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-4" onClick={handleResetPassword}>
            Reset Password
          </Button>

          {/* Back to Login Link */}
          <div className="mt-6 text-sm text-center text-gray-700">
            Remember your password?{" "}
            <Link to="/login" className="font-medium text-blue-500 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img src={image} alt="Password Reset Illustration" className="object-cover w-full h-full" />
      </div>
    </div>
  );
}
