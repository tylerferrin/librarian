# UI Engineer Skill

Expert in React UI development for the Librarian pedal editor. Ensures consistent design system application across all components.

## When to Use This Skill

Use when:
- Creating new UI components (modals, dialogs, cards, buttons, forms)
- Updating existing UI components
- Styling issues are reported (invisible buttons, wrong colors, inconsistent spacing)
- User mentions design inconsistencies

## Design System Reference

### Color Palette (Light Theme)

```typescript
// Backgrounds
'app-bg': '#f5f5f5'        // Page background
'card-bg': '#ffffff'        // Cards, modals, panels
'card-header': '#f9fafb'    // Card headers, modal headers/footers
'control-bg': '#f9fafb'     // Input fields background
'control-hover': '#f3f4f6'  // Hover states

// Borders
'border-light': '#e5e7eb'   // Card borders, dividers
'border-default': '#d1d5db' // Default borders
'control-border': '#d1d5db' // Input borders

// Text
'text-primary': '#111827'   // Main text
'text-secondary': '#4b5563' // Labels, secondary text
'text-muted': '#6b7280'     // Placeholder text, disabled

// Accent Colors
'accent-blue': '#3b82f6'    // Primary actions, links
'accent-green': '#10b981'   // Success, save actions
'accent-red': '#ef4444'     // Danger, delete actions
'accent-purple': '#a855f7'  // Special accents
'warning': '#f59e0b'        // Warning states
```

### Component Patterns

#### 1. Modal/Dialog Structure

```tsx
<div 
  className="fixed inset-0 flex items-center justify-center"
  style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
  onClick={onClose}
>
  <div
    className="rounded-lg shadow-xl w-full max-w-lg m-4 border border-border-light"
    style={{ backgroundColor: '#ffffff' }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
      <h2 className="text-base font-semibold text-text-primary">Title</h2>
      <button className="p-2 hover:bg-control-hover rounded-md transition-colors">
        <X className="w-5 h-5 text-text-secondary" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-6 space-y-5">
      {/* Modal content */}
    </div>
    
    {/* Footer */}
    <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-card-header">
      {/* Action buttons */}
    </div>
  </div>
</div>
```

**Critical:** Always use:
- `style={{ backgroundColor: '#ffffff' }}` for modal body (not just className)
- `style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}` for overlay
- `zIndex: 10000` for overlays over drawers

#### 2. Drawer/Sidebar Structure

```tsx
<>
  {/* Overlay */}
  <div
    className="fixed inset-0 transition-opacity"
    style={{ zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    onClick={onClose}
  />
  
  {/* Drawer */}
  <div
    className="fixed right-0 top-0 h-full shadow-xl w-full md:w-1/2 border-l border-border-light"
    style={{ zIndex: 9999, backgroundColor: '#ffffff' }}
  >
    {/* Content with bg-app-bg scrollable area */}
    <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]" 
         style={{ backgroundColor: '#f5f5f5' }}>
      {/* Drawer content */}
    </div>
  </div>
</>
```

#### 3. Button Patterns

**Primary Action Button:**
```tsx
<button
  className="px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
>
  Action
</button>
```

**Secondary Button:**
```tsx
<button
  className="px-4 py-2.5 text-sm font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-colors"
>
  Cancel
</button>
```

**Danger Button:**
```tsx
<button
  className="px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
  style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
>
  Delete
</button>
```

**Success/Save Button:**
```tsx
<button
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
>
  <Save className="w-3 h-3" />
  Save Current
</button>
```

**Critical:** Always use inline `style` for background colors on action buttons to ensure visibility.

#### 4. Form Input Pattern

```tsx
<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
    Field Name
  </label>
  <input
    type="text"
    className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
    placeholder="Placeholder text"
  />
</div>
```

#### 5. Card Pattern

