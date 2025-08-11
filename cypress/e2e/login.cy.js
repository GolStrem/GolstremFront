describe('Login Modal - LoginPage', () => {
  beforeEach(() => {
    // Nettoie les cookies ou le localStorage avant chaque test
    window.localStorage.clear();
  });

  it('should display the login modal and login with valid credentials', () => {
    cy.visit('/login'); // Va à la page de login

    // Vérifie que le bouton de connexion est visible
    cy.get('button.ln-connexion').should('be.visible');
    cy.get('span').contains('CONNEXION'); // Vérifie que le texte "Connexion" est bien affiché

    // Clique sur le bouton de connexion pour ouvrir la modal de connexion
    cy.get('button.ln-connexion').click();

    // Vérifie que la modal de connexion est affichée
    cy.get('.ln-modal').should('be.visible');
    cy.get('.ln-modal').contains('Connexion'); // Vérifie que la modal contient le texte "Connexion"

    // Remplir les champs de connexion avec les informations fournies
      cy.get('input[name="email"]').type(Cypress.env('CYPRESS_EMAIL'));
      cy.get('input[name="password"]').type(Cypress.env('CYPRESS_PASSWORD'));

    // Soumettre le formulaire de connexion
    cy.get('form').submit();

    // Vérifie que l'utilisateur est redirigé vers le tableau de bord
    cy.url().should('include', '/dashboard'); // Remplace l'URL par celle de ton tableau de bord

    // Vérifie que l'élément spécifique du tableau de bord est visible (ex. un texte de bienvenue ou une section spécifique)
  });

  // Test 2 : Vérifier la redirection si l'utilisateur est déjà connecté
  it('should redirect to dashboard if already logged in', () => {
    // Simule la présence d'un token dans le localStorage
    window.localStorage.setItem('token', 'fakeToken123');

    cy.visit('/login'); // Essaie de visiter la page de login

    // Vérifie que l'utilisateur est redirigé vers le tableau de bord
    cy.url().should('eq', 'http://localhost:3000/dashboard'); // Remplace l'URL par celle de ton tableau de bord
  });
});
