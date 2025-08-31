import { useSelector } from "react-redux";

const ProfileInfo = () => {
  const userDetails = useSelector((state) => state.user.userDetails);

  if (!userDetails) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          No user details found.
        </div>
      </div>
    );
  }

  const containerStyle = {
    flex: 1,
    backgroundColor: "rgba(255, 255, 252, 0.94)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    minHeight: "100vh",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
  };

  const headingStyle = {
    color: "#0e6304",
    fontSize: "28px",
    fontWeight: "600",
    textAlign: "center",
  };

  const subHeadingStyle = {
    color: "#0e6304",
    fontSize: "22px",
    fontWeight: "500",
    marginTop: "30px",
    textAlign: "center",
  };

  return (
    <div className="container" style={containerStyle}>
      <h1 style={headingStyle}>My Profile</h1>

      <div className="card p-4 mt-4" style={cardStyle}>
        <div className="card-body">
          <h2 style={subHeadingStyle}>Profile Information</h2>
          <hr />

          <div className="mb-3">
            <p><strong>Name:</strong> {userDetails.Name || "-"}</p>
            <p><strong>Email:</strong> {userDetails.Email || "-"}</p>
            <p><strong>Role:</strong> {userDetails.UserRole || "-"}</p>
            <p><strong>XRPL Address:</strong> {userDetails.XrplAddress || "-"}</p>
          </div>

          <h3 style={subHeadingStyle}>Developer Tools</h3>
          <hr />

          <div className="d-grid mt-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              className="btn btn-outline-success"
            >
              Fund XRPL Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
