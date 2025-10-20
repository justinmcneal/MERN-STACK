const RangeSliderStyles: React.FC = () => (
  <style>{`
    .slider::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #22d3ee;
      cursor: pointer;
      border: 2px solid #1e293b;
    }
    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #22d3ee;
      cursor: pointer;
      border: 2px solid #1e293b;
    }
  `}</style>
);

export default RangeSliderStyles;
