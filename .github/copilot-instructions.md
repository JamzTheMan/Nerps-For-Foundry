# Copilot Instructions

## Project Context

This repository is a JavaScript module for Foundry VTT v13. All code should be compatible with Foundry VTT's API and
module system.

## Coding Guidelines

- Always use the Foundry VTT v13 API for interacting with the virtual tabletop, game data, and user interface.
- Use Foundry VTT v13 application v2 APIs for creating custom applications, forms, and dialogs.
- Base on Pathfinder 2e system 7.x where relevant, ensuring compatibility with its data structures and mechanics.
- Allow for compatibility with Starfinder system 2.x where relevant, ensuring compatibility with its data structures and
  mechanics.
- Use the latest JavaScript features supported by Foundry VTT v13, such as async/await, arrow functions, and template
  literals.
- Follow Foundry VTT's coding conventions, including naming conventions for classes, methods, and variables.
- Treat all code as part of a Foundry VTT module.
- Use ES modules and modern JavaScript syntax.
- Organize code into logical files (e.g., scripts/, macros/, utils/).
- Reference assets (images, fonts, etc.) using relative paths within the module.
- Follow best practices for module.json and compendium pack structure.

## File Structure

- assets/: Images, scenes, fonts, and other media
- scripts/: JavaScript files for module logic and macros
- packs/: Compendium packs
- styles/: CSS files
- languages/: Localization files

## Additional Instructions

- Do not use deprecated Foundry VTT APIs.
- Ensure compatibility with Foundry VTT v13 and Pathfinder 2e system where relevant.
- Document public functions and module features in README.md.

---
These instructions are for GitHub Copilot and contributors to ensure consistent, high-quality code for this Foundry VTT
module.
