# Docker Containerization & Sharing Guide — UCMS

This guide explains how to build a unified Docker image for the **University Complaint Management & Resolution System (UCMS)** and share it with examiners, supervisors, or teammates so they can run the entire system with **a single command on any machine (Windows, Mac, or Linux)** without installing Node.js, npm, or any database!

---

## 📋 Prerequisites
Before building or running Docker commands:
1. Ensure **Docker Desktop** is installed and running on your computer (look for the whale icon in the Windows taskbar).
2. If Docker Desktop is not started, launch it from your Desktop shortcut or Start menu.

---

## 🛠️ Step 1: Build the Docker Image

Open PowerShell or Command Prompt in the `UCMS` directory:
```bash
cd C:\Users\NexGen\Desktop\UCMS
docker build -t ucms:latest .
```

> **How it works:**
> The `Dockerfile` uses a **multi-stage build**:
> 1. It compiles the React + Vite frontend and generates static assets.
> 2. It bundles the Express backend, SQLite database, and seeder.
> 3. It places the frontend into the server's public folder so that **both frontend and backend run on port 5000 from a single lightweight container!**

---

## 🏃 Step 2: Run the Container

### Option A: Standard Docker Run
```bash
docker run -d -p 5000:5000 --name ucms-app ucms:latest
```

### Option B: Using Docker Compose (Recommended)
```bash
docker compose up -d
```

### Accessing the App:
Once running, open your web browser:
- **Application URL:** [http://localhost:5000](http://localhost:5000)
- **API Health Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

All 4 demo personas (Student, IT Staff, Facility Staff, and Admin) are available via the 1-click switcher at the top of the interface!

To stop the container:
```bash
# If using Option A:
docker stop ucms-app

# If using Option B:
docker compose down
```

---

## 🌐 How to Share Your Docker Image with Anyone

There are two easy methods to share your image with other people:

### Method 1: Push to Docker Hub (Recommended — Easiest for Recipient)
This allows anyone to run your project with **a single command** without downloading any source code files.

1. Create a free account on [hub.docker.com](https://hub.docker.com).
2. Log in via your terminal:
   ```bash
   docker login
   ```
3. Tag your image with your Docker Hub username:
   ```bash
   docker tag ucms:latest yourdockerusername/ucms:latest
   ```
4. Push your image to Docker Hub:
   ```bash
   docker push yourdockerusername/ucms:latest
   ```
5. **How the other person runs it:**
   Give the other person this single command:
   ```bash
   docker run -d -p 5000:5000 yourdockerusername/ucms:latest
   ```
   *Docker will automatically pull the image and launch the entire app on their machine at `http://localhost:5000`!*

---

### Method 2: Export as an Offline File (`.tar`)
If you want to share the project offline via Google Drive, OneDrive, or a USB drive without publishing to Docker Hub:

1. **Export the image to a file:**
   ```bash
   docker save -o ucms-image.tar ucms:latest
   ```
   *This creates a single file named `ucms-image.tar` in your UCMS folder.*

2. **Send the file:** Send `ucms-image.tar` to your evaluator or teammate.

3. **How the recipient loads and runs it:**
   On their computer, they open a terminal in the folder containing `ucms-image.tar` and run:
   ```bash
   docker load -i ucms-image.tar
   docker run -d -p 5000:5000 --name ucms-app ucms:latest
   ```
   Then they open `http://localhost:5000` in their browser.

---

## 🔒 Persistent Storage
The SQLite database and any uploaded evidence files (photos, PDF documents) are stored inside `/app/server/uploads` and `/app/server/ucms.db`. In `docker-compose.yml`, a volume is mapped so data persists even when the container is restarted.
