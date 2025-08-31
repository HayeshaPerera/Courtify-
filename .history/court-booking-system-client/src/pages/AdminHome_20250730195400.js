import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // shadcn
import { Card, CardContent } from "@/components/ui/card"; // shadcn
import { Input } from "@/components/ui/input"; // optional for filters
import { Trash2, CheckCircle2, XCircle } from "lucide-react";

const AdminHomePage = () => {
  const [pendingCourts, setPendingCourts] = useState([]);
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    // fetch data (mocked)
    setPendingCourts([
      { id: 1, name: "Urban Arena", owner: "john@example.com" },
      { id: 2, name: "Beach Sports Club", owner: "jane@example.com" },
    ]);
    setUsers([
      { id: 101, name: "John Doe", email: "john@example.com" },
      { id: 102, name: "Jane Smith", email: "jane@example.com" },
    ]);
    setCourts([
      { id: 201, name: "Lakeside Court", location: "Colombo" },
      { id: 202, name: "City Turf", location: "Kandy" },
    ]);
  }, []);

  const acceptCourt = (id) => {
    setPendingCourts(pendingCourts.filter(court => court.id !== id));
    // send approval to backend
  };

  const rejectCourt = (id) => {
    setPendingCourts(pendingCourts.filter(court => court.id !== id));
    // send rejection to backend
  };

  const removeUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
    // backend call
  };

  const removeCourt = (id) => {
    setCourts(courts.filter(court => court.id !== id));
    // backend call
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Section: Pending Court Approvals */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Pending Court Requests</h2>
          {pendingCourts.length === 0 ? (
            <p className="text-gray-500">No pending courts.</p>
          ) : (
            pendingCourts.map((court) => (
              <div key={court.id} className="flex justify-between items-center border p-3 rounded-md bg-slate-100">
                <div>
                  <p className="font-medium">{court.name}</p>
                  <p className="text-sm text-gray-600">Owner: {court.owner}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => acceptCourt(court.id)} className="bg-green-600 text-white">
                    <CheckCircle2 className="mr-2" size={16} /> Accept
                  </Button>
                  <Button onClick={() => rejectCourt(court.id)} variant="destructive">
                    <XCircle className="mr-2" size={16} /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section: Remove Users */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Registered Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex justify-between items-center border p-3 rounded-md">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button onClick={() => removeUser(user.id)} variant="destructive">
                  <Trash2 className="mr-2" size={16} /> Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section: Remove Courts */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Existing Courts</h2>
          {courts.length === 0 ? (
            <p className="text-gray-500">No courts available.</p>
          ) : (
            courts.map((court) => (
              <div key={court.id} className="flex justify-between items-center border p-3 rounded-md">
                <div>
                  <p className="font-medium">{court.name}</p>
                  <p className="text-sm text-gray-600">Location: {court.location}</p>
                </div>
                <Button onClick={() => removeCourt(court.id)} variant="destructive">
                  <Trash2 className="mr-2" size={16} /> Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomePage;
