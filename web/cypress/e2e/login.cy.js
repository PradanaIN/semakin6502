describe('login page', () => {
  it('loads the form', () => {
    cy.visit('/login');
    cy.contains('SEMAKIN 6502').should('be.visible');
    cy.get('input[name="identifier"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });
});
