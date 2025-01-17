import React from 'react';
import Header from './Header';
import './Layout.css'; // Assure-toi d'importer les styles

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <main className="content">
      <Header />
        {children}
        </main>
    </div>
  );
};

export default Layout;
