import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import '../src/app/globals.css';
import { useRef } from "react";
import { AxiosError } from 'axios';

// Define the type for user objects
interface User {
  id: number;
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

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]); // users is now typed as an array of User objects
  const [editingUser, setEditingUser] = useState<User | null>(null);
  type Filters = {
    first_name?: string;
    last_name?: string;
    gender?: string[];
    location?: string[];
    email?: string;
    phone?: string;
    department?: string[];
    role?: string[];
    salary_from?: number;
    salary_to?: number;
    join_date_from?: string;
    join_date_to?: string;
    years_of_experience_from?: number;
    years_of_experience_to?: number;
  };
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    location: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    salary: 0,
    join_date: "",
    years_of_experience: 0,
  });
  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState(""); // For success messages
  const router = useRouter(); // Initialize Next.js router
  const [filters, setFilters] = useState<Filters>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    salary_from: undefined,
    salary_to: undefined,
    join_date_from: "",
    join_date_to: "",
    years_of_experience_from: undefined,
    years_of_experience_to: undefined,
    gender: [],
    location: [],
    department: [],
    role: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(5); // Default limit 
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previousPage, setPreviousPage] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleChangePassword = () => {
    router.push("/change-password"); // Redirect to the password change page
  }

  const fetchUsers = async (filters: Filters = {}, page = 1) => {
    try {
      const response = await axios.get("http://localhost:8080/users", {
        params: {
          ...filters,
          page,
          limit: usersPerPage,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Send the token for authentication
        },
      },
      );
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching users:", err); // Log the error
      setError("Failed to load users. Please try again.");
    }
  };
  const formatDate = (date: string) => {
    const [year, month, day] = new Date(date).toISOString().split("T")[0].split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchUsers(filters, currentPage);
  }, [filters, currentPage]);
  useEffect(() => {
    if (editingUser) {
      setFormData({
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        gender: editingUser.gender,
        location: editingUser.location,
        email: editingUser.email,
        phone: editingUser.phone,
        department: editingUser.department,
        role: editingUser.role,
        salary: editingUser.salary,
        join_date: formatDate(editingUser.join_date),
        years_of_experience: editingUser.years_of_experience,
      });
    }
  }, [editingUser]);
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email !== "admin@gmail.com") {
      router.push("/user-dashboard"); // Redirect non-admin users
    }
  }, []);

  const handleLogout = () => {
    // Clear any authentication tokens or data
    localStorage.removeItem("token"); // Example: Remove token from localStorage
    localStorage.removeItem("email"); // Clear email from localStorage
    router.push("/login"); // Redirect to login page
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setSuccess(""); // Clear previous success
    try {
      if (editingUser) {
        await axios.put(`http://localhost:8080/users/${editingUser.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send the token for authentication
          },
        });
        setSuccess("User updated successfully!");
        setEditingUser(null);
      } else {
        await axios.post("http://localhost:8080/users", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send the token for authentication
          },
        });
        setSuccess("User added successfully!");
      }
      setFormData({
        first_name: "",
        last_name: "",
        gender: "",
        location: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        salary: 0,
        join_date: "",
        years_of_experience: 0,
      });
      fetchUsers(filters, currentPage);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        setError(err.response.data.error || "Validation failed.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setError(""); // Clear previous error
      setSuccess(""); // Clear previous success
      try {
        await axios.delete(`http://localhost:8080/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send the token for authentication
          },
        });
        setSuccess("User deleted successfully!");
        fetchUsers(filters, currentPage);
      } catch (err) {
        console.error("Error deleting users:", err); // Log the error
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLInputElement>, filterName: keyof Filters) => {
    const { value } = e.target;
    setPreviousPage(currentPage);  // Save current page before resetting to 1
    setCurrentPage(1); // Reset to the first page
    setFilters((prev) => {
      const currentSelections = prev[filterName] as string[];
      if (currentSelections.includes(value)) {
        // Remove the selection if already selected
        return {
          ...prev,
          [filterName]: currentSelections.filter((item) => item !== value),
        };
      } else {
        // Add the selection if not already selected
        return {
          ...prev,
          [filterName]: [...(currentSelections || []), value],
        };
      }
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreviousPage(currentPage);  // Save current page before resetting to 1
    setCurrentPage(1);  // Reset to page 1 when applying filter changes
  
    setFilters((prev) => ({
      ...prev,
      [name]: 
        name.includes("salary_from") || 
        name.includes("salary_to") || 
        name.includes("years_of_experience_from") || 
        name.includes("years_of_experience_to") ? 
        (value.trim() === "" ? undefined : parseFloat(value)) : // For numeric filters, handle empty values as undefined
        (name.includes("join_date") ? value || undefined : value), // Handle date inputs (or any other field)
    }));
  };
  
  

  const clearFilters = () => {
    setFilters({
      first_name: "",
      last_name: "",
      gender: [],
      location: [],
      email: "",
      phone: "",
      department: [],
      role: [],
      salary_from: undefined,
      salary_to: undefined,
      join_date_from: "",
      join_date_to: "",
      years_of_experience_from: undefined,
      years_of_experience_to: undefined,
    });
    fetchUsers({}, previousPage || 1); // Fetch all users with no filters
  };


  const handlePageChange = (page: number) => {
    if (page > 0 && page <= Math.ceil(totalUsers / usersPerPage)) {
      setCurrentPage(page);
      fetchUsers(filters, page); // Pass the current filters along with the page number
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const sortUsers = (field: keyof User) => {
    // Toggle sorting order if the same field is clicked again
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    // Sort the users array
    setUsers((prevUsers) => {
      return [...prevUsers].sort((a, b) => {
        if (a[field] < b[field]) return newSortOrder === "asc" ? -1 : 1;
        if (a[field] > b[field]) return newSortOrder === "asc" ? 1 : -1;
        return 0;
      });
    });
  };


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-between relative mb-8">
          {/* Spacer to keep "Admin Dashboard" centered */}
          <div className="w-10"></div> {/* Empty spacer block for alignment */}

          {/* Centered Title */}
          <h1 className="text-4xl font-bold text-cyan-800 text-center flex-1">
            Admin Dashboard
          </h1>
          {/* Account Icon */}
          <div className="relative">
            <div className="absolute top-30 right-4">
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
              >
                {/* User Icon */}
                <span className="text-xl">👤</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                  <button
                    onClick={handleChangePassword}
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{success}</div>}

       {/* Add User Form */}
<div className="bg-white rounded-lg shadow-lg p-6">
  <div className="form-container">
    <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
      {editingUser ? "Edit User" : "Add User"}
    </h2>
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">First Name</label>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        >
          <option value="" disabled className="text-gray-500">Select Gender</option>
          <option value="Male" className="text-black">Male</option>
          <option value="Female" className="text-black">Female</option>
          <option value="Other" className="text-black">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Location</label>
        <select
          name="location"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        >
          <option value="" disabled className="text-gray-500">Select Location</option>
          <option value="Coimbatore" className="text-black">Coimbatore</option>
          <option value="Bangalore" className="text-black">Bangalore</option>
          <option value="Chennai" className="text-black">Chennai</option>
          <option value="Hyderabad" className="text-black">Hyderabad</option>
          <option value="Pune" className="text-black">Pune</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value.toLowerCase() }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
        <input
          type="text"
          name="phone"
          placeholder="+00 00000 00000"
          value={formData.phone}
          onChange={(e) => {
            const input = e.target.value;
            const validInput = /^[+\d\s]*$/.test(input);
            if (validInput) {
              setFormData((prev) => ({ ...prev, phone: input }));
            }
          }}
          onBlur={(e) => {
            const phonePattern = /^\+\d{2} \d{5} \d{5}$/;
            if (!phonePattern.test(e.target.value)) {
              alert("Invalid phone number format. Please use +00 00000 00000 format.");
            }
          }}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        >
          <option value="" disabled className="text-gray-500">Select Department</option>
          <option value="HR" className="text-black">HR</option>
          <option value="Finance" className="text-black">Finance</option>
          <option value="Engineering" className="text-black">Engineering</option>
          <option value="Marketing" className="text-black">Marketing</option>
          <option value="Sales" className="text-black">Sales</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          required
        >
          <option value="" disabled className="text-gray-500">Select Role</option>
          <option value="Admin" className="text-black">Admin</option>
          <option value="User" className="text-black">User</option>
          <option value="Manager" className="text-black">Manager</option>
          <option value="Editor" className="text-black">Editor</option>
          <option value="Developer" className="text-black">Developer</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Salary</label>
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Join Date</label>
        <input
          type="date"
          name="join_date"
          value={formData.join_date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Years of Experience</label>
        <input
          type="number"
          name="years_of_experience"
          placeholder="Years of Experience"
          value={formData.years_of_experience}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          min="0"
          required
        />
      </div>

      <div className="mt-6  flex justify-center">
      <button
  type="submit"
  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
>
  {editingUser ? "Update User" : "Add User"}
</button>
      </div>
    </form>
  </div>
</div>

        <br></br>
        {/* Users List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">Search Users</h2>
          <div className=" p-6 bg-white shadow-lg rounded-lg">
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* First Name */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={filters.first_name || ""}
                  onChange={handleFilterChange}
                  placeholder="First Name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={filters.last_name || ""}
                  onChange={handleFilterChange}
                  placeholder="Last Name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={filters.email || ""}
                  onChange={handleFilterChange}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={filters.phone || ""}
                  onChange={handleFilterChange}
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center text-black">Gender</label>
                <div className="gap-4">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender} className="flex items-center text-black">
                      <input
                        type="checkbox"
                        value={gender}
                        checked={filters.gender?.includes(gender) || false} // Use optional chaining and default fallback
                        onChange={(e) => handleMultiSelectChange(e, "gender")}
                        className="mr-2"
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location</label>
                <div className="gap-4">
                  {["Coimbatore", "Chennai", "Bangalore", "Hyderabad", "Pune"].map((location) => (
                    <label key={location} className="flex items-center text-black">
                      <input
                        type="checkbox"
                        value={location}
                        checked={filters.location?.includes(location) || false} // Use optional chaining and default fallback
                        onChange={(e) => handleMultiSelectChange(e, "location")}
                        className="mr-2"
                      />
                      {location}
                    </label>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center text-black">Department</label>
                <div className=" gap-4">
                  {["HR", "Finance", "Engineering", "Marketing", "Sales"].map((dept) => (
                    <label key={dept} className="flex items-center text-black">
                      <input
                        type="checkbox"
                        value={dept}
                        checked={filters.department?.includes(dept) || false} // Use optional chaining and default fallback
                        onChange={(e) => handleMultiSelectChange(e, "department")}
                        className="mr-2"
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center text-black">Role</label>
                <div className="gap-4">
                  {["Admin", "Manager", "Developer", "User"].map((role) => (
                    <label key={role} className="flex items-center text-black">
                      <input
                        type="checkbox"
                        value={role}
                        checked={filters.role?.includes(role) || false} // Use optional chaining and default fallback
                        onChange={(e) => handleMultiSelectChange(e, "role")}
                        className="mr-2"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Salary</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="salary_from"
                    value={filters.salary_from || ""}
                    onChange={handleFilterChange}
                    placeholder="From"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                    min="0" // Restrict values to 0 or higher
                  />
                  <input
                    type="number"
                    name="salary_to"
                    value={filters.salary_to || ""}
                    onChange={handleFilterChange}
                    placeholder="To"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                    min="0" // Restrict values to 0 or higher
                  />
                </div>
              </div>

              {/* Join Date */}
             <div>
  <label className="block font-semibold text-gray-700 mb-1">Join Date (From and To)</label>
  <div className="flex gap-2">
    <input
      type="date"
      name="join_date_from"
      value={filters.join_date_from || ""}
      onChange={handleFilterChange}
      className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
      max={new Date().toISOString().split("T")[0]} // Ensure max date is today
    />
    <input
      type="date"
      name="join_date_to"
      value={filters.join_date_to || ""}
      onChange={handleFilterChange}
      className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
      max={new Date().toISOString().split("T")[0]} // Ensure max date is today
    />
  </div>
</div>

              {/* Years of Experience */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Years of Experience</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="years_of_experience_from"
                    value={filters.years_of_experience_from || ""}
                    onChange={handleFilterChange}
                    placeholder="From"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                    min="0" // Restrict values to 0 or higher
                  />
                  <input
                    type="number"
                    name="years_of_experience_to"
                    value={filters.years_of_experience_to || ""}
                    onChange={handleFilterChange}
                    placeholder="To"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
                    min="0" // Restrict values to 0 or higher
                  />
                </div>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <table className="w-full border-collapse">
  <thead>
    <tr className="bg-gray-200">
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("first_name")}>
        First Name {sortField === "first_name" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("last_name")}>
        Last Name {sortField === "last_name" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("gender")}>
        Gender {sortField === "gender" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("location")}>
        Location {sortField === "location" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("email")}>
        Email {sortField === "email" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("phone")}>
        Phone {sortField === "phone" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("department")}>
        Department {sortField === "department" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("role")}>
        Role {sortField === "role" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("salary")}>
        Salary {sortField === "salary" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("join_date")}>
        Join Date {sortField === "join_date" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800 cursor-pointer" onClick={() => sortUsers("years_of_experience")}>
        Years of Experience {sortField === "years_of_experience" && (sortOrder === "asc" ? " ↑" : " ↓")}
      </th>
      <th className="p-3 text-left font-medium text-gray-800">Actions</th>
    </tr>
  </thead>
  <tbody>
    {(users && users.length > 0 && users.filter((user) =>
      user.first_name.toLowerCase().includes(filters.first_name?.toLowerCase() || "")
    ).length > 0) ? (
      users
        .filter((user) =>
          user.first_name.toLowerCase().includes(filters.first_name?.toLowerCase() || "")
        )
        .map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 border-b last:border-0">
            <td className="p-3 text-gray-800">{user.first_name}</td>
            <td className="p-3 text-gray-800">{user.last_name}</td>
            <td className="p-3 text-gray-800">{user.gender}</td>
            <td className="p-3 text-gray-800">{user.location}</td>
            <td className="p-3 text-gray-800">{user.email}</td>
            <td className="p-3 text-gray-800">{user.phone}</td>
            <td className="p-3 text-gray-800">{user.department}</td>
            <td className="p-3 text-gray-800">{user.role}</td>
            <td className="p-3 text-gray-800">{user.salary}</td>
            <td className="p-3 text-gray-800">{user.join_date}</td>
            <td className="p-3 text-gray-800">{user.years_of_experience}</td>
            <td className="p-3 space-x-0">
              <button
                onClick={() => {
                  setFormData({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    gender: user.gender,
                    location: user.location,
                    email: user.email,
                    phone: user.phone,
                    department: user.department,
                    role: user.role,
                    salary: user.salary,
                    join_date: user.join_date,
                    years_of_experience: user.years_of_experience,
                  });
                  setEditingUser(user);

                  if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
    ) : (
      <tr>
        <td colSpan={12} className="text-center p-4 text-gray-500">
          No users found.
        </td>
      </tr>
    )}
  </tbody>
</table>

{/* Pagination Controls */}
<div className="flex justify-between mt-4">
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className="px-4 py-2 bg-blue-300 rounded enabled"
  >
    Previous
  </button>
  <span>
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="px-4 py-2 bg-blue-300 rounded enabled"
  >
    Next
  </button>
</div>
</div>
</div>
    </ProtectedRoute>

  );
}
