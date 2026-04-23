import React from 'react';
import Slider from '../../ui/Slider';

export default function MusicVolume({ value, onChange, darkMode }) {
  return (
    <Slider
      label="Music Volume"
      value={value}
      onChange={onChange}
      darkMode={darkMode}
    />
  );
}
