# Traffic Simulation Routing Application

## Project Overview
Web application for traffic routing and road network simulation using React, TypeScript, Leaflet.js, and Docker.

## Prerequisites
- Node.js (18+)
- Docker
- Docker Compose

## Project Structure
```
project-root/
├── client/           # React Vite frontend
├── server/           # Backend server
├── docker-compose.yml
```

## Local Development

### Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### Run Development Servers
```bash
# Client (Vite)
cd client
npm run dev

# Server
cd server
npm start
```

## Docker Deployment

### Build and Run
```bash
docker-compose up --build
```

### Ports
- Client: http://localhost:5173
- Server: http://localhost:8000

## Key Features
- Interactive traffic routing
- Road network visualization
- Dynamic traffic density mapping

## Technologies
- React
- TypeScript
- Leaflet.js
- Docker
- Vite

## Environment Variables
Configure in `.env` files:
- `VITE_API_URL`: Server endpoint
- `PORT`: Server port

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request