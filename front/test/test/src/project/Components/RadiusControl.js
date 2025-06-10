import React from "react";

const RadiusControl = ({ radius, setRadius }) => {
  return (
    <div>
      <label>반경 설정 (m): </label>
      <input 
        type="range" 
        min="500" 
        max="5000" 
        step="100" 
        value={radius} 
        onChange={(e) => setRadius(Number(e.target.value))} 
      />
      <span>{radius}m</span>
    </div>
  );
};

export default RadiusControl;
