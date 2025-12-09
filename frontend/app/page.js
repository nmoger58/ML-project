"use client";
import LeetCodeDashboard from "./components/LeetcodeDashboard";
import Navbar from "./components/Navbar";
import LeetCodeAnalysisPanel from "./components/LeetCodeAnalysisPanel";
import { useEffect } from "react";
import CombinedLeetCodeDashboard from "./components/LeetCode";

export default function Home() {
  useEffect(() => {
    // This effect runs once when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3002/analyze/ani_pai');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount





  return (
    <div >
      <Navbar></Navbar>
      <CombinedLeetCodeDashboard />
    </div>
  );
}
