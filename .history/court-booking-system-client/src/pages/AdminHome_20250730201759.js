import React, { useEffect, useState } from "react";
import adminService from "../services/domain-services/AdminService";
import "../styles/AdminHome.css";

const AdminHome = () => {
  const [courts, setCourts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  // Load courts and users on mount
  useEffect(() => {
    fetchCourts();
    fetchUsers();
  }, []);

  const fetchCourts = async () => {
    setLoadingCourts(true);
    setError(null);
    try {
      const res = await adminService.getAllCourts();
      if (res?.success) {
        setCourts(res.success);
      } else {
        setError(res.error || "Failed to load courts");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoadingCourts(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await adminService.getAllUsers();
      if (res?.success) {
        setUsers(res.success);
      } else {
        setError(res.error || "Failed to load users");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoadingUsers(false);
  };

  const handleRemoveCourt = async (courtId) => {
    if (!window.confirm("Are you sure you want to remove this court?")) return;

    try {
      const res = await adminService.removeCourt(courtId);
      if (res.success) {
        alert("Court removed successfully");
        fetchCourts();
      } else {
        alert("Failed to remove court: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error removing court: " + err.message);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await adminService.removeUser(userId);
      if (res.success) {
        alert("User removed successfully");
        fetchUsers();
      } else {
        alert("Failed to remove user: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error removing user: " + err.message);
    }
  };

  return (
    <div className="admin-home-container">
      <h1>Admin Dashboard</h1>

      {error && <p className="error-message">{error}</p>}

      <section>
        <h2>Courts</h2>
        {loadingCourts ? (
          <p>Loading courts...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Sport</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courts?.length > 0 ? (
                courts.map((court) => (
                  <tr key={court.Id}>
                    <td>{court.Id}</td>
                    <td>{court.Name}</td>
                    <td>{court.Location}</td>
                    <td>{court.Type}</td>
                    <td>{court.PricePerHour}</td>
                    <td>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveCourt(court.Id)}
                      >
                        Remove Court
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No courts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.length > 0 ? (
                users.map((user) => (
                  <tr key={user.Id}>
                    <td>{user.Id}</td>
                    <td>{user.Name}</td>
                    <td>{user.Email}</td>
                    <td>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveUser(user.Id)}
                      >
                        Remove User
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminHome;
