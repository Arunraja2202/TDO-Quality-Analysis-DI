// /**
//  * TDO Quality Analysis - Node.js/Express Server
//  * Converted from Flask (Models_AR.py)
//  *
//  * Run:  npm install && npm start
//  * Visit: http://localhost:8080
//  */

// const express = require('express');
// const multer  = require('multer');
// const path    = require('path');
// const fs      = require('fs');
// const XLSX    = require('xlsx');
// const Papa    = require('papaparse');
// const os = require('os');

// const { processCSV } = require('./src/queries');
// const { createExcel } = require('./src/excel');

// const compression = require('compression');

// const app = express();

// app.use(compression());
// const PORT = process.env.PORT || 8080;

// // ── Folders ────────────────────────────────────────────────────────────────────
// // ── Folders ─────────────────────────────────────────────────────


// const UPLOAD_FOLDER = path.join(os.tmpdir(), 'uploads');

// if (!fs.existsSync(UPLOAD_FOLDER)) {
//     fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
// }

// // ── Static files ───────────────────────────────────────────────
// app.use(
//     '/static',
//     express.static(
//         path.join(__dirname,'public','static'),
//         {
//             maxAge:'7d',
//             etag:true
//         }
//     )
// );

// // ── Multer upload ──────────────────────────────────────────────
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
//     filename: (req, file, cb) =>
//         cb(null, `${Date.now()}-${file.originalname}`)
// });

// const upload = multer({ storage });

// // ── Routes ─────────────────────────────────────────────────────────────────────

// // GET /  →  serve index.html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // POST /upload  →  process CSV, return JSON (same contract as Flask)
// app.post('/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file provided' });
//   }

//   const filepath = req.file.path;

//   try {
//     // Read & parse CSV
//     const csvText = fs.readFileSync(filepath, 'utf-8');
//     const parsed  = Papa.parse(csvText, { header: true, skipEmptyLines: true });
//     const rows    = parsed.data; // array of objects keyed by column header

//     // Run all validation queries (Python logic → JS)
//     const resultDict = processCSV(rows);

//     // Build Excel report
//     const excelFilename = await createExcel(resultDict, UPLOAD_FOLDER);

//     // Build response payload (mirrors Flask JSON response exactly)
//     const detailedErrorsHtml  = {};
//     const detailedErrorsCount = {};

//     for (const [key, df] of Object.entries(resultDict)) {
//       if (key === 'Error Summary') continue;
//       if (Array.isArray(df) && df.length > 0) {
//         detailedErrorsHtml[key]  = arrayToHtmlTable(df);
//         detailedErrorsCount[key] = df.length;
//       }
//     }

//     const summaryHtml = summaryToHtmlTable(resultDict);

//     // Clean up uploaded file
//     fs.unlinkSync(filepath);

//     return res.json({
//       table_html:            summaryHtml,
//       detailed_errors_html:  detailedErrorsHtml,
//       detailed_errors_count: detailedErrorsCount,
//       excel_filename:        path.basename(excelFilename),
//     });

//   } catch (err) {
//     if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
//     console.error(err);

//     if (err.message && err.message.includes('Missing column')) {
//       return res.status(400).json({ error: err.message });
//     }
//     return res.status(500).json({ error: `Processing error: ${err.message}` });
//   }
// });

// // GET /download/:filename  →  serve the generated Excel file
// app.get('/download/:filename', (req, res) => {
//   const filePath = path.join(UPLOAD_FOLDER, req.params.filename);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: 'Kindly refresh the URL & reupload the file.' });
//   }
//   res.download(filePath);
// });

// // ── Helpers ───────────────────────────────────────────────────────────────────

// /**
//  * Convert an array of row-objects to an HTML <table> string.
//  * Mirrors pandas DataFrame.to_html(index=False).
//  */
// function arrayToHtmlTable(rows) {
//   if (!rows || rows.length === 0) return '<table><tbody></tbody></table>';
//   const headers = Object.keys(rows[0]);
//   let html = '<table border="1" class="dataframe">\n<thead><tr>';
//   html += headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
//   html += '</tr></thead>\n<tbody>\n';
//   for (const row of rows) {
//     html += '<tr>';
//     html += headers.map(h => `<td>${escapeHtml(String(row[h] ?? ''))}</td>`).join('');
//     html += '</tr>\n';
//   }
//   html += '</tbody>\n</table>';
//   return html;
// }

