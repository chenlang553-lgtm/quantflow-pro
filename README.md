<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dPZI_dFFuLuUviQaAQYYHL3dKTCELb5-

## Run Locally

**Prerequisites:**  Node.js (front-end) and Python 3.9+ (back-end)


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the Python backend (default port 8000):
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
4. Run the frontend:
   `npm run dev`

The frontend will call the backend at `http://localhost:8000/api` by default. To point to a different backend, set `VITE_API_BASE_URL` in `.env.local`.

## Deploy to Production

The project deploys as two services: the FastAPI backend and the built static frontend.

1. **Backend (FastAPI + Uvicorn/Gunicorn)**
   - Create a virtual environment and install dependencies:
     ```bash
     cd backend
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     pip install "uvicorn[standard]" gunicorn
     ```
   - Start the API server behind Gunicorn (adjust workers/port for your host):
     ```bash
     GUNICORN_CMD_ARGS="--timeout 120" \
     gunicorn backend.main:app \
       -k uvicorn.workers.UvicornWorker \
       --bind 0.0.0.0:8000 \
       --workers 2
     ```
   - Expose the API as `https://api.example.com/api` (via Nginx/ALB/etc.) and ensure CORS is allowed for your frontend origin.

2. **Frontend (Vite build)**
   - Install dependencies and build once on your CI/host:
     ```bash
     npm install
     VITE_API_BASE_URL="https://api.example.com/api" npm run build
     ```
   - Serve the generated `dist/` directory from any static host (Nginx, CDN, S3+CloudFront, Vercel, Netlify). Set caching/ compression as desired and redirect all unknown routes to `index.html` for SPA routing.

3. **Environment & persistence**
   - Required envs: `GEMINI_API_KEY` for AI strategy generation; `VITE_API_BASE_URL` to point the frontend at your backend.
   - The backend stores strategy data in `backend/data/strategies.json`. Mount this path to durable storage (e.g., host volume or persistent disk) so uploads and edits survive restarts.

4. **Health checks & observability**
   - API health: `GET https://api.example.com/api/health`.
   - Forward proxy headers (`--proxy-headers`) if you terminate TLS upstream so request URLs are reconstructed correctly.
   - Add process supervision (systemd, Docker, or a PaaS) to restart the backend on failure and centralize logs.
