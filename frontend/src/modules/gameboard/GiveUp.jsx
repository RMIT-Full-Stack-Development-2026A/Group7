import React from 'react';

export default function GiveUpModal({ onConfirm, onCancel }) {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Give Up</h5>
          </div>
          <div className="modal-body text-center py-4">
            <p className="mb-4">Are you sure you want to give up?</p>
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-danger btn-lg px-4 give-up-button"
                onClick={onConfirm}
              >
                <i className="bi bi-flag-fill me-2"></i>
                Give Up
              </button>
              <button 
                className="btn btn-primary btn-lg px-4 cancel-button"
                onClick={onCancel}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
