import React from 'react';
import { createPortal } from 'react-dom';

const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="admindek-light">{children}</div>,
    document.body
  );
};

export default ModalPortal;
