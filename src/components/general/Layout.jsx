import React from 'react';
import Header from './Header';   // chemin relatif → évite la boucle
import './Layout.css';

const Layout = ({ children }) => (
  <div className="layout">
    <main className="content">
      <Header />
      {children}
    </main>
  </div>
);

export default Layout;
