import React from 'react';
import Slider from '../../ui/Slider';

export default function MasterVolume({ value, onChange, darkMode }) {
  return (
    <Slider
      label="Master Volume"
      value={value}
      onChange={onChange}
      darkMode={darkMode}
    />
  );
}
