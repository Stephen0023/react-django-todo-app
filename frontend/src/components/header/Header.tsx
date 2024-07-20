import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Sidebar from "../side-bar/SideBar";
import "./Header.css";

const quotes = [
  "Believe you can and you're halfway there.",
  "You are stronger than you think.",
  "Every day is a second chance.",
  "Stay positive, work hard, make it happen.",
  "Your only limit is your mind.",
];

export default function Header() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <>
      <header className="header-container">
        <div className="left-header">
          <h2>{getGreeting()}</h2>
          <p className="quote-style">{quotes[quoteIndex]}</p>
        </div>
        <div
          className="right-header"
          onClick={() => setIsSidebarVisible((prev) => !prev)}
        >
          <FaUserCircle size={50} />
        </div>
        {isSidebarVisible}
      </header>

      {isSidebarVisible && <Sidebar />}
    </>
  );
}
