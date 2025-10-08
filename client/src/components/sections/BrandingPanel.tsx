import React from 'react';
import BackButton from '../ui/BackButton/BackButton';
import LogoSection from '../ui/LogoSection/LogoSection';
import FeatureList from '../ui/FeatureList/FeatureList';

interface BrandingPanelProps {
  className?: string;
  features?: Array<{ text: string }>;
  title?: string;
  subtitle?: string;
  backButtonText?: string;
  backButtonTo?: string;
}

const BrandingPanel: React.FC<BrandingPanelProps> = ({
  className = "",
  features,
  title,
  subtitle,
  backButtonText = "Back to Home",
  backButtonTo = "/"
}) => {
  return (
    <div className={`flex flex-col justify-center p-8 lg:p-16 mb-80 ${className}`}>
      {/* Back Button */}
      <BackButton to={backButtonTo}>
        {backButtonText}
      </BackButton>

      {/* Logo and Title */}
      <LogoSection title={title} subtitle={subtitle} />

      {/* Feature List */}
      <FeatureList features={features} />
    </div>
  );
};

export default BrandingPanel;
