import React from 'react';
import Button from '../../ui/Button';

export default function LogOut({ onLogOut }) {
  return (
    <Button variant="orange" onClick={onLogOut}>
      Log Out
    </Button>
  );
}
