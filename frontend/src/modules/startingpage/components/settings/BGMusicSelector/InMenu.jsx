import React from 'react';
import Selector from '../../ui/Selector';

export default function InMenu({ value, onChange, darkMode }) {
  const musicOptions = [
    { value: 'none', label: 'None' },
    { value: 'chill-vibes', label: 'Chill Vibes' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'jazzy', label: 'Jazzy' },
    { value: 'upbeat', label: 'Upbeat' },
    { value: 'piano', label: 'Piano' }
  ];

  return (
    <Selector
      label="In Menu"
      value={value}
      onChange={onChange}
      options={musicOptions}
      darkMode={darkMode}
    />
  );
}
