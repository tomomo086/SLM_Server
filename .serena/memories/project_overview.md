# SLM_Server Project Overview

## Purpose
SLM_Server is a local web application that provides AI-assisted services through multiple specialized assistants. It's designed to work with SLM (Small Language Models) via LM Studio and provides a web interface for different domain-specific assistants.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend**: Node.js with Express.js
- **AI Integration**: LM Studio (local SLM server on port 1234)
- **Server**: Python HTTP server for static files (port 8000)
- **Package Manager**: npm

## Project Structure
```
SLM_Server/
├── fortune/           # 易占いアシスタント (Fortune/I-Ching Assistant)
│   ├── data/         # JSON knowledge files
│   ├── server/       # Node.js backend
│   └── *.html, *.js  # Frontend files
├── recipe/           # レシピアシスタント (Recipe Assistant)
├── robotics/         # ロボ開発アシスタント (Robotics Assistant)
├── index.html        # Main landing page
└── *.txt            # Setup documentation (Japanese)
```

## Key Features
1. **Multiple Specialized Assistants**: Fortune, Recipe, Robotics
2. **Local SLM Integration**: Works with LM Studio
3. **Function Calling**: Advanced SLM function calling capabilities
4. **Japanese Language Support**: All interfaces and content in Japanese
5. **Knowledge Base Integration**: JSON-based knowledge systems

## Current Focus: Fortune System
The fortune system (易占いアシスタント) is an I-Ching divination assistant with:
- Traditional 64-hexagram I-Ching knowledge
- Recently added comprehensive I-Ching commentary (660 pages)
- SLM function calling for knowledge retrieval
- Web-based chat interface

## Access Methods
- Main: http://192.168.2.107:8000/
- Fortune: http://192.168.2.107:8000/fortune/chat.html
- Recipe: http://192.168.2.107:8000/recipe/chat.html
- Robotics: http://192.168.2.107:8000/robotics/chat.html