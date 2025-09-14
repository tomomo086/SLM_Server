# Tech Stack and Commands

## Development Environment
- **OS**: Windows
- **Node.js**: For backend services
- **Python**: For HTTP server and text processing
- **LM Studio**: Local SLM server (port 1234)

## Key Commands

### Starting the Server
```bash
# Navigate to project directory
cd C:\Users\tomon\dev\projects\SLM_Server

# Start Python HTTP server (port 8000)
python -m http.server 8000

# Alternative: Start Node.js backend (if needed)
cd fortune
npm start
```

### Development Commands
```bash
# Install dependencies
npm install

# Development mode with nodemon
npm run dev

# Run tests
npm test

# Check project structure
dir /s
```

### Windows Utility Commands
```bash
# File operations
dir                    # List files (ls equivalent)
cd                     # Change directory
type filename.txt      # View file content (cat equivalent)
findstr "pattern" *.js # Search in files (grep equivalent)

# Process management
tasklist | findstr "node"     # Check running processes
netstat -an | findstr "8000"  # Check port usage
```

## File Structure Commands
```bash
# Navigate to key directories
cd fortune\data       # Knowledge files
cd fortune\server     # Backend code
cd recipe             # Recipe assistant
cd robotics           # Robotics assistant
```

## Development Workflow
1. Start Python HTTP server on port 8000
2. Ensure LM Studio is running on port 1234
3. Access web interface via browser
4. Modify code in respective directories
5. Refresh browser to see changes (static files)
6. Restart Node.js server for backend changes