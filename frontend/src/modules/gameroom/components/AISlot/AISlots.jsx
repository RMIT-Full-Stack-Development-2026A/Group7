import { DifficultyMenu } from "../DifficultyMenu/DifficultyMenu.jsx";
import { useAISlots } from '../../hooks/useAISlots.js';

export function AISlots({ slotId, onSelectAI, onSelectLocalPlayer, disabled = false }) {
    const { showMenu, menuClassName, toggleMenu, closeMenu, handleSelect } = useAISlots(slotId, onSelectAI);

    const handleSelectLocal = (name) => {
        if (typeof onSelectLocalPlayer === 'function') {
            onSelectLocalPlayer(name);
        }
        closeMenu();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={toggleMenu}
                className={`ai-slot-btn ${disabled ? 'ai-slot-btn-disabled' : ''}`}
                aria-label={`Add player or AI to slot ${slotId + 1}`}
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
                    <DifficultyMenu onSelect={handleSelect} onSelectLocalPlayer={handleSelectLocal} />
                </div>
            )}
        </div>
    );
}
