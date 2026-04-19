import React from 'react';
import Selector from '../../ui/Selector';

export default function InMatch({ value, onChange, darkMode }) {
  const musicOptions = [
    { value: 'none', label: 'None' },
    { value: 'epic-battle', label: 'Epic Battle' },
    { value: 'focus-mode', label: 'Focus Mode' },
    { value: 'classical', label: 'Classical' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'ambient', label: 'Ambient' }
  ];

  return (
    <Selector
      label="In Match"
      value={value}
      onChange={onChange}
      options={musicOptions}
      darkMode={darkMode}
    />
  );
}
