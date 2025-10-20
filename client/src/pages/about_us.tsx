import { useNavigate } from "react-router-dom";

import AboutBackButton from "../components/about/AboutBackButton";
import AboutFooter from "../components/about/AboutFooter";
import AboutHeader from "../components/about/AboutHeader";
import AboutHero from "../components/about/AboutHero";
import AboutLayout from "../components/about/AboutLayout";
import AboutMission from "../components/about/AboutMission";
import AboutTeam from "../components/about/AboutTeam";
import AboutTechnology from "../components/about/AboutTechnology";

const AboutUsPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/landing_page");
  };

  return (
    <AboutLayout>
      <AboutHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AboutBackButton onBack={handleBackHome} />
        <AboutHero />
        <AboutMission />
        <AboutTeam />
        <AboutTechnology />
      </main>
      <AboutFooter />
    </AboutLayout>
  );
};

export default AboutUsPage;