import React from "react";
import "./CreateFiche.css";

const CreateFiche = () => {
  const imgUrl =
    "https://i.pinimg.com/736x/e0/21/49/e021490dbdba45a9787df70673e1c4f3.jpg";

  return (
    <div className="cf-container">
      {/* Fond sable */}
      <div className="cf-right" aria-hidden="true" />

      {/* Image gauche oblique */}
      <div className="cf-left" aria-hidden="true">
        <img src={imgUrl} alt="" className="cf-img" />
      </div>

      {/* --------- CARD --------- */}
      <div className="cf-card">
        {/* Colonne contenu */}
        <div className="cf-content">
          <nav className="cf-tabs" aria-label="Sections de la fiche">
            <button className="cf-tab cf-tab--active">General</button>
            <button className="cf-tab">Caractere</button>
            <button className="cf-tab">Pouvoir</button>
            <button className="cf-tab">Gallerie</button>
            <button className="cf-tab">Caractere</button>
            <button className="cf-tab">Histoire</button>
            <button className="cf-tab">Autre</button>
            <button className="cf-tab">Autre</button>
            <button
              className="cf-tab cf-tab--ghost"
              title="Ajouter un onglet"
            >
              +
            </button>
          </nav>

          <header className="cf-header">
            <h1 className="cf-h1">Henel Aemue</h1>
            <p className="cf-meta">
              <span className="cf-rank">Ange</span>
              <span className="cf-dot">•</span>
              <span className="cf-date">20/03/1999</span>
            </p>
          </header>

          <section className="cf-text">
            <h2 className="cf-h2">A propos</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae
              suscipit tellus mauris a diam maecenas sed enim ut sem viverra
              aliquet. Vitae congue mauris rhoncus aenean vel elit scelerisque
              mauris.

              At imperdiet dui accumsan sit amet nulla. Est placerat in egestas
              erat imperdiet sed euismod nisi. Nisl nunc mi ipsum faucibus vitae
              aliquet nec ullamcorper sit. Amet luctus venenatis lectus magna
              fringilla urna.

              Id nibh tortor id aliquet lectus proin nibh nisl condimentum id.
              Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              Ultrices in iaculis nunc sed augue lacus viverra vitae congue.
            </p>
                        <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae
              suscipit tellus mauris a diam maecenas sed enim ut sem viverra
              aliquet. Vitae congue mauris rhoncus aenean vel elit scelerisque
              mauris.

              At imperdiet dui accumsan sit amet nulla. Est placerat in egestas
              erat imperdiet sed euismod nisi. Nisl nunc mi ipsum faucibus vitae
              aliquet nec ullamcorper sit. Amet luctus venenatis lectus magna
              fringilla urna.

              Id nibh tortor id aliquet lectus proin nibh nisl condimentum id.
              Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              Ultrices in iaculis nunc sed augue lacus viverra vitae congue.
            </p>
                        <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae
              suscipit tellus mauris a diam maecenas sed enim ut sem viverra
              aliquet. Vitae congue mauris rhoncus aenean vel elit scelerisque
              mauris.

              At imperdiet dui accumsan sit amet nulla. Est placerat in egestas
              erat imperdiet sed euismod nisi. Nisl nunc mi ipsum faucibus vitae
              aliquet nec ullamcorper sit. Amet luctus venenatis lectus magna
              fringilla urna.

              Id nibh tortor id aliquet lectus proin nibh nisl condimentum id.
              Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              Ultrices in iaculis nunc sed augue lacus viverra vitae congue.
            </p>
                        <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae
              suscipit tellus mauris a diam maecenas sed enim ut sem viverra
              aliquet. Vitae congue mauris rhoncus aenean vel elit scelerisque
              mauris.

              At imperdiet dui accumsan sit amet nulla. Est placerat in egestas
              erat imperdiet sed euismod nisi. Nisl nunc mi ipsum faucibus vitae
              aliquet nec ullamcorper sit. Amet luctus venenatis lectus magna
              fringilla urna.

              Id nibh tortor id aliquet lectus proin nibh nisl condimentum id.
              Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              Ultrices in iaculis nunc sed augue lacus viverra vitae congue.
            </p>
                        <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae
              suscipit tellus mauris a diam maecenas sed enim ut sem viverra
              aliquet. Vitae congue mauris rhoncus aenean vel elit scelerisque
              mauris.

              At imperdiet dui accumsan sit amet nulla. Est placerat in egestas
              erat imperdiet sed euismod nisi. Nisl nunc mi ipsum faucibus vitae
              aliquet nec ullamcorper sit. Amet luctus venenatis lectus magna
              fringilla urna.

              Id nibh tortor id aliquet lectus proin nibh nisl condimentum id.
              Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.
              Ultrices in iaculis nunc sed augue lacus viverra vitae congue.
            </p>
          </section>
        </div>

        {/* Colonne portrait */}
        <aside className="cf-portrait-float">
          <img src={imgUrl} alt="Portrait de personnage" />
          <button
            className="cf-portrait-action"
            aria-label="Modifier le portrait"
          >
            ●
          </button>
        </aside>
      </div>
      {/* --------- /CARD --------- */}

      {/* Tags en bas de page à gauche */}
      <div className="cf-global-badges">
        <span className="cf-badge">DISCORD</span>
        <span className="cf-badge">SERVEUR ZHENEOS</span>
      </div>
    </div>
  );
};

export default CreateFiche;
