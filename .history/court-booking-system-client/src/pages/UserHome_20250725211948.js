import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/HomePage.css";

const CourtHome = () => {
  const navigate = useNavigate();

  return (
    <div className="home">


      <header
        className="header"
        style={{ backgroundImage: "url('/image 1.jpg')" }} // Use inline style for public image
      >
        <div className="header-content-wrapper">
          <div className="header-content">
            <div className="header-text">
              <h1 className="animated-text">
                <span>Find</span> | <span>Book</span> <span>and</span>{" "}
                <span>Play</span>
                <span> Anytime,</span> <span>Anywhere</span>
              </h1>
              <button className="get-started-btn">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      <section className="welcome-section flex flex-col md:flex-row items-center justify-center gap-8 p-8 bg-gray-50">
        <div className="relative w-full md:w-1/2 flex justify-center">
          <div className="relative flex">
            <img src="/image 3.jpg" alt="Background" className="image3" />
            <div className="image2-wrapper absolute top-0 left-0">
              <img src="/image2.jpg" alt="Foreground" className="image2" />
            </div>
          </div>
        </div>

        <div className="welcome-text-box">
          <p className="text-black">
            <span className="text-green-600">WELCOME TO COURTIFY</span>
          </p>
          <p className="text-black1 font-semibold italic text-xl mt-2">
            COURTS AT YOUR <span className="text-green-600">FINGERTIPS</span>
          </p>
          <p className="text-black2 font-semibold italic text-xl mt-4">
            At <span className="text-green-600">COURTIFY</span>, we’re rewriting the rules of sports court bookings.
            Say goodbye to the hassle – with just a few clicks, you can find, book, and play. From real-time availability
            to secure NFT confirmations, we’re here to turn your game-time dreams into reality. Let’s make every play
            unforgettable!
          </p>
          <button className="about-us-btn mt-6" onClick={() => navigate("/about-us")}>
            ABOUT US
          </button>
        </div>
      </section>

      <Footer /> 
    </div>
  );
};

export default CourtHome;