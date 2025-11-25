# 📊 Data Processing Dashboard

A full-stack web application for uploading, processing, and visualizing CSV/JSON data files with real-time analytics and interactive charts.

## 🎯 Overview

This project is a monorepo-based full-stack application that allows users to:
- Upload CSV or JSON files (up to 10MB)
- Automatically process and analyze data
- View interactive visualizations (bar charts, line charts, pie charts)
- Explore data with sortable/filterable tables
- Export processed data in CSV or JSON format

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  - File Upload Interface (Drag & Drop)                  │
│  - Data Visualization (Recharts)                        │
│  - Interactive Data Grid (MUI DataGrid)                 │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────┐
│              Backend (Serverless Functions)              │
│  - File Upload & Parsing (Multer, PapaParse)           │
│  - Data Aggregation & Analysis                          │
│  - Export Functionality                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               Vercel KV (Redis Cache)                    │
│  - Temporary data storage (1 hour TTL)                  │
│  - Processed results caching                            │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Package Manager:**
- pnpm (Workspace management)

**Backend:**
- Node.js + TypeScript
- Express.js v4.18.2 (HTTP framework)
- Multer v1.4.5 (File upload handling)
- PapaParse v5.4.1 (CSV parsing)
- Zod v3.22.4 (Schema validation)
- Vercel KV v1.0.1 (Redis caching)
- UUID v9.0.1 (ID generation)
- CORS v2.8.5

**Frontend:**
- React 18.2.0
- Vite v5.0.0 (Build tool)
- TypeScript
- React Router DOM v6.22.3 (Routing)
- Material-UI v5.15.14 (UI components)
- MUI X Data Grid v6.19.8 (Data tables)
- Recharts v2.12.3 (Charts)
- React Dropzone v14.2.3 (File upload)
- Axios v1.6.8 (HTTP client)

## 📂 Project Structure

```
/
├── apps/
│   ├── api/                    # Backend serverless functions
│   │   ├── api/
│   │   │   ├── _lib/           # Helper modules
│   │   │   │   ├── parser.ts   # CSV/JSON parsing logic
│   │   │   │   ├── aggregator.ts # Data aggregation
│   │   │   │   └── kv.ts       # Vercel KV client
│   │   │   ├── upload.ts       # POST /api/upload
│   │   │   ├── status/[id].ts  # GET /api/status/:id
│   │   │   └── export/[id].ts  # GET /api/export/:id
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # Frontend React app
│       ├── src/
│       │   ├── components/
│       │   │   ├── FileUploader.tsx
│       │   │   ├── DashboardGrid.tsx
│       │   │   └── StatCard.tsx
│       │   ├── pages/
│       │   │   ├── UploadPage.tsx
│       │   │   └── DashboardPage.tsx
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── theme.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── sample-sales.csv            # Sample dataset
├── package.json                # Root workspace config
├── pnpm-workspace.yaml
├── vercel.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Vercel account (for KV storage)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd data-processing-dashboard
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up Vercel KV:**

Create a Vercel KV database in your Vercel dashboard and add the environment variables:

```bash
# .env.local (create this file in the root)
KV_URL=<your-kv-url>
KV_REST_API_URL=<your-kv-rest-api-url>
KV_REST_API_TOKEN=<your-kv-rest-api-token>
KV_REST_API_READ_ONLY_TOKEN=<your-kv-rest-api-read-only-token>
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

### Building for Production

Build both applications:

```bash
pnpm build
```

Build individual apps:

```bash
pnpm build:api   # Build backend
pnpm build:web   # Build frontend
```

## 🔌 API Endpoints

### POST `/api/upload`
Upload a CSV or JSON file for processing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (CSV or JSON file, max 10MB)

**Response:**
```json
{
  "success": true,
  "id": "uuid-string",
  "filename": "sales.csv",
  "rowCount": 30,
  "message": "File uploaded and processed successfully"
}
```

### GET `/api/status/:id`
Get processed data and analytics for a given upload ID.

**Response:**
```json
{
  "success": true,
  "cached": false,
  "filename": "sales.csv",
  "uploadedAt": "2024-01-30T10:00:00.000Z",
  "summary": {
    "totalRows": 30,
    "numericFields": {
      "Price": {
        "avg": 145.67,
        "min": 9.99,
        "max": 1299.99,
        "sum": 4370.10
      },
      "Quantity": {
        "avg": 13.5,
        "min": 3,
        "max": 40,
        "sum": 405
      }
    }
  },
  "groupedData": {
    "Electronics": [...],
    "Clothing": [...],
    "Home": [...]
  },
  "originalData": [...]
}
```

### GET `/api/export/:id?format=csv|json`
Export the original data in CSV or JSON format.

**Query Parameters:**
- `format`: `csv` or `json` (default: `json`)

