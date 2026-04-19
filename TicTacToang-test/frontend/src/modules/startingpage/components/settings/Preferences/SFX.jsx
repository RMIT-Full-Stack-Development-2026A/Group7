import React from 'react';
import Slider from '../../ui/Slider';

export default function SFX({ value, onChange, darkMode }) {
  return (
    <Slider
      label="Sound Effects"
      value={value}
      onChange={onChange}
      darkMode={darkMode}
    />
  );
}
