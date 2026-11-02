import { useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Membership from "./components/Membership";
import Amenities from "./components/Amenities";
import Benefits from "./components/Benefits";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Navbar
        onBookNow={() => setIsBookingOpen(true)}
      />

      <main>
        <Hero />
        <About />
        <Membership />
        <Amenities />
        <Benefits />
        <Gallery />
        <Contact />
      </main>

      <Footer />

      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}