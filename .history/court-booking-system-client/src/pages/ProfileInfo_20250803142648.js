import { useSelector } from "react-redux";

const ProfileInfo = () => {
  const userDetails = useSelector((state) => state.user.userDetails);


  if (!userDetails) {
    return <div className="alert alert-warning">No user details found.</div>;
  }

  return (
    <div className="container mt-10" style={{
      flex: 1,
          backgroundColor: "rgba(255, 255, 252, 0.94)", // your preferred color
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px" 
         }}>
          <h1 className="mb-4" style={{ color: "#0e6304" }}>My Profile</h1> 
      <div className="card p-4 shadow-l">
        <div className="card-body">
          <h2 className="card-title mb-3" style={{ color: "#0e6304", fontSize:"25px", justifySelf:"center" }} >Profile Information</h2>
          <br></br>
          <div className="profile-mb-3">
            <p><strong>Name:</strong> {userDetails.Name}</p>
            <p><strong>Email:</strong> {userDetails.Email}</p>
            <p><strong>Role:</strong> {userDetails.UserRole}</p>
            <p><strong>XRPL Address:</strong> {userDetails.XrplAddress}</p>
            
          </div>

          
          <br></br>

          <h3 className="profile-mb-3" style={{ color: "#0e6304", fontSize:"25px",justifySelf:"center" }} >Dev Tools</h3>
          <br></br>
          

          <div className="profile-mb-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              className="btn btn-secondary" style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }}
            >
              Fund Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
