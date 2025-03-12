import { useState } from "react";
import { TextInput, Button } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";  // Import axios for API requests
import image from "../assets/Rectangle 6052.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleContinue = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
      });
      return;
    }

    try {
      // Make the API request to send the verification code
      const response = await axios.post("http://localhost:8080/user/request-reset-password", {
        email,
      });

      // Assuming the token is returned in response.data.token
      const token = response.data.reset_token;
      console.log('data ', response.data);
      
      console.log("Token:", token);

      // Show success message
      toast.success("Verification Link sent it! Now Check your email ", {
        position: "top-right",
        autoClose: 2000, // Shorter duration to let the user navigate smoothly
        closeOnClick: true,
      });

      // Delay navigation slightly to allow the toast to display
      setTimeout(() => {
        // Navigate to new-password page with token and email in state
        // navigate("/new-password", { state: { token } });
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred, please try again.", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
      });
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer /> {/* Toast container for notifications */}

      {/* Left Section (Form) */}
      <div className="flex flex-1 flex-col justify-center px-12 bg-white">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Forgot password</h1>
          <p className="text-gray-600 mb-6">
            Enter your email for the verification process, we will send a 4-digit code to your email.
          </p>
          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <TextInput
              id="email"
              type="email"
              placeholder="hannah.green@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Set email state
              required
              className="w-full"
            />
          </div>
          {/* Continue Button */}
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Right Section (Image) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={image}
          alt="Financial Charts"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
