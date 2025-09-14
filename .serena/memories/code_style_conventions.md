# Code Style and Conventions

## JavaScript Style
- **Language**: ES6+ features (async/await, arrow functions, destructuring)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Variables**: camelCase naming
- **Constants**: UPPER_CASE for global constants
- **Comments**: Japanese comments with // style

## Naming Conventions
- **Functions**: camelCase (e.g., `loadFortuneKnowledgeData`)
- **Variables**: camelCase (e.g., `fortuneKnowledgeData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `FUNCTION_TOOLS`)
- **File names**: kebab-case for HTML, camelCase for JS

## Japanese Language Integration
- **UI Text**: All Japanese
- **Console Messages**: Japanese with emoji prefixes (🔮, ⚙️, 🔍, etc.)
- **Error Messages**: Japanese
- **Comments**: Japanese explanations
- **Function Descriptions**: Japanese in JSON schemas

## JSON Structure
- **Indentation**: 2 spaces for JSON files
- **Encoding**: UTF-8 for Japanese text support
- **Structure**: Consistent nesting and property ordering
- **Validation**: No trailing commas (strict JSON)

## Function Definitions
- **Type**: Always "function" type for SLM compatibility
- **Descriptions**: Japanese descriptions
- **Parameters**: Detailed property descriptions in Japanese
- **Required Fields**: Always specified
- **Enums**: Used for restricted value sets

## Error Handling
- **Try-Catch**: Comprehensive error handling
- **Console Logging**: Detailed error messages with emoji
- **User Feedback**: Status messages in Japanese
- **Fallbacks**: Graceful degradation when services unavailable

## Code Organization
- **Globals**: Declared at top of file
- **Functions**: Grouped by functionality
- **Event Handlers**: Separated from business logic
- **Constants**: Defined before usage