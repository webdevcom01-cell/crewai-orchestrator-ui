# CrewAI Orchestrator - Design System

Kompletan design system za CrewAI Orchestrator UI aplikaciju sa cyberpunk estetikom i cyan akcentima.

## 📁 Struktura

```
design-system/
├── tokens/           # Design tokens (boje, tipografija, spacing)
├── components/       # Reusable komponente
├── layouts/          # Layout komponente
└── index.ts          # Main export
```

## 🎨 Tokens

### Colors (`tokens/colors.ts`)

**Paleta boja:**
- **Cyan** (Primary): `#22c5dc` - glavna accent boja
- **Emerald** (Success): `#22c55e` - success states
- **Yellow** (Warning): `#eab308` - warnings, context links
- **Red** (Error): `#ef4444` - errors, danger states
- **Blue** (Info): `#3b82f6` - running states
- **Slate**: text i borders

**Semantic aliasi:**
```typescript
import { colors, semantic } from '@/design-system/tokens';

semantic.text.primary      // White text
semantic.status.success    // Green for success
semantic.interactive.primary // Cyan for buttons
```

### Typography (`tokens/typography.ts`)

**Font familije:**
- Sans: Inter (body text, UI)
- Mono: JetBrains Mono (code, IDs)

**Text styles:**
```typescript
textStyles.h1        // Headings
textStyles.body      // Body text
textStyles.label     // Labels
textStyles.code      // Code blocks
```

### Spacing (`tokens/spacing.ts`)

**Spacing skala:** 0-32 (u 4px jedinicama)

```typescript
spacing[4]  // 16px
componentSpacing.card.md     // Card padding
componentSpacing.button.md   // Button padding
```

### Shadows & Effects (`tokens/shadows.ts`)

**Glow effects:**
```typescript
shadows.glow.cyan.md    // Cyan glow
shadows.card.hover      // Card hover effect
```

**Transitions:**
```typescript
transitions.all         // Smooth transitions
transitions.colors      // Color transitions
```

## 📦 Components

### Base Components

#### Card
Bazna kartica sa variantama:

```tsx
<Card variant="interactive" padding="lg" active>
  <CardHeader>Title</CardHeader>
  <CardContent>Content...</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

**Props:**
- `variant`: `'default' | 'outlined' | 'elevated' | 'interactive'`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `active`: boolean (selection state)

#### Button
Dugme sa varijantama i stanjima:

```tsx
<Button 
  variant="primary" 
  size="md" 
  loading={false}
  iconBefore={<Icon />}
>
  Click me
</Button>

<IconButton 
  icon={<Icon />} 
  variant="ghost"
  aria-label="Settings"
/>
```

**Variants:** `'primary' | 'secondary' | 'ghost' | 'danger' | 'success'`

#### Badge
Status badge komponenta:

```tsx
<Badge variant="success" icon={<CheckIcon />}>
  Completed
</Badge>

<StatusBadge status="running" />
```

**Status variants:** `'pending' | 'running' | 'completed' | 'failed'`

#### Input
Form elementi:

```tsx
<Input
  label="Agent Name"
  placeholder="Enter name..."
  error="Required field"
  iconBefore={<UserIcon />}
  fullWidth
/>

<Textarea
  label="Description"
  rows={4}
  resize={false}
/>

<Select label="Model">
  <option>gemini-2.5-flash</option>
</Select>
```

### Advanced Components

#### EmptyState
Prazna stanja:

```tsx
<EmptyState
  icon={<Icon size={48} />}
  title="No agents found"
  description="Create your first agent to get started"
  action={<Button>Create Agent</Button>}
/>
```

#### Loading States
Spinners i skeletons:

```tsx
<Spinner size="lg" />
<LoadingScreen message="Loading agents..." />

<Skeleton width="100%" height="2rem" />
<SkeletonText lines={3} />
<SkeletonCard />
```

## 🏗️ Layouts

### DashboardLayout
Glavni layout sa sidebar-om:

```tsx
<DashboardLayout
  sidebar={<Sidebar items={navItems} />}
  header={<PageHeader title="Agents" />}
  background={<DotGridBackground />}
>
  {/* Page content */}
</DashboardLayout>
```

### PageHeader
Header za stranice:

```tsx
<PageHeader
  icon={<UsersIcon />}
  title="Agents"
  description="Configure AI agents for your crew"
  actions={
    <Button variant="primary">
      <PlusIcon /> New Agent
    </Button>
  }
/>
```

### Sidebar
Navigaciona sidebar:

```tsx
<Sidebar
  items={[
    { id: 'agents', label: 'Agents', icon: <Icon />, path: '/' },
    { id: 'tasks', label: 'Tasks', icon: <Icon />, path: '/tasks' },
  ]}
  logo={<Logo />}
  footer={<Version />}
/>
```

## 🚀 Usage

### Import

```typescript
// Sve odjednom
import { Button, Card, colors, spacing } from '@/design-system';

// Specifično
import { Button } from '@/design-system/components';
import { colors } from '@/design-system/tokens';
import { DashboardLayout } from '@/design-system/layouts';
```

### Primer stranice

```tsx
import { 
  DashboardLayout, 
  Sidebar, 
  PageHeader, 
  Card, 
  Button,
  EmptyState 
} from '@/design-system';

function AgentsPage() {
  return (
    <DashboardLayout
      sidebar={<Sidebar items={navItems} />}
      header={
        <PageHeader
          title="Agents"
          actions={<Button variant="primary">New Agent</Button>}
        />
      }
    >
      <div style={{ padding: spacing[6] }}>
        <Card padding="lg">
          {agents.length === 0 ? (
            <EmptyState
              title="No agents"
              action={<Button>Create Agent</Button>}
            />
          ) : (
            // Lista agenata
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

## 🎯 Design Principles

1. **Cyberpunk estetika** - Cyan akcenti, dark theme, glow effects
2. **Konzistentnost** - Svi elementi koriste iste tokene
3. **Accessibility** - ARIA labels, keyboard navigation, focus states
4. **Performance** - React.memo, optimized re-renders
5. **Type-safe** - Full TypeScript support

## 🔧 Customization

### Boje

Izmeni `tokens/colors.ts` za custom paletu:

```typescript
export const colors = {
  cyan: { 400: '#YOUR_COLOR' },
  // ...
};
```

### Spacing

Podesi spacing u `tokens/spacing.ts`:

```typescript
export const componentSpacing = {
  card: { md: '20px' },
  // ...
};
```

## 📝 Notes

- Sve komponente podržavaju `className` za dodatnu stilizaciju
- Koristi Tailwind klase za hover/focus states gdje je potrebno
- Design system je optimizovan za dark mode
- Komponente su fully typed za TypeScript autocomplete

## 🔗 Related

- See existing components in `components/` za referentne implementacije
- Check `components/ui/` za postojeće utility komponente
