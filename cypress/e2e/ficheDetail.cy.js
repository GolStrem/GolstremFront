describe('Fiche detail page (CreateFiche)', () => {

  beforeEach(() => {
    // Créer une session utilisateur et aller à la liste des fiches
    cy.session('userSession', () => {
      cy.visit('/login');
      cy.get('button.ln-connexion').click();
      cy.get('input[name="email"]').type(Cypress.env('CYPRESS_EMAIL'));
      cy.get('input[name="password"]').type(Cypress.env('CYPRESS_PASSWORD'));
      cy.get('form').submit();
      cy.url().should('include', '/dashboard');
    });

    cy.visit('/fiches');
    cy.url().should('include', '/fiches');
  });

  it('permet de sélectionner des modules et d\'éditer le module general', () => {
    // Créer une fiche depuis la liste
    cy.get('.character-card.create-card').click();

    const nomFiche = `CF_Test_${Date.now()}`;
    cy.get('input.text-input').type(nomFiche);
    cy.get('input.text-inpu').type('https://placekitten.com/200/200.jpg');
    cy.get('select.fiche-select').select('2');
    cy.get('input.colorInpu').invoke('val', '#33AA55').trigger('input');
    cy.get('button.tm-primary').click();

    // La modale de création doit être fermée
    cy.get('.tmedit').should('not.exist');

    // Ouvrir la fiche créée
    cy.contains('.character-card .character-name', nomFiche).should('exist').click();

    // On est bien sur la page détail
    cy.url().should('include', '/ficheDetail/');

    // Ouvrir le sélecteur de modules : il peut s\'ouvrir automatiquement au premier accès
    cy.get('body').then(($body) => {
      if ($body.find('.tmedit .fsm-checkboxes').length) {
        // Déjà ouverte via première visite
        cy.wrap($body)
          .find('.tmedit .fsm-checkboxes input[type="checkbox"]')
          .check({ force: true });
        cy.wrap($body).find('.tmedit button.tm-primary').click();
      } else {
        // Sinon, on l\'ouvre via le bouton
        cy.get('button.cf-module-selector-btn').click();
        cy.get('.fsm-checkboxes input[type="checkbox"]').check({ force: true });
        cy.get('.tmedit').within(() => {
          cy.get('button.tm-primary').click();
        });
      }
    });

    // Les onglets correspondants doivent apparaître (tous)
    const tabs = ['general', 'character', 'story', 'power', 'gallery'];
    tabs.forEach((tab) => {
      cy.get(`button.cf-tab.cf-tab--${tab}`).should('exist');
    });

    // Rester sur l\'onglet general et ouvrir la modale d\'édition
    cy.get('button.cf-tab.cf-tab--general').click();
    cy.get('button.cf-edit-btn').click();

    // Dans la modale, renseigner age et image valides puis sauvegarder
    cy.get('.tm-modal-form').within(() => {
      cy.get('input#age').clear().type('27');
      cy.get('input#image').clear().type('https://placekitten.com/240/240.jpg');
    });
    cy.get('.tmedit').within(() => {
      cy.get('button.tm-primary').click();
    });

    // Vérifier que l\'âge est affiché dans l\'en-tête
    cy.get('.cf-header .cf-rank').should('contain.text', '27');

    // Vérifier que le portrait flottant est mis à jour
    cy.get('.cf-portrait-float img')
      .should('have.attr', 'src')
      .and('include', 'placekitten.com/240/240.jpg');

    // Tester les modales sur character, story et power en modifiant l'image
    const tabImageMap = {
      character: 'https://placekitten.com/241/241.jpg',
      story: 'https://placekitten.com/242/242.jpg',
      power: 'https://placekitten.com/243/243.jpg',
    };

    for (const [tab, url] of Object.entries(tabImageMap)) {
      cy.get(`button.cf-tab.cf-tab--${tab}`).click();
      cy.get('button.cf-edit-btn').click();
      
      // Attendre que la modale soit visible et remplir l'image
      cy.get('.tmedit').should('be.visible');
      cy.get('.tmedit .tm-modal-form').within(() => {
        cy.get('input#image').clear().type(url);
      });
      
      // Sauvegarder et attendre que la modale se ferme
      cy.get('.tmedit button.tm-primary').click();
      cy.get('.tmedit').should('not.exist');
      
      // Vérifier que le portrait flottant est mis à jour
      cy.get('.cf-portrait-float img')
        .should('have.attr', 'src')
        .and('include', url);
    }

    // Visiter chaque onglet
    tabs.forEach((tab) => {
      cy.get(`button.cf-tab.cf-tab--${tab}`).click();
      cy.get('button.cf-edit-btn').should('be.visible');
    });

    // Revenir à la liste via le bouton de retour
    cy.get('button.back-location-button').click();
    cy.url().should('include', '/fiches');

    // Ouvrir le menu de la fiche créée et lancer la suppression
    cy.contains('.character-card .character-name', nomFiche)
      .should('exist')
      .parents('.character-card')
      .within(() => {
        cy.get('.card-menu-button').click();
        cy.get('.card-menu-dropdown .ficheBouton').contains('🗑️').click();
      });

    // Confirmer la suppression dans la modale
    cy.get('.tmedit').should('exist');
    cy.get('.tmedit .tm-primary').click();

    // Vérifier que la fiche a disparu
    cy.contains('.character-card .character-name', nomFiche).should('not.exist');
  });
});


