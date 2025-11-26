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
