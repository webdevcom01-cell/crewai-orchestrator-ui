# 🎨 Cyberpunk UI Kit za React

Kompletna kolekcija komponenti sa cyberpunk/tech stilom koji uključuje interaktivni dot grid, 3D tilt kartice, i sve ostale elemente.

## 📁 Struktura fajlova

```
tvoj-projekat/
├── src/
│   ├── components/
│   │   ├── cyberpunk/           👈 KOPIRAJ CEO FOLDER OVDE
│   │   │   ├── index.ts
│   │   │   ├── DotGridBackground.tsx
│   │   │   ├── TiltCard.tsx
│   │   │   ├── CyberButton.tsx
│   │   │   ├── AlertBox.tsx
│   │   │   ├── IdentityBadge.tsx
│   │   │   ├── NeuralFeed.tsx
│   │   │   └── KeyboardHint.tsx
│   │   └── ... (tvoje postojeće komponente)
│   ├── index.css                👈 DODAJ STILOVE OVDE
│   └── App.tsx
```

---

## 🚀 Instalacija - Korak po Korak

### 1. Dodaj Google Fonts u `index.html`

```html
<head>
  <!-- Dodaj ovo pre zatvaranja </head> taga -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
```

### 2. Kopiraj `cyberpunk-styles.css` sadržaj u tvoj `index.css`

Otvori `cyberpunk-styles.css` i kopiraj ceo sadržaj na **početak** tvog `index.css` fajla.

### 3. Kopiraj `components` folder

Kopiraj ceo `components` folder u `src/components/cyberpunk/`

### 4. Importuj komponente u tvoj kod

```tsx
// Importuj pojedinačne komponente
import DotGridBackground from './components/cyberpunk/DotGridBackground';
import TiltCard from './components/cyberpunk/TiltCard';

// ILI importuj sve odjednom
import { 
  DotGridBackground, 
  TiltCard, 
  CyberButton,
  AlertBox,
  IdentityBadge,
  NeuralFeed,
  KeyboardHint 
} from './components/cyberpunk';
```

---

## 📖 Korišćenje Komponenti

### 🔵 DotGridBackground - Interaktivne tačkice

```tsx
import DotGridBackground from './components/cyberpunk/DotGridBackground';

function App() {
  return (
    <div style={{ background: '#050608', minHeight: '100vh' }}>
      <DotGridBackground 
        dotSpacing={35}        // Razmak između tačkica
        dotRadius={1.5}        // Veličina tačkice
        interactionRadius={120} // Radijus interakcije sa mišem
        dotColor="rgba(255, 255, 255, 0.12)"  // Boja tačkica
        glowColor="rgba(34, 197, 220, 1)"     // Boja glow efekta
      />
      {/* Tvoj sadržaj */}
    </div>
  );
}
```

### 🃏 TiltCard - 3D Lebdeća kartica

```tsx
import TiltCard from './components/cyberpunk/TiltCard';

<TiltCard 
  tiltMax={15}           // Maksimalna rotacija u stepenima
  scaleOnHover={1.02}    // Uvećanje na hover
  enableIdle={true}      // Idle floating animacija
  showCorners={true}     // Prikaži dekorativne uglove
  glowOnHover={true}     // Cyan glow na hover
>
  <div className="p-6">
    <h3>Naslov kartice</h3>
    <p>Sadržaj kartice...</p>
  </div>
</TiltCard>
```

### 🔘 CyberButton - Dugmad

```tsx
import CyberButton from './components/cyberpunk/CyberButton';
import { ArrowRight, MessageSquare, Linkedin } from 'lucide-react';

// Primary (belo)
<CyberButton 
  variant="primary" 
  icon={<ArrowRight size={16} />}
  onClick={() => console.log('click')}
>
  Book Call
</CyberButton>

// Secondary (outline)
<CyberButton 
  variant="secondary" 
  icon={<MessageSquare size={16} />}
  iconPosition="left"
>
  WhatsApp
</CyberButton>

// Ghost (transparent)
<CyberButton variant="ghost">
  Learn More
</CyberButton>

// Kao link
<CyberButton 
  variant="secondary" 
  href="https://linkedin.com"
  icon={<Linkedin size={16} />}
  iconPosition="left"
>
  LinkedIn
</CyberButton>
```

### ⚠️ AlertBox - Alert kutija

```tsx
import AlertBox from './components/cyberpunk/AlertBox';

<AlertBox
  type="warning"  // 'warning' | 'info' | 'success' | 'error'
  label="Diagnostic Alert"
  code="Code: 404_FEASIBILITY"
  title="Your AI Idea Might Not Work."
  description="Let me find out before you waste capital."
  linkText="Technical feasibility checks in 48 hours."
  linkHref="#contact"
/>
```

### 🏷️ IdentityBadge - Status badge

```tsx
import IdentityBadge from './components/cyberpunk/IdentityBadge';

<IdentityBadge 
  label="Identity: Gaurav Mahto" 
  status="online"  // 'online' | 'offline' | 'busy' | 'away'
/>
```

### 📊 NeuralFeed - Terminal status feed

```tsx
import NeuralFeed from './components/cyberpunk/NeuralFeed';

// Sa auto-generisanim porukama
<NeuralFeed 
  title="Neural Feed // Live"
  maxItems={3}
  autoGenerate={true}
/>

// Sa custom porukama
<NeuralFeed 
  items={[
    { 
      id: '1', 
      timestamp: '[19:18:05]', 
      type: 'DB', 
      message: 'Vector index rebalancing',
      duration: 'T: 350ms'
    }
  ]}
  autoGenerate={false}
/>
```

### ⌨️ KeyboardHint - Keyboard shortcut hint

```tsx
import KeyboardHint from './components/cyberpunk/KeyboardHint';

<KeyboardHint 
  keys={['SPACE']} 
  action="Hold" 
  position="bottom-right"  // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'static'
/>

// Više tastera
<KeyboardHint 
  keys={['CMD', 'K']} 
  action="Press" 
  position="static"
/>
```

---

## 🎨 CSS Varijable

Možeš customizovati boje menjanjem CSS varijabli u `:root`:

```css
:root {
  /* Backgrounds */
  --bg-primary: #050608;
  --bg-surface: #080F1A;
  --bg-card: rgba(8, 15, 26, 0.85);
  
  /* Accent Colors - PROMENI OVO ZA CUSTOM TEMU */
  --accent-cyan: #22C5DC;
  --accent-green: #22C55E;
  --accent-yellow: #FBBF24;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  
  /* Borders */
  --border-default: rgba(34, 197, 220, 0.15);
  --border-hover: rgba(34, 197, 220, 0.4);
}
```

---

## 💡 Pro Tips

1. **Performanse**: `DotGridBackground` koristi Canvas i requestAnimationFrame, tako da je optimizovan za performanse.

2. **Responsive**: Sve komponente su responsive. TiltCard automatski disabluje tilt efekat na touch uređajima.

3. **Accessibility**: Dodaj `aria-label` atribute gde je potrebno za screen readers.

4. **Dark Mode**: Ovaj kit je dizajniran za tamnu temu. Ako želiš light mode, moraćeš da prilagodiš CSS varijable.

---

## 🤝 Potrebna pomoć?

Ako imaš pitanja ili treba pomoć sa integracijom, slobodno pitaj!
