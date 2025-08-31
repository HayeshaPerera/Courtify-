import React, { useState, useEffect } from "react";
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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "hayeshahp6@gmail.com";

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("createCourtForm")) || {};
    if (savedFormData.name) setName(savedFormData.name);
    if (savedFormData.location) setLocation(savedFormData.location);
    if (savedFormData.sport) setSport(savedFormData.sport);
    if (savedFormData.price) setPrice(savedFormData.price);
    if (savedFormData.availability) setAvailability(savedFormData.availability);
    if (savedFormData.moreDetails) setMoreDetails(savedFormData.moreDetails);
  }, []);

  const updateLocalStorage = (field, value) => {
    const existing = JSON.parse(localStorage.getItem("createCourtForm")) || {};
    localStorage.setItem("createCourtForm", JSON.stringify({ ...existing, [field]: value }));
  };

  const handleImageUpload = async () => {
    if (!images.length) throw new Error("No images selected");

    const uploadedUrls = [];

    for (let i = 0; i < images.length && i < 3; i++) {
      const formData = new FormData();
      formData.append("file", images[i]);
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
      uploadedUrls.push(data.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!images.length) {
        alert("Please select up to 3 images.");
        setLoading(false);
        return;
      }

      const imageUrls = await handleImageUpload();

      const courtData = {
        name,
        location,
        sport,
        price,
        email: userEmail,
        moreDetails,
        availability,
        imageUrls,
      };

      const result = await courtService.addCourt(courtData);

      if (result?.success) {
        alert("Court added successfully!");
        localStorage.removeItem("createCourtForm");
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
      {loading && (
        <div className="full-screen-loader">
          <div className="spinner" />
          <p>Uploading images and saving court... Please wait.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h2>Create Court</h2>

        <input
          placeholder="Court Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            updateLocalStorage("name", e.target.value);
          }}
          required
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            updateLocalStorage("location", e.target.value);
          }}
          required
        />

        <input
          placeholder="Sport"
          value={sport}
          onChange={(e) => {
            setSport(e.target.value);
            updateLocalStorage("sport", e.target.value);
          }}
          required
        />

        <input
          placeholder="Price per hour (e.g. 100)"
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            updateLocalStorage("price", e.target.value);
          }}
          required
          min="0"
          step="0.01"
        />

        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            updateLocalStorage("availability", e.target.value);
          }}
          required
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <textarea
          placeholder="More Details"
          value={moreDetails}
          onChange={(e) => {
            setMoreDetails(e.target.value);
            updateLocalStorage("moreDetails", e.target.value);
          }}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
          required
        />

        {images.length > 0 && (
          <div className="image-preview">
            {images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                style={{ width: "100px", marginRight: "10px" }}
              />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Add Court"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourt;