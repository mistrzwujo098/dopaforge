describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display auth page elements', () => {
    cy.contains('Welcome to DopaForge').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    
    // Browser validation should prevent submission
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('should send magic link for valid email', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    cy.get('input[type="email"]').type(testEmail);
    cy.get('button[type="submit"]').click();
    
    // Should show success message
    cy.contains('Check your email').should('be.visible');
    cy.contains('We sent you a magic link').should('be.visible');
  });

  it('should toggle between sign in and sign up', () => {
    // Initially in sign in mode
    cy.contains('Sign in to your account').should('be.visible');
    
    // Click to switch to sign up
    cy.contains("Don't have an account? Sign up").click();
    
    // Should show sign up text
    cy.contains('Create an account to start building habits').should('be.visible');
    
    // Switch back to sign in
    cy.contains('Already have an account? Sign in').click();
    cy.contains('Sign in to your account').should('be.visible');
  });

  it('should disable submit button when loading', () => {
    cy.get('input[type="email"]').type('test@example.com');
    
    // Intercept auth request to control timing
    cy.intercept('POST', '**/auth/v1/otp', {
      delay: 1000,
      statusCode: 200,
      body: {},
    }).as('authRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Button should be disabled while loading
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Sending...');
    
    // Wait for request to complete
    cy.wait('@authRequest');
    
    // Button should be enabled again
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should redirect authenticated users to dashboard', () => {
    // Mock authenticated session
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
        },
      }));
    });

    cy.visit('/auth');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });
});