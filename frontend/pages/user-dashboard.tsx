import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import "../src/app/globals.css";

interface UserData {
  first_name: string;
  last_name: string;
  gender: string;
  location: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  salary: number;
  join_date: string;
  years_of_experience: number;
}

const UserDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!email || !token) {
      router.push("/login");
      return;
    }

    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else if (router.query.user) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(router.query.user as string));
        setUserData(decodedUser);
        localStorage.setItem("user", JSON.stringify(decodedUser));
      } catch (error) {
        console.error("Error decoding user data:", error);
      }
    }

    setLoading(false);
  }, [router.isReady, router.query]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-indigo-100">
        <span className="text-lg font-medium text-gray-700">Loading user data...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <span className="text-red-700 font-semibold">Error loading user data. Please try again.</span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">User Dashboard</h1>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md"
            >
              👤
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border">
                <button
                  onClick={handleChangePassword}
                  className="block w-full px-4 py-2 text-left text-indigo-600 hover:bg-indigo-100"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl mx-auto border border-indigo-200">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl text-indigo-600 shadow-inner">
              {userData.first_name[0]}
            </div>
            <div className="ml-4">
              <p className="text-xl font-semibold text-indigo-800">
                {userData.first_name} {userData.last_name}
              </p>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <li><span className="font-semibold">Gender:</span> {userData.gender}</li>
            <li><span className="font-semibold">Location:</span> {userData.location}</li>
            <li><span className="font-semibold">Phone:</span> {userData.phone}</li>
            <li><span className="font-semibold">Department:</span> {userData.department}</li>
            <li><span className="font-semibold">Role:</span> {userData.role}</li>
            <li><span className="font-semibold">Salary:</span> ₹{userData.salary.toLocaleString()}</li>
            <li><span className="font-semibold">Join Date:</span> {new Date(userData.join_date).toLocaleDateString()}</li>
            <li><span className="font-semibold">Experience:</span> {userData.years_of_experience} years</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;
