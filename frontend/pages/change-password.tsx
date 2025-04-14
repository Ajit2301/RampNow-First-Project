import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../src/app/globals.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:8080/get-user-email", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmail(response.data.email);
      } catch (err) {
        console.error("Failed to fetch user email:", err);
        setError("Failed to fetch user email. Please try again.");
      }
    };

    fetchEmail();
  }, []);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long and include at least one number and one special character.");
      return;
    }
  
    if (oldPassword === newPassword) {
      setError("New password cannot be the same as the old password.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      await axios.put(
        "http://localhost:8080/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSuccess("Password updated successfully!");
      setError("");
      alert("✅ Password changed successfully!");
  
      router.push(email === "admin@gmail.com" ? "/dashboard" : "/user-dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">🔐 Change Password</h1>

        {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm transition duration-200"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
