# DopaForge UI Accessibility Guidelines

## Overview
The DopaForge UI component library has been enhanced with comprehensive accessibility features to ensure all users can interact with your applications effectively.

## Key Accessibility Features

### 1. ARIA Support
All components include appropriate ARIA attributes:
- `aria-label` - Provides accessible names for elements
- `aria-describedby` - Links elements to descriptive text
- `aria-invalid` - Indicates error states
- `aria-pressed` - Shows toggle button states
- `aria-disabled` - Indicates disabled states

### 2. Keyboard Navigation
All interactive components support full keyboard navigation:
- **Tab/Shift+Tab** - Navigate between elements
- **Enter/Space** - Activate buttons and form controls
- **Arrow Keys** - Navigate within dropdowns, selects, and tabs
- **Escape** - Close dialogs and dismiss dropdowns

### 3. Focus Management
- Clear focus indicators with ring styles
- Enhanced focus visibility with proper contrast
- Focus trap in modal dialogs
- Logical tab order

### 4. Screen Reader Support
- Semantic HTML elements
- Proper heading hierarchy
- Descriptive labels and instructions
- Error messages associated with form fields

## Component-Specific Guidelines

### Button
```tsx
// Basic accessible button
<Button aria-label="Save document">Save</Button>

// Toggle button with state
<Button aria-pressed={isActive}>Toggle Feature</Button>

// Disabled button
<Button disabled aria-label="Submit (form incomplete)">Submit</Button>
```

### Input
```tsx
// Input with label and description
<Label htmlFor="email">Email</Label>
<Input 
  id="email" 
  type="email"
  aria-describedby="email-help"
/>
<p id="email-help">Enter your work email</p>

// Input with error
<Input 
  aria-invalid={true}
  aria-errormessage="email-error"
/>
<p id="email-error" role="alert">Invalid email format</p>
```

### Select
```tsx
// Accessible select with label
<Label htmlFor="country">Country</Label>
<Select>
  <SelectTrigger id="country" aria-label="Select country">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="us">United States</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox
```tsx
// Checkbox with label and description
<Checkbox id="terms" aria-describedby="terms-desc" />
<Label htmlFor="terms">Accept terms</Label>
<p id="terms-desc">You agree to our policies</p>
```

### Dialog
```tsx
// Accessible dialog pattern
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent aria-describedby="dialog-desc">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription id="dialog-desc">
        Dialog description for screen readers
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Tabs
```tsx
// Accessible tabs with proper roles
<Tabs defaultValue="tab1">
  <TabsList aria-label="Settings tabs">
    <TabsTrigger value="tab1">General</TabsTrigger>
    <TabsTrigger value="tab2">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <h3>General Settings</h3>
  </TabsContent>
</Tabs>
```

## Best Practices

### 1. Always Provide Labels
Every interactive element should have a clear, descriptive label:
- Use `<Label>` components with `htmlFor` attribute
- Add `aria-label` when visual labels aren't present
- Ensure placeholder text isn't the only label

### 2. Announce Dynamic Changes
- Use `role="alert"` for error messages
- Implement live regions for dynamic content updates
- Provide feedback for user actions

### 3. Maintain Color Contrast
- Text should have a contrast ratio of at least 4.5:1
- Large text (18pt+) needs at least 3:1
- Focus indicators need 3:1 contrast against background

### 4. Test with Assistive Technology
- Navigate using only keyboard
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify focus order is logical
- Ensure all content is reachable

### 5. Error Handling
- Clearly identify errors with `aria-invalid`
- Associate error messages with `aria-errormessage`
- Provide clear instructions for fixing errors
- Don't rely solely on color to indicate errors

## Testing Checklist

- [ ] Can navigate entire interface with keyboard only
- [ ] All interactive elements have visible focus indicators
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Dialogs trap focus and can be dismissed with Escape
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have appropriate alt text
- [ ] Page has logical heading structure
- [ ] Dynamic content changes are announced
- [ ] Custom controls have appropriate ARIA roles

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)