**Response:**
- Content-Type: `text/csv` or `application/json`
- Content-Disposition: `attachment; filename="..."`

## 📊 Features

### Data Processing
- ✅ File upload with validation (CSV/JSON, max 10MB)
- ✅ Automatic format detection
- ✅ Data parsing with error handling
- ✅ Malformed data handling
- ✅ Data validation using Zod

### Data Analysis
- ✅ Summary statistics (count, avg, min, max, sum)
- ✅ Automatic detection of numeric fields
- ✅ Grouping by categorical fields
- ✅ Time-based aggregation support
- ✅ Redis caching for performance

### Visualization
- ✅ Responsive Material-UI design
- ✅ Interactive drag-and-drop file upload
- ✅ 3+ chart types (Bar, Line, Pie)
- ✅ Sortable and filterable data table
- ✅ Quick search functionality
- ✅ Loading states and error handling
- ✅ Export to CSV/JSON

### Bonus Features Implemented
- ✅ Redis caching (Vercel KV)
- ✅ Multiple format support (CSV, JSON)
- ✅ Data export in multiple formats
- ✅ Advanced filtering in DataGrid
- ✅ Automated data processing pipeline

## 🧪 Testing

### Manual Testing

1. **Start the development server:**
```bash
pnpm dev
```

2. **Open the application:**
Navigate to `http://localhost:3000`

3. **Upload the sample file:**
- Drag and drop `sample-sales.csv` or click to select
- Click "Process Data"

4. **Verify the dashboard:**
- Check summary statistics
- Interact with charts
- Use table search and filters
- Export data in both CSV and JSON formats

### Sample Data

Use the included `sample-sales.csv` file which contains:
- 30 rows of sales data
- 5 columns: Date, Category, Product, Price, Quantity
- 3 categories: Electronics, Clothing, Home
- Date range: January 2024

## 📈 Data Processing Approach

1. **File Upload:**
   - User uploads file via drag-and-drop interface
   - Multer receives and buffers file in memory
   - File size and type validation

2. **Parsing:**
   - Automatic format detection (CSV/JSON)
   - PapaParse for CSV with dynamic typing
   - JSON parsing with array detection
   - Error handling for malformed data

3. **Storage:**
   - Generate unique UUID for each upload
   - Store in Vercel KV (Redis) with 1-hour TTL
   - Key format: `data:{id}`

4. **Processing:**
   - Identify numeric fields automatically
   - Calculate statistics (avg, min, max, sum)
   - Find best categorical field for grouping
   - Group data by categories

5. **Caching:**
   - Cache processed results
   - Key format: `result:{id}`
   - Reduces computation on repeated requests

6. **Visualization:**
   - Transform data for Recharts
   - Generate multiple chart types
   - Display in interactive DataGrid

## 🔒 Security Considerations

- File size limit: 10MB
- File type validation (CSV/JSON only)
- Input sanitization via Zod
- CORS configuration
- Data expiration (1 hour TTL)
- No persistent storage of user data

## ⚡ Performance

- Redis caching for processed results
- Serverless functions for auto-scaling
- Lazy loading of chart components
- Debounced search in DataGrid
- Paginated table views

## 🚫 Known Limitations

1. **Data Persistence:** Data is cached for 1 hour only (Vercel KV TTL)
2. **File Size:** Maximum 10MB per file
3. **Concurrent Users:** Limited by Vercel KV rate limits
4. **Real-time Updates:** No WebSocket support (could be added)
5. **Database:** No permanent storage (by design for demo)
6. **Authentication:** No user authentication system
7. **File History:** No upload history tracking

## 🕐 Time Tracking

- **Initial Setup & Configuration:** 30 minutes
- **Backend API Development:** 2 hours
- **Frontend Development:** 3 hours
- **Integration & Testing:** 1 hour
- **Documentation:** 30 minutes
- **Total:** ~7 hours

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
pnpm install -g vercel
```

2. **Link to Vercel project:**
```bash
vercel link
```

3. **Set up environment variables:**
Add Vercel KV environment variables in Vercel dashboard

4. **Deploy:**
```bash
vercel --prod
```

## 🔧 Troubleshooting

**Issue:** "Module not found" errors
- Solution: Run `pnpm install` in the root directory

**Issue:** API calls failing in development
- Solution: Make sure Vercel CLI is running (`vercel dev`)

**Issue:** KV errors
- Solution: Check environment variables are set correctly

**Issue:** Build fails
- Solution: Check TypeScript errors with `pnpm build`

## 📝 License

MIT

## 👤 Author

Created for Fullstack WebRTC/Pixel Streaming Engineer test task

---

**Note:** This is a demonstration project created for a technical assessment. It showcases full-stack development skills with modern web technologies.

