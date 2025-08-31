import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CreateCourt.css";

const CreateCourt = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [moreDetails, setMoreDetails] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "test@example.com";

  const handleImageUpload = async () => {
    if (!image) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "easycourt_upload");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dhrejmsev/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        "Image upload failed: " +
          (errorData.error?.message || response.statusText)
      );
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!image) {
        alert("Please select an image.");
        setLoading(false);
        return;
      }

      const imageUrl = await handleImageUpload();

      const courtData = {
        name,
        location,
        sport,
        price,
        email: userEmail,
        moreDetails,
        availability,
        imageUrl,
      };

      const result = await courtService.addCourt(courtData);

      if (result?.success) {
        alert("Court added successfully!");
        navigate(`/dashboard/add-availability/${result.success.courtId}`);
      } else {
        alert("Failed to add court: " + (result?.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use inline style for background image from public folder
  const backgroundStyle = {
    background: `linear-gradient(rgba(255,255,255,0.35),rgba(255,255,255,0.35)), url("/addcourt.png") center center / cover no-repeat`,
    backgroundBlendMode: "lighten",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  return (
    <div className="create-court" style={backgroundStyle}>
      <form onSubmit={handleSubmit}>
        <h2>Create Court</h2>
        <input
          placeholder="Court Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          placeholder="Sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
        <textarea
          placeholder="More Details"
          value={moreDetails}
          onChange={(e) => setMoreDetails(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Add Court"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourt;