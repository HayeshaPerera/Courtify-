import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";
import userService from "../services/domain-services/UserService";
import "../styles/AdminHome.css"; // Optional: if you have styles

const AdminHome = () => {
  const [courts, setCourts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await courtService.getAllCourts();
        setCourts(Array.isArray(res) ? res : []); // Ensure it's an array
      } catch (error) {
        console.error("Failed to fetch courts:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        setUsers(Array.isArray(res) ? res : []); // Ensure it's an array
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchCourts();
    fetchUsers();
  }, []);

  const handleAcceptCourt = async (courtId) => {
    try {
      await courtService.acceptCourt(courtId);
      setCourts((prev) =>
        prev.map((c) => (c.id === courtId ? { ...c, accepted: true } : c))
      );
    } catch (error) {
      console.error("Failed to accept court:", error);
    }
  };

  const handleRemoveCourt = async (courtId) => {
    try {
      await courtService.deleteCourt(courtId);
      setCourts((prev) => prev.filter((c) => c.id !== courtId));
    } catch (error) {
      console.error("Failed to remove court:", error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  return (
    <div className="admin-home-container">
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Pending Courts</h2>
        {courts.length === 0 ? (
          <p>No courts available.</p>
        ) : (
          <ul>
            {courts
              .filter((court) => !court.accepted)
              .map((court) => (
                <li key={court.id}>
                  {court.name} - {court.location}
                  <button onClick={() => handleAcceptCourt(court.id)}>
                    Accept
                  </button>
                  <button onClick={() => handleRemoveCourt(court.id)}>
                    Remove
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section>
        <h2>All Users</h2>
        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
                <button onClick={() => handleRemoveUser(user.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminHome;