// /**
//  * Build the Error Summary HTML table from resultDict.
//  */
// function summaryToHtmlTable(resultDict) {
//   const rows = [];
//   for (const [key, df] of Object.entries(resultDict)) {
//     if (key === 'Error Summary') continue;
//     const count = Array.isArray(df) ? df.length : 0;
//     rows.push({ 'Sheet Name': key, 'Error Count': count });
//   }
//   return arrayToHtmlTable(rows);
// }

// function escapeHtml(str) {
//   return str
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;');
// }

// app.get('/health', (req,res)=>{

//     res.status(200).send('OK');

// });
// // ─// ── Start ─────────────────────────────────────────────────────────────────────
// app.get('/health', (req,res)=>{
//     res.send('OK');
// });

// app.listen(PORT,'0.0.0.0',()=>{

//     console.log(
//         `Server running on port ${PORT}`
//     );

// });
/**
 * TDO Quality Analysis - Node.js/Express Server
 *
 * Run:
 *   npm install
 *   npm start
 *
 * Visit:
 *   http://localhost:8080
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const os = require('os');
const compression = require('compression');

const { processCSV } = require('./src/queries');
const { createExcel } = require('./src/excel');

const app = express();

app.use(compression());

const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────────────────────
// Folders
// ─────────────────────────────────────────────────────────────

const UPLOAD_FOLDER = path.join(os.tmpdir(), 'uploads');

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Static files
// ─────────────────────────────────────────────────────────────

app.use(
    '/static',
    express.static(
        path.join(__dirname, 'public', 'static'),
        {
            maxAge: '7d',
            etag: true
        }
    )
);

// ─────────────────────────────────────────────────────────────
// Multer upload
// ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },

    filename: (req, file, cb) => {
        const safeName = path.basename(file.originalname);

        cb(
            null,
            `${Date.now()}-${safeName}`
        );
    }
});

// Limit upload size.
// Adjust if your files are larger.
const upload = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    }
});

// ─────────────────────────────────────────────────────────────
// GET /
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );

});

// ─────────────────────────────────────────────────────────────
// Memory logger
// ─────────────────────────────────────────────────────────────

function logMemory(label) {

    const memory = process.memoryUsage();

    console.log(
        `[MEMORY] ${label} | ` +
        `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB | ` +
        `Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB | ` +
        `Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB | ` +
        `External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`
    );

}

// ─────────────────────────────────────────────────────────────
// POST /upload
// ─────────────────────────────────────────────────────────────

app.post(
    '/upload',
    upload.single('file'),

    async (req, res) => {

        if (!req.file) {

            return res.status(400).json({
                error: 'No file provided'
            });

        }

        const filepath = req.file.path;

        logMemory('Upload received');

        try {

            // ─────────────────────────────────────────────
            // Read CSV
            // ─────────────────────────────────────────────

            const csvText = fs.readFileSync(
                filepath,
                'utf-8'
            );

            console.log(
                `CSV size: ${(Buffer.byteLength(csvText, 'utf8') / 1024 / 1024).toFixed(2)} MB`
            );

            logMemory('After reading CSV');

            // ─────────────────────────────────────────────
            // Parse CSV
            // ─────────────────────────────────────────────

            const parsed = Papa.parse(
                csvText,
                {
                    header: true,
                    skipEmptyLines: true
                }
            );

            if (parsed.errors && parsed.errors.length > 0) {

                console.warn(
                    `CSV parsing returned ${parsed.errors.length} errors`
                );

            }

            const rows = parsed.data;

            console.log(
                `CSV rows: ${rows.length}`
            );

            logMemory('After CSV parsing');

            // The CSV string is no longer needed.
            // This removes our reference to it.
            //
            // NOTE:
            // JavaScript may not immediately release the memory.
            //
            // We intentionally do not keep `parsed`.

            // ─────────────────────────────────────────────
            // Process validation
            // ─────────────────────────────────────────────

            const resultDict = processCSV(rows);

            console.log(
                'Validation completed'
            );

            logMemory('After processCSV');

            // `rows` is no longer needed after processCSV.
            // Setting it to null helps garbage collection
            // when processing large files.
            //
            // We declared it with const above, so instead
            // we rely on scope ending after this request.
            //
            // The resultDict is now the main object.

            // ─────────────────────────────────────────────
            // Create Excel
            // ─────────────────────────────────────────────

            const excelFilename = await createExcel(
                resultDict,
                UPLOAD_FOLDER
            );

            console.log(
                `Excel created: ${excelFilename}`
            );

            logMemory('After createExcel');

            // ─────────────────────────────────────────────
            // Build response
            // ─────────────────────────────────────────────

            const detailedErrorsHtml = {};
            const detailedErrorsCount = {};

            for (
                const [key, df]
                of Object.entries(resultDict)
            ) {

                if (key === 'Error Summary') {
                    continue;
                }

                if (
                    Array.isArray(df) &&
                    df.length > 0
                ) {

                    console.log(
                        `Building HTML for ${key}: ${df.length} rows`
                    );

                    detailedErrorsHtml[key] =
                        arrayToHtmlTable(df);

                    detailedErrorsCount[key] =
                        df.length;
                }

            }

            logMemory(
                'After building detailed HTML'
            );

            // ─────────────────────────────────────────────
            // Summary
            // ─────────────────────────────────────────────

            const summaryHtml =
                summaryToHtmlTable(resultDict);

            // ─────────────────────────────────────────────
            // Remove uploaded CSV
            // ─────────────────────────────────────────────

            safeDelete(filepath);

            logMemory('Before response');

            // ─────────────────────────────────────────────
            // Response
            // ─────────────────────────────────────────────

            return res.json({

                table_html: summaryHtml,

                detailed_errors_html:
                    detailedErrorsHtml,

                detailed_errors_count:
                    detailedErrorsCount,

                excel_filename:
                    path.basename(excelFilename)

            });

        } catch (err) {

            safeDelete(filepath);

            console.error(
                'Processing error:',
                err
            );

            if (
                err.message &&
                err.message.includes('Missing column')
            ) {

                return res.status(400).json({
                    error: err.message
                });

            }

            return res.status(500).json({
                error:
                    `Processing error: ${err.message}`
            });

        }

    }
);

// ─────────────────────────────────────────────────────────────
// Download Excel
// ─────────────────────────────────────────────────────────────

app.get(
    '/download/:filename',
    (req, res) => {

        const filename =
            path.basename(req.params.filename);

        const filePath =
            path.join(
                UPLOAD_FOLDER,
                filename
            );

        if (!fs.existsSync(filePath)) {

            return res.status(404).json({
                error:
                    'Kindly refresh the URL & reupload the file.'
            });

        }

        res.download(filePath);

    }
);

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function safeDelete(filepath) {

    try {

        if (
            filepath &&
            fs.existsSync(filepath)
        ) {

            fs.unlinkSync(filepath);

        }

    } catch (err) {

        console.error(
            'Failed to delete file:',
            err.message
        );

    }

}

// ─────────────────────────────────────────────────────────────
// HTML Table
// ─────────────────────────────────────────────────────────────

function arrayToHtmlTable(rows) {

    if (
        !rows ||
        rows.length === 0
    ) {

        return '<table><tbody></tbody></table>';

    }

    const headers =
        Object.keys(rows[0]);

    let html =
        '<table border="1" class="dataframe">\n' +
        '<thead><tr>';

    html += headers
        .map(
            h =>
                `<th>${escapeHtml(h)}</th>`
        )
        .join('');

    html +=
        '</tr></thead>\n<tbody>\n';

    for (const row of rows) {

        html += '<tr>';

        html += headers
            .map(
                h =>
                    `<td>${escapeHtml(
                        String(row[h] ?? '')
                    )}</td>`
            )
            .join('');

        html += '</tr>\n';

    }

    html +=
        '</tbody>\n</table>';

    return html;

}

// ─────────────────────────────────────────────────────────────
// Summary Table
// ─────────────────────────────────────────────────────────────

function summaryToHtmlTable(resultDict) {

    const rows = [];

    for (
        const [key, df]
        of Object.entries(resultDict)
    ) {

        if (key === 'Error Summary') {
            continue;
        }

        const count =
            Array.isArray(df)
                ? df.length
                : 0;

        rows.push({

            'Sheet Name': key,

            'Error Count': count

        });

    }

    return arrayToHtmlTable(rows);

}

// ─────────────────────────────────────────────────────────────
// HTML escaping
// ─────────────────────────────────────────────────────────────

function escapeHtml(str) {

    return String(str)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        );

}

// ─────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────

app.get(
    '/health',
    (req, res) => {

        res.status(200).send('OK');

    }
);

// ─────────────────────────────────────────────────────────────
// Multer error handler
// ─────────────────────────────────────────────────────────────

app.use(
    (err, req, res, next) => {

        if (
            err instanceof multer.MulterError
        ) {

            if (
                err.code === 'LIMIT_FILE_SIZE'
            ) {

                return res.status(413).json({
                    error:
                        'File is too large. Maximum allowed size is 100 MB.'
                });

            }

            return res.status(400).json({
                error: err.message
            });

        }

        next(err);

    }
);

// ─────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────

app.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Node version: ${process.version}`
        );

        logMemory('Server startup');

    }
);