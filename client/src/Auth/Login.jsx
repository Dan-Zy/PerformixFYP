import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import image from "../assets/Rectangle 6052.png";
import logo from "../assets/Social icon.png";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate password
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/user/login-user",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log("data:", data);

      const { token, anyOrganization, isManager, isStaff, userId, users_data } = data;
      console.log("anyOrganization", anyOrganization);
      console.log("isManager", isManager);
      console.log("isStaff", isStaff);
      console.log("users_data", users_data.email);
      console.log("users_data", users_data.profile_photo);
      console.log('users_data', users_data.full_name);

      localStorage.setItem("email", users_data.email);
      localStorage.setItem("full_name", users_data.full_name);
      localStorage.setItem("profile_photo", users_data.profile_photo);
      localStorage.setItem("token", token);
      localStorage.setItem('user_id', userId);

      toast.success("Successfully signed in!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        if (isStaff) {
          localStorage.setItem("Stafftoken", token);
          localStorage.removeItem("Managertoken");
          navigate("/employee/dashboard");
        } else if (isManager) {
          localStorage.setItem("Managertoken", token);
          localStorage.removeItem("Stafftoken");
          navigate("/manger/dashboard");
        } else if (!anyOrganization) {
          navigate("/create-organization");
        } else {
          navigate("/select-organization");
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again!";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse; // Google ID token
console.log("Google ID token:", credential);
console.log("Google ID token:",credentialResponse);


      // Send the Google ID token to your backend for verification
      const response = await axios.post(
        "http://localhost:8080/user/auth/google",
        { token: credential },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log("Google Sign-In Response:", data);

      const { token, user  , anyOrganization} = data;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("email", user.email);
      localStorage.setItem("full_name", user.full_name);
      localStorage.setItem("profile_photo", user.profile_photo);

console.log("anyOrganization", anyOrganization);
console.log("user", user , token);


      toast.success("Google Sign-In successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      // Navigate based on user role (you can customize this logic)
      setTimeout(() => {
        if (!anyOrganization) {
          navigate("/create-organization");
        } else {
          navigate("/select-organization");
        } // Replace with your desired route
      }, 2000);
    } catch (error) {
      console.error("Google Sign-In error:", error);

      const errorMessage =
        error.response?.data?.message || "Google Sign-In failed. Please try again!";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
         <div className="flex h-screen">
        <ToastContainer /> {/* Toast container for notifications */}

        {/* Left Section */}
        <div className="flex flex-1 flex-col justify-center items-center px-10 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Heading */}
            <h1 className="text-3xl font-bold text-center mb-4">Welcome Back</h1>
            <p className="text-center text-gray-600 mb-8">
              Please enter your details to log in
            </p>

            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <TextInput
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <TextInput
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-4">
              <Link
                to="/forget-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-4"
              onClick={handleSignIn}
            >
              Sign In
            </Button>

            {/* Google Login */}
            <GoogleOAuthProvider clientId="966150195676-d4upn5r2lrsgkicf2g9028tl8vvsv77s.apps.googleusercontent.com">
  <GoogleLogin
    onSuccess={handleGoogleSignIn}
    onError={() => {
      toast.error("Google Sign-In failed. Please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
    }}
    useOneTap
    text="signin_with"
    shape="rectangular"
    size="large"
    logo_alignment="left"
  />
</GoogleOAuthProvider>

            {/* Signup Link */}
            <div className="mt-6 text-sm text-center text-gray-700">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-500 hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
          <img
            src={image}
            alt="Login Illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
   
  );
}