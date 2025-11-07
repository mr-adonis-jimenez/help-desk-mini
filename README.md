## Repository summary

**Help Desk Intake (Help Desk Mini)** is a lightweight, fully client-side help desk ticket tracker that runs entirely in the browser. Tickets are persisted to `localStorage`, so it needs **no backend, database, or deployment beyond static hosting**.0

### What it does

- Lets users create tickets with **subject, requester email, priority, and description**.1  
- Provides **search by subject/email**, **filter by status (All/Open/Closed)**, and **sorting by updated date, created date, or priority** for quick triage.2  
- Supports **closing/reopening**, **deleting**, and **clearing all tickets** stored in the current browser.3  
- Can **export all tickets as a CSV file** (Excel-friendly, with UTF-8 BOM) for reporting or backup.4  

### How it works

- All tickets are stored under a versioned key (`hdm:tickets:v1`) in `localStorage`, with basic CRUD operations implemented in plain JavaScript.5  
- Each ticket includes metadata such as `status`, `createdAt`, and `updatedAt` timestamps, which power filtering and sorting in the UI.6  
- The app uses **DOM event listeners** on the form, table rows, filters, and buttons to handle ticket creation, updates, deletes, CSV export, and clearing all data.7  
- The interface is built with static `index.html` and a single `styles.css`, featuring a modern dark theme, responsive grid layout, and badge-style status indicators.8  

### Tech stack & deployment

- **Tech:** HTML, CSS, vanilla JavaScript.9  
- **Storage:** Browser `localStorage` only; no server or external DB.10  
- **Deployment:** Designed for static hosting; the repo includes a GitHub Actions workflow to auto-deploy to GitHub Pages from the `main` branch.11  

This makes **Help Desk Intake** a nice fit for demos, internal tools, small teams, or labs where you want a simple, low-friction ticket tracker without spinning up backend infrastructure.