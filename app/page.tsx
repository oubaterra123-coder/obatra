import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";

export default function Home() {
  return (
    <main>
      <RedirectIfAuthenticated />
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Pricing />
      <Footer />
    </main>
  );
}

