---
name: ui-components
description: Implement and migrate to shadcn/ui components. Use when working with UI components, replacing native HTML form elements, or when the user asks about shadcn components, Select, Button, Input, or UI consistency.
---

# shadcn/ui Component Implementation

## When to Use This Skill

- Implementing new form elements (select, button, input, etc.)
- Migrating native HTML elements to shadcn components
- Adding new shadcn components to the project
- Ensuring UI consistency across the application

## Critical Styling Requirements

**Always use inline styles for component backgrounds** to guarantee visibility per the project's design system:

- `SelectContent`: Add `style={{ backgroundColor: '#ffffff' }}`
- Any popup/overlay component backgrounds must use inline styles
- **Why:** Tailwind classes can fail due to CSS specificity; inline styles are guaranteed

See the `ui-engineer` skill for complete design system documentation.

## Adding New Components

Before using a shadcn component, check if it exists in `src/components/ui/`:

```bash
ls src/components/ui/
```

If the component doesn't exist, add it:

```bash
npx shadcn@latest add [component-name]
```

Common components:
- `button` - Button component
- `select` - Dropdown select
- `input` - Text input
- `textarea` - Multi-line text input
- `checkbox` - Checkbox
- `radio-group` - Radio buttons
- `switch` - Toggle switch
- `label` - Form label
- `dialog` - Modal dialog
- `popover` - Popover/tooltip

## Component Migration Patterns

### Select Dropdown

**Before (native HTML):**
```tsx
<select 
  value={value} 
  onChange={(e) => setValue(e.target.value)}
  className="px-3 py-2 border rounded-md"
>
  <option value="foo">Foo</option>
  <option value="bar">Bar</option>
</select>
```

**After (shadcn):**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent style={{ backgroundColor: '#ffffff' }}>
    <SelectItem value="foo">Foo</SelectItem>
    <SelectItem value="bar">Bar</SelectItem>
  </SelectContent>
</Select>
```

**Important:** Always add `style={{ backgroundColor: '#ffffff' }}` to `SelectContent` to ensure solid white background (per ui-engineer design system).

### Button

**Before (native HTML):**
```tsx
<button 
  onClick={handleClick}
  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
>
  Click Me
</button>
```

**After (shadcn):**
```tsx
import { Button } from '@/components/ui/button';

<Button onClick={handleClick}>
  Click Me
</Button>
```

Button variants:
- `variant="default"` - Primary button (blue)
- `variant="secondary"` - Secondary button (gray)
- `variant="destructive"` - Danger button (red)
- `variant="outline"` - Outlined button
- `variant="ghost"` - No background

### Input

**Before (native HTML):**
```tsx
<input 
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="px-3 py-2 border rounded-md"
/>
```

**After (shadcn):**
```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Textarea

**Before (native HTML):**
```tsx
<textarea 
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="px-3 py-2 border rounded-md"
/>
```

**After (shadcn):**
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

## Migration Workflow

When migrating a component:

1. **Identify native elements**: Look for `<select>`, `<button>`, `<input>`, `<textarea>`
2. **Check if component exists**: `ls src/components/ui/[component].tsx`
3. **Add if needed**: `npx shadcn@latest add [component]`
4. **Replace element**: Use migration pattern above
5. **Add inline styles**: Add `style={{ backgroundColor: '#ffffff' }}` to popup components (SelectContent, etc.)
6. **Test**: Verify functionality and styling match or improve

## API Differences to Watch

### Event Handlers

**Select:**
- Native: `onChange={(e) => setValue(e.target.value)}`
- shadcn: `onValueChange={(value) => setValue(value)}`

**Input/Textarea/Button:**
- Both use standard `onChange`, `onClick`, etc.

### Value Props

**Select:**
- Native: Controlled with `value` and `onChange`
- shadcn: Controlled with `value` and `onValueChange`

**Input/Textarea:**
- Both use standard `value` and `onChange`

## When Native HTML is OK

Use native HTML for:
- Semantic structure: `<form>`, `<label>`, `<div>`, `<span>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<main>`, `<nav>`
- Components not in shadcn/ui library
- Building custom wrapper components

## Quick Reference

| Native HTML | shadcn Component | Command |
|-------------|------------------|---------|
| `<select>` | `Select` | `npx shadcn@latest add select` |
| `<button>` | `Button` | `npx shadcn@latest add button` |
| `<input>` | `Input` | `npx shadcn@latest add input` |
| `<textarea>` | `Textarea` | `npx shadcn@latest add textarea` |
| `<input type="checkbox">` | `Checkbox` | `npx shadcn@latest add checkbox` |
| `<dialog>` | `Dialog` | `npx shadcn@latest add dialog` |
