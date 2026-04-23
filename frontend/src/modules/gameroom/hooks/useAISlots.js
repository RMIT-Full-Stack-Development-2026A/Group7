import { useState } from 'react';

export function useAISlots(slotId, onSelectAI) {
  const [showMenu, setShowMenu] = useState(false);

  const opensToLeft = slotId === 2 || slotId === 3;
  const opensUpward = slotId === 1 || slotId === 3;
  const menuClassName = [
    'ai-slot-menu',
    opensToLeft ? 'menu-left' : 'menu-right',
    opensUpward ? 'menu-up' : 'menu-down',
  ].join(' ');

  const toggleMenu = () => {
    setShowMenu((currentValue) => !currentValue);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleSelect = (difficulty) => {
    onSelectAI(difficulty);
    closeMenu();
  };

  return {
    showMenu,
    menuClassName,
    toggleMenu,
    closeMenu,
    handleSelect,
  };
}

export default useAISlots;
