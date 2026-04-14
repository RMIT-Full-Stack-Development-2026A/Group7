import { useState } from "react";
import { DifficultyMenu } from "./DifficultyMenu";

export function AISlots({ slotId, onSelectAI }) {
    const [showMenu, setShowMenu] = useState(false);
    const opensToLeft = slotId === 2 || slotId === 3;
    const opensUpward = slotId === 1 || slotId === 3;
    const menuClassName = [
        'ai-slot-menu',
        opensToLeft ? 'menu-left' : 'menu-right',
        opensUpward ? 'menu-up' : 'menu-down',
    ].join(' ');

    const handleSelect = (difficulty) => {
        onSelectAI(difficulty);
        setShowMenu(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="ai-slot-btn"
                aria-label={`Add AI to slot ${slotId + 1}`}
            >
                <i className="bi bi-plus ai-slot-icon"> </i>
            </button>

            {showMenu && (
                <div
                    onClick={() => setShowMenu(false)}
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
