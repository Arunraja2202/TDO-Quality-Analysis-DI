# TDO Quality Analysis — Node.js/Express

Converted from Python Flask (`Models_AR.py` + `base.html`) to Node.js/Express.  
**No changes to the frontend UI or business logic.**

---

## Project Structure

```
tdo-app/
├── server.js              ← Express server (replaces Flask app + routes)
├── package.json
├── src/
│   ├── queries.js         ← All 35+ validation query functions (replaces Python)
│   └── excel.js           ← Excel report generation (replaces openpyxl/xlsxwriter)
├── public/
│   ├── index.html         ← Frontend (identical to base.html, Flask tags removed)
│   └── static/
│       ├── images/
│       │   └── Favicon.png      ← Copy your favicon here
│       └── video/
│           └── Earth.mp4        ← Copy your background video here
└── Downloads/             ← Generated Excel reports are saved here (auto-created)
```

---

## Setup & Run

### Prerequisites
- Node.js v16 or later (`node --version`)
- npm

### Install & Start

```bash
cd tdo-app
npm install          # installs express, multer, papaparse, xlsx
npm start            # starts server on http://localhost:8080
```

Open **http://localhost:8080** in your browser.

### Development (auto-restart on file change)

```bash
npm run dev          # uses nodemon
```

---

## Static Assets

Copy your original Flask static files into the `public/static/` folder:

| Original Flask path                  | New path                              |
|--------------------------------------|---------------------------------------|
| `static/images/Favicon.png`         | `public/static/images/Favicon.png`   |
| `static/video/Earth.mp4`            | `public/static/video/Earth.mp4`      |

---

## Flask → Node.js Mapping

| Flask (Python)                    | Node.js/Express equivalent          |
|-----------------------------------|-------------------------------------|
| `app = Flask(__name__)`           | `const app = express()`             |
| `@app.route('/')` → `render_template` | `app.get('/', res.sendFile(...))`|
| `@app.route('/upload', POST)`     | `app.post('/upload', multer, ...)`  |
| `@app.route('/download/<file>')`  | `app.get('/download/:filename', ...)` |
| `pd.read_csv()`                   | `Papa.parse(csvText, {header:true})`|
| `df.to_html(index=False)`         | `arrayToHtmlTable(rows)` in server.js |
| `create_excel()` / openpyxl       | `createExcel()` in src/excel.js (SheetJS) |
| All pandas filter queries         | Plain JS `.filter()` in src/queries.js |
| `webview.create_window()`         | Just open browser to `localhost:8080` |
| Flask `flash()`                   | JSON error responses                |

---

## Packaging as Desktop App (optional)

To replicate the `pywebview` desktop-app experience, you can wrap with **Electron**:

```bash
npm install --save-dev electron
```

Add to `package.json` scripts:
```json
"electron": "electron ."
```

Create `main.js` (Electron entry):
```js
const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');

app.whenReady().then(() => {
  fork('./server.js');          // start Express
  const win = new BrowserWindow({ width: 1024, height: 768 });
  win.loadURL('http://localhost:8080');
});
```

---

## Notes

- **Excel hyperlinks**: SheetJS CE (free) does not support `=HYPERLINK()` cell formulas.
  The summary sheet uses plain text `→ SheetName` instead. For clickable hyperlinks,
  use the `exceljs` package (MIT licensed) once you have internet access:
  ```bash
  npm install exceljs
  ```
  Then update `src/excel.js` to use `exceljs` — the API is documented at
  https://github.com/exceljs/exceljs

- **`access_mg_names` / `Null_MG` check**: The Python code references a large
  `access_mg_names` set for `check_name_mg_mismatch`. This has been preserved
  faithfully in `src/queries.js`. The set contains thousands of brand names —
  search for `access_mg_names` in the file to review or update it.

- **CSV only**: The original Python code already limited input to CSV files.
  This conversion maintains that behaviour.
