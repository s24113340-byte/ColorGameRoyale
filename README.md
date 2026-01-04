# Base44 App

[![Open on Base44](https://img.shields.io/badge/Open-Base44-blue)](https://app.base44.com/apps/6938e9ea648f1673c86a0d24)

## 👑 Color Game Royale

**Color Game Royale** is a fast-paced **Arcade RPG** inspired by traditional Filipino and Taiwanese night-market color games. It reimagines classic color betting mechanics into a fantasy-driven arcade experience set in the **Chromatic Kingdom**.

Players predict color outcomes under a ticking timer, build streaks, trigger elemental combos, and influence the fate of the kingdom through their choices.

**Hosted on Base44:** open directly via the badge above or the link below.

### 🔗 App link

- **App URL:** https://app.base44.com/apps/6938e9ea648f1673c86a0d24
- **App ID:** `6938e9ea648f1673c86a0d24`
- **Public settings:** `public_with_login`
- **Sample entity:** `TimeAttackScore` (2 records found)

> Note: GitHub READMEs do not render iframes. Use the link or badge to open the embedded app.

### 🎮 Game Overview

- **Genre:** Arcade RPG / Color Matching
- **Gameplay:** Predict colors, earn points, extend time, and trigger powerful combos
- **World:** The Chromatic Kingdom, shaped by elemental balance
- **Villain:** **Umbra the Chromatic Shadow**, an active antagonist who interferes with gameplay
- **Pacing:** Fast 60-second rounds with bonus time extensions

### ⚔️ Core Features

- **Elemental Factions:** Fire, Water, Nature, and Light — each with unique combo effects  
- **Champions:** Choose between Ren or Rei, each with distinct thematic growth paths  
- **Dynamic Combat:** Use the same color mechanics to battle Umbra or rival players  
- **Multiple Modes:** Story-driven Normal Mode, high-score Time Attack, and competitive PVP  
- **Multiple Endings:** The dominant element determines the kingdom’s final fate

### 🎨 Visual Style

A blend of **night-market carnival aesthetics** and **magical RPG fantasy**, featuring neon colors, glossy arcade UI, and cinematic effects.

**Color Game Royale** merges nostalgia, arcade tension, and RPG progression into a single, high-energy experience.

### 💡 Quick example — fetch TimeAttackScore entities

```javascript
fetch("https://app.base44.com/api/apps/6938e9ea648f1673c86a0d24/entities/TimeAttackScore", {
  headers: {
    'api_key': 'YOUR_API_KEY'
  }
}).then(r => r.json()).then(console.log);
```

_The repository does not include any API keys — keep secrets out of source files._
