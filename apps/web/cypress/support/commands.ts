/// <reference types="cypress" />

// Custom commands for DopaForge E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with a test user
       * @example cy.login('test@example.com')
       */
      login(email: string): Chainable<void>;

      /**
       * Create a task via API
       * @example cy.createTask({ title: 'Test Task', duration: 25 })
       */
      createTask(task: {
        title: string;
        description?: string;
        duration?: number;
        resistance?: number;
        completed?: boolean;
      }): Chainable<void>;

      /**
       * Clear all test data
       * @example cy.clearTestData()
       */
      clearTestData(): Chainable<void>;

      /**
       * Drag and drop helper
       * @example cy.get('.source').drag('.target')
       */
      drag(targetSelector: string): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string) => {
  // Mock Supabase auth session
  const mockUser = {
    id: 'test-user-id',
    email: email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  // Set auth in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem(
      'supabase.auth.token',
      JSON.stringify(mockSession)
    );
  });

  // Set cookie for SSR
  cy.setCookie('supabase-auth-token', JSON.stringify([mockSession.access_token, mockSession.refresh_token]));
});

// Create task command
Cypress.Commands.add('createTask', (task) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test task description',
    duration_minutes: 25,
    resistance_level: 5,
    xp_reward: 50,
    is_completed: false,
    user_id: 'test-user-id',
  };

  const taskData = {
    ...defaultTask,
    title: task.title,
    description: task.description || defaultTask.description,
    duration_minutes: task.duration || defaultTask.duration_minutes,
    resistance_level: task.resistance || defaultTask.resistance_level,
    is_completed: task.completed || defaultTask.is_completed,
  };

  // Create task via API
  cy.request({
    method: 'POST',
    url: '/api/tasks',
    headers: {
      Authorization: 'Bearer mock-access-token',
    },
    body: taskData,
  });

  // Reload to show new task
  cy.reload();
});

// Clear test data command
Cypress.Commands.add('clearTestData', () => {
  cy.request({
    method: 'DELETE',
    url: '/api/test/clear',
    headers: {
      Authorization: 'Bearer mock-access-token',
    },
  });
});

// Drag and drop command
Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetSelector) => {
  const dataTransfer = new DataTransfer();
  
  cy.wrap(subject).trigger('dragstart', { dataTransfer });
  cy.get(targetSelector).trigger('drop', { dataTransfer });
  cy.get(targetSelector).trigger('dragend');
});

// Export empty object to make TypeScript happy
export {};