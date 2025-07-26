// path: apps/web/cypress/e2e/task-flow.cy.ts
describe('Task Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.visit('/dashboard');
  });

  it('should create, start, and complete a task', () => {
    // Create task
    cy.contains('New Micro Task').click();
    cy.get('input[placeholder*="Write project proposal"]').type('Test E2E Task');
    cy.get('[role="slider"]').click(); // Set time
    cy.contains('Create Task').click();

    // Verify task appears
    cy.contains('Test E2E Task').should('be.visible');
    cy.contains('30 min').should('be.visible');

    // Start task
    cy.get('[aria-label="Start task"]').first().click();
    
    // Should navigate to focus page
    cy.url().should('include', '/focus/');
    cy.contains('Test E2E Task').should('be.visible');
    cy.contains('Start Focus').click();

    // Timer should be running
    cy.contains('29:5').should('be.visible'); // Timer counting down
  });
});