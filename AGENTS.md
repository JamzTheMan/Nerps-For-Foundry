# AI Agent Guide for Nerps-For-Foundry

This is a **Foundry VTT v13 module** providing combat enhancements and utilities for Pathfinder 2e (PF2e) and Starfinder systems.

## Architecture Overview

**Three-layer structure:**
- **Core (`scripts/nerps-for-foundry.js`)**: Main NerpsForFoundry class with combat utilities
- **Hooks (`scripts/hooks-for-nerps.js`)**: Foundry lifecycle hooks (`init`, `ready`, `pf2e.startTurn`, combat events)
- **Macros (`scripts/macros/*.js`)**: Reusable game logic functions exposed to `game.nerps` namespace for in-world macros

**Key pattern:** Macros are imported into hooks, exposed via `game.nerps.*`, and accessed by Foundry users through macro scripts.

## Critical Workflows

### Development Build
```powershell
npm run pack      # Bundle compendia for release
npm run unpack    # Extract compendia back to _source for git tracking
```
Use `unpack` before committing compendium changes; `pack` before publishing releases.

### Module Loading
1. Init hook registers settings, exposes macro functions, and sets up keybindings
2. Ready hook initializes NerpsForFoundry singleton and loads custom CSS if enabled
3. SocketLib socket registers for GM-only remote functions (cross-client actions)

## Important Patterns

### Settings System
All module settings prefixed with `MODULE_NAME` ('nerps-for-foundry'). Use helpers:
```javascript
import {getSetting, setSetting, toggleSetting} from "./utils/extensions.js";
getSetting('auto-remove-reaction-effects')  // Returns boolean, handles MODULE_NAME prefix
```

### Macro Function Exposure
Functions must be:
1. Defined in `scripts/macros/*.js`
2. Imported in `hooks-for-nerps.js`
3. Added to `game.nerps` object in init hook
4. Called from macro scripts via `game.nerps.functionName()`

### PF2e Integration
- Check actor traits using both modern **Set** (`actor.traits.has('construct')`) and legacy array fallback (`actor.system.traits.value`)
- Duration expiry text patterns: 'turn-start', 'turn-end', etc.
- Remove effects via `actor.deleteEmbeddedDocuments("Item", [effectIds])`
- Use PF2eWorkbench API for mystification: `game.PF2eWorkbench.doMystificationFromToken()`

### Cross-Client Communication
Use SocketLib for GM-only actions (repair, remove reactions):
```javascript
socket.register("functionName", functionName);  // In init hook
socket.executeAsGM(functionName, args...);      // Called by players
```

### Combat Turn Hooks
```javascript
Hooks.on("pf2e.startTurn", async (combatant, combat, userId) => {})
Hooks.on("createCombatant", async (combatant, options, userId) => {})
```
Combat constants: `TOKEN_DISPLAY_MODES.HOVER`, `KEYBINDING_PRECEDENCE.NORMAL`

## File Organization

```
scripts/
  ├─ nerps-for-foundry.js (Logger, NerpsForFoundry class)
  ├─ hooks-for-nerps.js (All Foundry hooks)
  ├─ damage-dice.js (Dice So Nice colorsets for PF2e damage types)
  ├─ settings-for-nerps.js (game.settings.register calls)
  ├─ constants.js (MODULE_NAME, MODULE_PATH)
  ├─ utils/
  │  ├─ extensions.js (getSetting/setSetting helpers)
  │  └─ logger.js (Logging utility)
  └─ macros/ (13 exported game functions)
```

## Common Tasks

### Add New Setting
Add in `settings-for-nerps.js` with `game.settings.register(MODULE_NAME, ...)`, then access via `getSetting('key')`.

### Add New Macro Function
1. Create `scripts/macros/name.js` with export
2. Import in `hooks-for-nerps.js`
3. Add to `game.nerps` object in init hook
4. If GM-only, register with socket: `socket.register("name", name)`

### Modify Combat Behavior
Hook into `pf2e.startTurn` for turn-specific logic or `createCombatant` for token setup on combat start.

### Work with Compendia
Compendia stored as LevelDB. Always run `npm run unpack` before git commits, `npm run pack` before releases. See COMPENDIUM_WORKFLOW.md.

## Dependencies

- **Foundry VTT v13** API
- **PF2e System 7.x** (primary target) and **Starfinder 2.x** (supported)
- **SocketLib** (for cross-client socket communication)
- **PF2e Workbench** (for mystification utilities)
- **Dice So Nice** (optional, for custom damage dice)

## Constants and Utilities

```javascript
MODULE_NAME = 'nerps-for-foundry'
MODULE_PATH = 'modules/nerps-for-foundry'
log = Logger instance (use log.info(), etc.)
i18n(key) = game.i18n.localize(key)
```

## Testing & Debugging

- Module is designed for personal campaigns; enable `CONFIG.debug.hooks = true` in code to trace hook execution
- Combat features toggle-able via world settings (auto-remove reactions, auto-select token, etc.)
- Keybinding: Shift+P selects all player tokens

