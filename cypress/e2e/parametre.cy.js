describe('Config Page', () => {

  beforeEach(() => {
    // Créer une session pour l'utilisateur
    cy.session('userSession', () => {
      cy.visit('/login');
      cy.get('button.ln-connexion').click();
      cy.get('input[name="email"]').type(Cypress.env('CYPRESS_EMAIL'));
      cy.get('input[name="password"]').type(Cypress.env('CYPRESS_PASSWORD'));
      cy.get('form').submit();
      cy.url().should('include', '/dashboard');
    });

    // Visiter la page de configuration
    cy.visit('/config');
    cy.url().should('include', '/config');
  });


  // Test 1 : Vérifier que l'utilisateur peut changer son pseudo
  it('should allow the user to update their pseudo', () => {
    const newPseudo = `cyp${Date.now()}`;

    // Vérifie que le pseudo actuel est visible
    cy.get('.user-new-pseudo-name').should('be.visible');

    // Clique sur le bouton d'édition du pseudo
    cy.get('.user-new-pseudo-edit').click();

    // Change le pseudo
    cy.get('input[type="text"]').clear().type(newPseudo);
    cy.get('.user-new-pseudo-save').click();

    // Vérifie que le pseudo a été mis à jour
    cy.get('.user-new-pseudo-name').should('contain', newPseudo);
  });

  // Test 2 : Vérifier que l'utilisateur peut changer son avatar
  it('should allow the user to update their avatar', () => {
    // Vérifie que l'avatar actuel est visible
    cy.get('.user-settings-img').should('be.visible');

    // Clique sur le bouton d'édition de l'avatar
    cy.get('.user-settings-edit').click();

    // Change l'avatar (pour cet exemple, on modifie l'URL de l'image)
    cy.get('input[type="text"]').clear().type('https://new-avatar-url.com');
    cy.get('.user-settings-save').click();

    // Vérifie que l'avatar a été mis à jour
    cy.get('.user-settings-img').should('have.attr', 'src', 'https://new-avatar-url.com');
  });


  // Test 4 : Vérifier que l'utilisateur peut changer la langue
  it('should allow the user to change the language setting', () => {
    // Vérifie que le paramètre de langue est visible
    cy.get('.param-lang-select').should('be.visible');

    // Change la langue
    cy.get('.param-lang-select').select('en'); // Change la langue en anglais

    // Vérifie que la langue a été changée
    cy.get('.param-lang-select').should('have.value', 'en');
  });

});
