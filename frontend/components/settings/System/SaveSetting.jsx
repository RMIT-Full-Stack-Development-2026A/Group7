import React from 'react';
import Button from '../../ui/Button';

export default function SaveSetting({ onSave, hasUnsavedChanges, darkMode }) {
  if (!hasUnsavedChanges) return null;

  return (
    <div className={`save-panel fixed-bottom shadow-lg ${darkMode ? 'save-panel-dark' : 'save-panel-light'}`}>
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between py-3">
          <p className={`mb-0 ${darkMode ? 'text-light' : 'text-dark'}`}>
            Your changes are not saved, do you want to save them?
          </p>
          <div className="d-flex gap-2">
            <Button variant="cancel" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button variant="save" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
