describe('Dashboard Functionality', () => {
  beforeEach(() => {
    // Mock authentication
    cy.login('test@example.com');
    cy.visit('/dashboard');
  });

  it('should display dashboard elements', () => {
    // Header elements
    cy.contains('DopaForge').should('be.visible');
    cy.get('[aria-label="User menu"]').should('exist');
    
    // Main dashboard sections
    cy.contains('Your Tasks').should('be.visible');
    cy.contains('Add Task').should('be.visible');
    
    // Stats section
    cy.contains('Total XP').should('be.visible');
    cy.contains('Current Level').should('be.visible');
    cy.contains('Tasks Completed').should('be.visible');
  });

  it('should create a new task', () => {
    // Click add task button
    cy.contains('Add Task').click();
    
    // Fill in task form
    cy.get('input[name="title"]').type('Test Task for E2E');
    cy.get('textarea[name="description"]').type('This is a test task created by Cypress');
    cy.get('input[name="duration"]').clear().type('25');
    cy.get('[data-testid="resistance-slider"]').click(); // Set resistance level
    
    // Submit form
    cy.get('button[type="submit"]').contains('Create Task').click();
    
    // Verify task appears in list
    cy.contains('Test Task for E2E').should('be.visible');
    cy.contains('25 min').should('be.visible');
  });

  it('should update task status', () => {
    // Create a task first
    cy.createTask({
      title: 'Task to Complete',
      duration: 15,
      resistance: 5,
    });

    // Find and click the task
    cy.contains('Task to Complete')
      .parents('[data-testid="task-card"]')
      .within(() => {
        // Click complete button
        cy.get('[data-testid="complete-task"]').click();
      });

    // Verify completion
    cy.contains('Task completed!').should('be.visible');
    cy.contains('Task to Complete')
      .parents('[data-testid="task-card"]')
      .should('have.class', 'completed');
  });

  it('should drag and drop tasks to reorder', () => {
    // Create multiple tasks
    cy.createTask({ title: 'Task 1', duration: 10 });
    cy.createTask({ title: 'Task 2', duration: 20 });
    cy.createTask({ title: 'Task 3', duration: 30 });

    // Get initial order
    cy.get('[data-testid="task-card"]').first().should('contain', 'Task 3');
    
    // Drag Task 3 to second position
    cy.get('[data-testid="task-card"]')
      .first()
      .drag('[data-testid="task-card"]:nth-child(2)');

    // Verify new order
    cy.get('[data-testid="task-card"]').first().should('contain', 'Task 2');
    cy.get('[data-testid="task-card"]').eq(1).should('contain', 'Task 3');
  });

  it('should filter tasks by status', () => {
    // Create tasks with different statuses
    cy.createTask({ title: 'Pending Task', completed: false });
    cy.createTask({ title: 'Completed Task', completed: true });

    // Show all tasks
    cy.get('[data-testid="filter-all"]').click();
    cy.get('[data-testid="task-card"]').should('have.length', 2);

    // Show only pending
    cy.get('[data-testid="filter-pending"]').click();
    cy.get('[data-testid="task-card"]').should('have.length', 1);
    cy.contains('Pending Task').should('be.visible');

    // Show only completed
    cy.get('[data-testid="filter-completed"]').click();
    cy.get('[data-testid="task-card"]').should('have.length', 1);
    cy.contains('Completed Task').should('be.visible');
  });

  it('should show task details in modal', () => {
    cy.createTask({
      title: 'Detailed Task',
      description: 'This task has lots of details',
      duration: 45,
      resistance: 8,
    });

    // Click on task to open details
    cy.contains('Detailed Task').click();

    // Verify modal content
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Detailed Task').should('be.visible');
      cy.contains('This task has lots of details').should('be.visible');
      cy.contains('45 minutes').should('be.visible');
      cy.contains('Resistance: 8').should('be.visible');
      
      // Close modal
      cy.get('[aria-label="Close"]').click();
    });

    // Modal should be closed
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should delete a task', () => {
    cy.createTask({ title: 'Task to Delete' });

    // Open task menu
    cy.contains('Task to Delete')
      .parents('[data-testid="task-card"]')
      .find('[data-testid="task-menu"]')
      .click();

    // Click delete option
    cy.contains('Delete').click();

    // Confirm deletion
    cy.get('[role="alertdialog"]').within(() => {
      cy.contains('Are you sure?').should('be.visible');
      cy.contains('Delete').click();
    });

    // Task should be removed
    cy.contains('Task to Delete').should('not.exist');
    cy.contains('Task deleted').should('be.visible');
  });
});