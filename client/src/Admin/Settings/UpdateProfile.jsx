// src/components/UpdateProfile.js

import React, { useState, useEffect } from "react";
import { Label, TextInput, Button } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import img from "../../assets/Image wrap.png";


const UpdateProfile = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(img);
  const [userId, setUserId] = useState(null); // Store user ID from response

  const token = localStorage.getItem("token");

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/user/get-user",
          {
            headers: { Authorization: `${token}` },
          }
        );
        if (response.data.success) {
          const user = response.data.user;
          setFullname(user.full_name);
          setUsername(user.user_name);
          setPhone(user.phone);
          setOrganizationName(user.organization_name);
          setUserId(user.user_id); // Store user ID for later use
// setAddress(user.address);
          console.log("User Data:", user);
        
      // Constructing image URL safely
if (user.profile_photo) {
  const filePathArray = user.profile_photo.split("\\");
  const fileName = filePathArray[filePathArray.length - 1];
  setPreviewPhoto(
    `http://localhost:8080/uploads/profilePicture/${fileName}`
  );

} else {
  // If profile photo is null, set a default image
  setPreviewPhoto(img);
}

        }
      } catch (error) {
        toast.error("Failed to fetch user data.");
        console.log("User Data Fetch Error:", error);
      }
    };

    fetchUserData();
  }, [token]);

  // Update Profile
  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("phone", phone);
    formData.append("organization_name", organizationName);
    formData.append("address", address);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    try {
      const response = await axios.put(
        `http://localhost:8080/user/update-profile/${userId}`, // Use userId from state
        formData,
        {
          headers: { 
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
        
      );
console.log("Profile Update Response:", response.data);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Error updating profile.");
      console.log("Profile Update Error:", error);
    }
  };

  // Handle Photo Change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full rounded-lg p-5">
      <ToastContainer />
      <div className="flex md:flex-row items-center space-x-4 md:space-x-0 md:space-y-2 m-3">
        <div className="relative group">
          <img
            src={previewPhoto}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
            <span className="text-white text-sm">Edit</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
          />
        </div>
        <div className="md:text-center">
          <h2 className="text-2xl font-semibold text-gray-800">{fullname}</h2>
          <p className="text-gray-500">{username}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mt-16 md:space-x-4">
        <div className="m-3">
          <h3 className="text-xl font-semibold">Personal Info</h3>
          <p className="text-sm text-gray-500">
            Update your photo and personal details.
          </p>
        </div>
        <div className="w-full md:w-full bg-white rounded-lg p-5">
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="fullname" value="Full Name" />
              <TextInput
                id="fullname"
                type="text"
                sizing="md"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="username" value="Username" />
              <TextInput
                id="username"
                type="text"
                sizing="md"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone" value="Phone Number" />
              <TextInput
                id="phone"
                type="text"
                sizing="md"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="organization_name" value="Organization Name" />
              <TextInput
                id="organization_name"
                type="text"
                sizing="md"
                placeholder="Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
            {/* <div className="md:col-span-2">
              <Label htmlFor="address" value="Address" />
              <TextInput
                id="address"
                type="text"
                sizing="md"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div> */}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button color="gray">Cancel</Button>
            <Button color="blue" onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
