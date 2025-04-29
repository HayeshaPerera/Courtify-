import userService from "../services/domain-services/UserService";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import { setUserDetails } from "../store/slices/userSlice";

const SignUp = () => {
    const dispatch = useDispatch();
    const { userInfo, provider } = useSelector((state) => state.auth);
    const { xrplAccount } = useSelector((state) => state.wallet);

    const fetchUserAccount = async () => {
        const rpc = new XrplService(provider);
        const userAccount = await rpc.getAccounts();
        return userAccount?.account;
    };

    let xrplAccountAddress;

    const getXrplAccountAddress = async () => {
        if (xrplAccount && xrplAccount.Account) {
            return xrplAccount.Account;
        } else {
            return await fetchUserAccount();
        }
    };

    const [formData, setFormData] = useState({
        xrplAddress: "",
        email: userInfo?.email || "",
        name: userInfo?.name || "",
        userRole: "PublicUser", // default to PublicUser
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchAddress = async () => {
            const address = await getXrplAccountAddress();
            setFormData((prevData) => ({
                ...prevData,
                xrplAddress: address || prevData.xrplAddress,
            }));
        };
        fetchAddress();
    }, [xrplAccount, userInfo]);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            email: userInfo?.email || prevData.email,
            name: userInfo?.name || prevData.name,
        }));
    }, [userInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await userService.registerUser(formData);

            if (response.success) {
                setSuccessMessage(response.success.message);
                dispatch(setUserDetails(formData));
                console.log("User registered:", formData);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("An error occurred during registration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Register for Court Booking</h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* XRPL Address */}
                <div className="mb-3">
                    <label htmlFor="xrplAddress" className="form-label">XRPL Address</label>
                    <input
                        type="text"
                        name="xrplAddress"
                        id="xrplAddress"
                        value={formData.xrplAddress}
                        className="form-control"
                        readOnly
                        disabled
                    />
                </div>

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        className="form-control"
                        readOnly
                        disabled
                    />
                </div>

                {/* Role */}
                <div className="mb-3">
                    <label htmlFor="userRole" className="form-label">Account Type</label>
                    <select
                        name="userRole"
                        id="userRole"
                        value={formData.userRole}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        <option value="PublicUser">Public User</option>
                        <option value="CourtOwner">Court Owner</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                </button>

                {/* Messages */}
                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
            </form>
        </div>
    );
};

export default SignUp;