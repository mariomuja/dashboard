# File Upload Guide

This guide explains how to use the file upload feature to update dashboard data.

## Overview

The KPI Dashboard includes a web service that allows you to upload JSON files to dynamically update the dashboard data without restarting the application.

## Setup

### 1. Start the Backend Server

In a separate terminal, run:
```bash
npm run start:server
```

The server will start on `http://localhost:3000`

### 2. Start the Frontend (if not already running)

```bash
npm start
```

The frontend runs on `http://localhost:4200`

## Accessing the Admin Page

### Login Required

1. **Navigate to Admin:**
   - Click the "⚙️ Admin" button in the dashboard header
   - You'll be redirected to the login page if not authenticated

2. **Login:**
   - Enter password: `admin123` (default)
   - Click "Login"
   - You'll be redirected to the admin page

3. **Logout:**
   - Click "🔒 Logout" button in the admin header

## Uploading Data Files

### Using the Admin Page (Recommended)

1. **Download Current Data:**
   - Click "Download Current Data" to get the complete dashboard data file
   - This gives you a template with all sections

2. **Edit the JSON File:**
   - Open `dashboard-data.json` in your text editor
   - Modify the values as needed
   - Keep all sections: kpi, revenue, sales, conversion
   - Keep all periods: week, month, year

3. **Upload Modified File:**
   - Click "Choose JSON File"
   - Select your edited file
   - File must be:
     - Valid JSON format
     - Under 1MB in size
     - Contains all required sections
   - The page will automatically reload with your new data

### Using API Directly

Upload using curl or any HTTP client:

```bash
# Upload complete dashboard data
curl -X POST -F "file=@dashboard-data.json" http://localhost:3000/api/upload/dashboard-data

# Download current data
curl http://localhost:3000/api/data/dashboard-data > dashboard-data.json
```

## Data File Structure

The `dashboard-data.json` file contains all dashboard data in a single file:

```json
{
  "kpi": {
    "week": [...],
    "month": [...],
    "year": [...]
  },
  "revenue": {
    "week": [...],
    "month": [...],
    "year": [...]
  },
  "sales": {
    "week": [...],
    "month": [...],
    "year": [...]
  },
  "conversion": {
    "week": [...],
    "month": [...],
    "year": [...]
  }
}
```

### KPI Data Structure

Each KPI item requires:
- `id`: Unique identifier (string)
- `title`: KPI title (string)
- `value`: Display value (string)
- `change`: Percentage change (number)
- `trend`: "up", "down", or "stable"
- `icon`: Emoji or icon (string)
- `color`: Hex color code (string)

### Chart Data Structure

Each chart data point requires:
- `label`: X-axis label (string)
- `value`: Y-axis value (number)

## API Endpoints

- `POST /api/upload/dashboard-data` - Upload complete dashboard data
  - Accepts JSON file via multipart/form-data
  - Maximum file size: 1MB
  - Rate limited: 5 uploads per minute per IP

- `GET /api/data/dashboard-data` - Download current dashboard data
  - Returns the complete dashboard data JSON

- `GET /api/health` - Health check and API info

## Validation

The server validates:
- File must be valid JSON
- Must contain `week`, `month`, and `year` properties
- All periods must be arrays
- Each item must have required fields

Invalid files are rejected with an error message.

## Troubleshooting

### "Upload failed"
- Make sure the backend server is running (`npm run start:server`)
- Check that the JSON file is properly formatted
- Verify the file includes all required fields

### "Invalid JSON format"
- Use a JSON validator to check your file
- Common issues: missing commas, trailing commas, unquoted keys

### "Invalid data structure"
- Ensure you have all three periods: week, month, year
- Check that required fields match the structure above

### Changes not showing
- The page should auto-reload after upload
- If not, manually refresh the browser
- Check the browser console for errors

## Example Workflow

1. Download current KPI data from admin page
2. Edit the file:
   ```json
   {
     "week": [...],
     "month": [
       {
         "id": "1",
         "title": "Total Revenue",
         "value": "$150,000",  ← Changed
         "change": 15.0,        ← Changed
         "trend": "up",
         "icon": "💰",
         "color": "#10b981"
       }
     ],
     "year": [...]
   }
   ```
3. Upload the modified file
4. Dashboard automatically reloads with new values

## Security Features

The dashboard includes the following security measures:

### ✅ Authentication
- Admin page is protected with password authentication
- Default password: `admin123` (change in `src/app/services/auth.service.ts`)
- Session-based authentication
- Automatic redirect to login page for unauthorized access

### ✅ File Size Validation
- Maximum upload size: 1MB
- Files larger than 1MB are rejected
- Both frontend and backend validation

### ✅ Rate Limiting
- Maximum 5 uploads per minute per IP address
- Prevents abuse and DOS attacks
- Automatic cleanup of old attempts

### ✅ File Type Validation
- Only JSON files (.json) are accepted
- MIME type validation on backend
- Extension validation on frontend

### Additional Security for Production
- Change the default admin password
- Use environment variables for sensitive data
- Enable HTTPS
- Add database for user management
- Implement JWT tokens instead of session storage
- Add audit logging for all uploads
- Use a proper authentication system (OAuth, etc.)

