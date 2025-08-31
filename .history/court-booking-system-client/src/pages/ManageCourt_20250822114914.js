import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import "../styles/ManageCourt.css";

const ManageCourt = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const courtsPerPage = 6;

  const { userDetails } = useSelector((state) => state.user);
  const ownerEmail = userDetails?.Email;

  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const [deletionReason, setDeletionReason] = useState("");
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getCourtByOwner(ownerEmail);
        if (response.success) {
          setCourts(response.success);
        } else {
          setError("Failed to fetch courts.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching courts.");
      } finally {
        setLoading(false);
      }
    };

    if (ownerEmail) {
      fetchCourts();
    }
  }, [ownerEmail]);

  const handleDelete = async (courtId) => {
    if (!deletionReason) {
      alert("Please select a reason.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await courtService.deleteCourt(courtId, {
        email: ownerEmail,
        reason: deletionReason,
      });

      if (response.success) {
        setCourts(courts.filter((court) => court.Id !== courtId));
        alert("Court deleted successfully.");
      } else {
        alert("Failed to delete court.");
      }
    } catch (err) {
      alert(err.message || "An error occurred while deleting the court.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletionReason("");
      setSelectedCourtId(null);
    }
  };

  const handleEdit = (courtId) => {
    navigate(`/dashboard/edit-court/${courtId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const openModal = (img) => {
    setModalImage(img);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  const indexOfLastCourt = currentPage * courtsPerPage;
  const indexOfFirstCourt = indexOfLastCourt - courtsPerPage;
  const currentCourts = courts.slice(indexOfFirstCourt, indexOfLastCourt);
  const totalPages = Math.ceil(courts.length / courtsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Manage My Courts</h1>
      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && courts.length === 0 && <p>No courts found.</p>}
      {!loading && courts.length > 0 && (
        <>
          <div className="court-grid">
            {currentCourts.map((court) => (
              <div className="card" key={court.Id}>
                <div className="card-images-container">
                  {[court.Image1, court.Image2, court.Image3]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${court.Name}-${idx}`}
                        onClick={() => openModal(img)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                </div>

                <div className="card-content">
                  <h5 className="card-title">{court.Name}</h5>
                  <p className="card-text">
                    <strong>Location:</strong> {court.Location} <br />
                    <strong>Type:</strong> {court.Type} <br />
                    <strong>Price Per Hour:</strong> LKR {court.PricePerHour} <br />
                    <strong>Availability:</strong> {court.Availability} <br />
                    <strong>Available Date:</strong> {formatDate(court.AvailableDate)} <br />
                    <strong>Available Time:</strong>{" "}
                    {court.AvailableStartTime || "Not set"} - {court.AvailableEndTime || "Not set"}
                  </p>

                  <div className="card-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(court.Id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setSelectedCourtId(court.Id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="mt-4 d-flex justify-content-center">
            <ul className="managecourt-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <li
                  key={number}
                  className={`managecourt-page-item ${currentPage === number ? "managecourt-active" : ""}`}
                >
                  <button onClick={() => paginate(number)} className="managecourt-page-link">
                    {number}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full view" />
            <button onClick={closeModal} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="delete-confirm-overlay" onClick={() => !isDeleting && setShowDeleteDialog(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-text">
              Are you sure you want to delete this court?
            </div>

            <select
              className="delete-reason-select"
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              disabled={isDeleting}
            >
              <option value="">-- Select Reason --</option>
              <option value="Court closed permanently">Court closed permanently</option>
              <option value="Wrong details entered">Wrong details entered</option>
              <option value="Duplicate entry">Duplicate entry</option>
              <option value="Other">Other</option>
            </select>

            <div className="delete-confirm-buttons">
              <button
                className="cancel-btn"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedCourtId(null);
                  setDeletionReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                disabled={!deletionReason || isDeleting}
                onClick={() => handleDelete(selectedCourtId)}
              >
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourt;
