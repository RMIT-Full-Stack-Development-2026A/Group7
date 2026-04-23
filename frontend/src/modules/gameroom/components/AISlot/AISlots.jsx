import { DifficultyMenu } from "../DifficultyMenu/DifficultyMenu.jsx";
import { useAISlots } from '../../hooks/useAISlots.js';

export function AISlots({ slotId, onSelectAI, disabled = false }) {
    const { showMenu, menuClassName, toggleMenu, closeMenu, handleSelect } = useAISlots(slotId, onSelectAI);

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={toggleMenu}
                className={`ai-slot-btn ${disabled ? 'ai-slot-btn-disabled' : ''}`}
                aria-label={`Add AI to slot ${slotId + 1}`}
                disabled={disabled}
            >
                <i className="bi bi-plus ai-slot-icon"> </i>
            </button>

            {showMenu && !disabled && (
                <div
                    onClick={closeMenu}
                    style={{ position: 'fixed', inset: 0, zIndex: 39 }}
                />
            )}
            {showMenu && !disabled && (
                <div className={menuClassName}>
                    <DifficultyMenu onSelect={handleSelect} />
                </div>
            )}
        </div>
    );
}
