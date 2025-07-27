// Accessibility Examples for DopaForge UI Components
// This file demonstrates best practices for using the UI components with proper accessibility

import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

export function AccessibilityExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Button Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Buttons</h2>
        
        {/* Standard button with label */}
        <Button aria-label="Save changes">Save</Button>
        
        {/* Toggle button with pressed state */}
        <Button aria-pressed={true} aria-label="Toggle notification, currently on">
          Notifications On
        </Button>
        
        {/* Disabled button */}
        <Button disabled aria-label="Submit form (disabled)">
          Submit (Disabled)
        </Button>
      </section>

      {/* Input with Label Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Inputs</h2>
        
        {/* Input with associated label */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com"
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-sm text-muted-foreground">
            We'll never share your email with anyone else.
          </p>
        </div>
        
        {/* Input with error state */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            aria-invalid={true}
            aria-errormessage="password-error"
          />
          <p id="password-error" className="text-sm text-destructive" role="alert">
            Password must be at least 8 characters long.
          </p>
        </div>
      </section>

      {/* Checkbox Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Checkboxes</h2>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" aria-describedby="terms-description" />
          <Label 
            htmlFor="terms" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accept terms and conditions
          </Label>
        </div>
        <p id="terms-description" className="text-sm text-muted-foreground mt-1">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </section>

      {/* Select Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Select</h2>
        
        <div className="space-y-2">
          <Label htmlFor="country-select">Country</Label>
          <Select>
            <SelectTrigger id="country-select" aria-label="Select your country">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Tabs Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Tabs</h2>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList aria-label="Account settings tabs">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p>Make changes to your account here.</p>
          </TabsContent>
          <TabsContent value="password" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Password Settings</h3>
            <p>Change your password here.</p>
          </TabsContent>
          <TabsContent value="notifications" className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
            <p>Manage your notification preferences.</p>
          </TabsContent>
        </Tabs>
      </section>

      {/* Dialog Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessible Dialog</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Settings Dialog</Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription id="dialog-description">
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" defaultValue="@peduarte" className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Keyboard Navigation Guide */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Keyboard Navigation Guide</h2>
        <div className="space-y-2 text-sm">
          <p><kbd>Tab</kbd> - Navigate between interactive elements</p>
          <p><kbd>Shift + Tab</kbd> - Navigate backwards</p>
          <p><kbd>Enter</kbd> or <kbd>Space</kbd> - Activate buttons and checkboxes</p>
          <p><kbd>Arrow Keys</kbd> - Navigate within select menus and tabs</p>
          <p><kbd>Escape</kbd> - Close dialogs and dropdowns</p>
        </div>
      </section>
    </div>
  );
}