import React from "react";

const Sidebar = () => {
  return (
    <aside className="tm-sidebar">
      <h2>Menu</h2>
      <button className="tm-nav-btn">🏠 Accueil</button>
      <button className="tm-nav-btn">📝 Tâches</button>
      <button className="tm-nav-btn">➕ Ajouter une page</button>
    </aside>
  );
};

export default Sidebar;
