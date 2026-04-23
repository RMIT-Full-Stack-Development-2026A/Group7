import { DifficultyMenu } from "../DifficultyMenu/DifficultyMenu.jsx";
import { useAISlots } from '../../hooks/useAISlots.js';

export function AISlots({ slotId, onSelectAI }) {
    const { showMenu, menuClassName, toggleMenu, closeMenu, handleSelect } = useAISlots(slotId, onSelectAI);

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={toggleMenu}
                className="ai-slot-btn"
                aria-label={`Add AI to slot ${slotId + 1}`}
            >
                <i className="bi bi-plus ai-slot-icon"> </i>
            </button>

            {showMenu && (
                <div
                    onClick={closeMenu}
                    style={{ position: 'fixed', inset: 0, zIndex: 39 }}
                />
            )}
            {showMenu && (
                <div className={menuClassName}>
                    <DifficultyMenu onSelect={handleSelect} />
                </div>
            )}
        </div>
    );
}
