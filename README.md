# Melonn
Frontend and Backend Web Application

## Backend
First, you need to run web server application following the next steps:
- `cd backend/`
- `npm start`

Backend application run on port 3500.
### Server Endpoints
- GET /orders  ---> Get all sell orders
- GET /orders/:id  ---> Get sell order by id
- POST /orders  ---> Create new sell order

## Frontend
Then, you need to run the frontend application following the next steps:
- `cd frontend/`
- `npm start`
Frontend application run on default port (3000).

## Database
There are some records to test. The new sell orders are stored in server memory, when the server it is restarted that data too.