```tsx
<div className="bg-card-bg border border-border-light rounded-lg shadow-sm">
  <div className="px-4 py-2 bg-card-header border-b border-border-light">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
      Card Title
    </h3>
  </div>
  <div className="p-4">
    {/* Card content */}
  </div>
</div>
```

## Critical Rules

### 1. Always Use Inline Styles For:
- Modal/dialog backgrounds: `style={{ backgroundColor: '#ffffff' }}`
- Button background colors: `style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}`
- Overlay backgrounds: `style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}`
- Any color that must be guaranteed visible

**Why:** Tailwind classes can fail due to CSS specificity or missing config. Inline styles are guaranteed.

### 2. Spacing Standards
- Modal/Dialog padding: `px-6 py-4` (header/footer), `p-6` (content)
- Form field spacing: `space-y-5` or `space-y-4`
- Button padding: `px-4 py-2.5` (standard), `px-3 py-1.5` (compact)
- Card padding: `p-4` (content), `px-4 py-2` (header)

### 3. Typography Standards
- Modal titles: `text-base font-semibold text-text-primary`
- Form labels: `text-xs font-semibold uppercase tracking-wider text-text-secondary`
- Button text: `text-sm font-medium`
- Body text: `text-sm text-text-secondary`

### 4. Z-Index Layers
- Overlay: `9998`
- Drawer: `9999`
- Modal over drawer: `10000`

### 5. Responsive Patterns
- Drawers: `w-full md:w-1/2`
- Modals: `w-full max-w-md` or `max-w-lg`
- Always include `m-4` margin on modals

## Checklist for UI Component Work

When creating or updating ANY UI component:

- [ ] Modal/dialog has explicit white background via inline style
- [ ] Overlay has semi-transparent black via inline style
- [ ] All action buttons use inline styles for colors
- [ ] Spacing follows standards (px-6 py-4, p-6, etc.)
- [ ] Typography uses semantic tokens (text-text-primary, etc.)
- [ ] Labels are uppercase with tracking-wider
- [ ] Buttons have proper disabled states
- [ ] Focus states on inputs (focus:border-accent-blue)
- [ ] Hover states on interactive elements
- [ ] Proper z-index for stacking
- [ ] Icons are appropriately sized (w-5 h-5 for close buttons, w-3 h-3 for button icons)
- [ ] Responsive breakpoints where needed

## Common Mistakes to Avoid

1. ❌ Using only Tailwind classes for button backgrounds
   ✅ Always add inline style for guaranteed visibility

2. ❌ Forgetting to set modal background color
   ✅ Use `style={{ backgroundColor: '#ffffff' }}`

3. ❌ Inconsistent spacing between similar components
   ✅ Follow the spacing standards chart

4. ❌ Using different shades of the same semantic color
   ✅ Use exact hex values from the palette

5. ❌ Forgetting disabled states
   ✅ Add `disabled:opacity-50 disabled:cursor-not-allowed`

## Example: Complete Modal Component

```tsx
export function ExampleModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-lg m-4 border border-border-light"
        style={{ backgroundColor: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">Modal Title</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-control-hover rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Field Label
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              placeholder="Enter value..."
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-card-header">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
```

## Testing Checklist

Before considering UI work complete:

1. [ ] View component in the app - all elements visible?
2. [ ] All buttons have visible backgrounds and text?
3. [ ] Modal/dialog is properly centered with white background?
4. [ ] Spacing looks consistent with rest of app?
5. [ ] Hover states work on interactive elements?
6. [ ] Focus states visible on form inputs?
7. [ ] Component works on mobile width?
8. [ ] No console errors or warnings?

## Quick Reference: Component Files

- Modals: `src/components/presets/ConfirmModal.tsx`, `PresetManager.tsx` (save dialog)
- Buttons: `src/components/common/TapButton.tsx`
- Cards: `src/components/common/ParameterCard.tsx`
- Forms: See PresetManager save dialog for input patterns
- Connection: `src/components/DeviceSelector.tsx`

Always review these files for current patterns before creating new UI components.
