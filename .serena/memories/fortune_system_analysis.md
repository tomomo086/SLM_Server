# Fortune System Current Analysis

## Current Knowledge Loading System

### Primary Knowledge File
- **File**: `fortune-knowledge.json`
- **Loading Function**: `loadFortuneKnowledgeData()`
- **Global Variable**: `FORTUNE_KNOWLEDGE_DATA`
- **Content**: Basic 64-hexagram information

### Function Tools (Current)
The system has 3 existing function tools:
1. `search_fortune_knowledge` - Search basic fortune knowledge
2. `get_hexagram_detail` - Get specific hexagram details
3. `perform_divination` - Execute I-Ching divination

### New I-Ching Knowledge Files (Added)
1. **yijing-complete-knowledge.json** - Master index (786,451 characters, 660 pages)
2. **yijing-functions.json** - 4 new function definitions for comprehensive I-Ching access
3. **yijing_texts/** directory - Individual document files

### New Function Tools (Available)
From `yijing-functions.json`:
1. `search_yijing_content` - Keyword search with page range filtering
2. `get_yijing_document` - Get specific document by ID
3. `get_hexagram_info` - Get hexagram info by name (64 hexagrams supported)
4. `search_by_topic` - Search by topic (序卦伝, 雑卦伝, etc.)

## Integration Requirements

### Code Modifications Needed
1. **Expand knowledge loading** - Load additional I-Ching knowledge files
2. **Extend FUNCTION_TOOLS array** - Add 4 new function definitions
3. **Implement new function handlers** - Add execution logic for new functions
4. **Maintain backward compatibility** - Preserve existing fortune functionality

### Key Integration Points
- `loadFortuneKnowledgeData()` function (lines 11-26)
- `FUNCTION_TOOLS` array (lines 29-91)
- `executeLocalFunction()` switch statement (lines 97-107)
- Need to add new global variables for I-Ching data