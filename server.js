// // /**
// //  * TDO Quality Analysis - Node.js/Express Server
// //  * Converted from Flask (Models_AR.py)
// //  *
// //  * Run:  npm install && npm start
// //  * Visit: http://localhost:8080
// //  */

// // const express = require('express');
// // const multer  = require('multer');
// // const path    = require('path');
// // const fs      = require('fs');
// // const XLSX    = require('xlsx');
// // const Papa    = require('papaparse');
// // const os = require('os');

// // const { processCSV } = require('./src/queries');
// // const { createExcel } = require('./src/excel');

// // const compression = require('compression');

// // const app = express();

// // app.use(compression());
// // const PORT = process.env.PORT || 8080;

// // // ── Folders ────────────────────────────────────────────────────────────────────
// // // ── Folders ─────────────────────────────────────────────────────


// // const UPLOAD_FOLDER = path.join(os.tmpdir(), 'uploads');

// // if (!fs.existsSync(UPLOAD_FOLDER)) {
// //     fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
// // }

// // // ── Static files ───────────────────────────────────────────────
// // app.use(
// //     '/static',
// //     express.static(
// //         path.join(__dirname,'public','static'),
// //         {
// //             maxAge:'7d',
// //             etag:true
// //         }
// //     )
// // );

// // // ── Multer upload ──────────────────────────────────────────────
// // const storage = multer.diskStorage({
// //     destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
// //     filename: (req, file, cb) =>
// //         cb(null, `${Date.now()}-${file.originalname}`)
// // });

// // const upload = multer({ storage });

// // // ── Routes ─────────────────────────────────────────────────────────────────────

// // // GET /  →  serve index.html
// // app.get('/', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// // });

// // // POST /upload  →  process CSV, return JSON (same contract as Flask)
// // app.post('/upload', upload.single('file'), async (req, res) => {
// //   if (!req.file) {
// //     return res.status(400).json({ error: 'No file provided' });
// //   }

// //   const filepath = req.file.path;

// //   try {
// //     // Read & parse CSV
// //     const csvText = fs.readFileSync(filepath, 'utf-8');
// //     const parsed  = Papa.parse(csvText, { header: true, skipEmptyLines: true });
// //     const rows    = parsed.data; // array of objects keyed by column header

// //     // Run all validation queries (Python logic → JS)
// //     const resultDict = processCSV(rows);

// //     // Build Excel report
// //     const excelFilename = await createExcel(resultDict, UPLOAD_FOLDER);

// //     // Build response payload (mirrors Flask JSON response exactly)
// //     const detailedErrorsHtml  = {};
// //     const detailedErrorsCount = {};

// //     for (const [key, df] of Object.entries(resultDict)) {
// //       if (key === 'Error Summary') continue;
// //       if (Array.isArray(df) && df.length > 0) {
// //         detailedErrorsHtml[key]  = arrayToHtmlTable(df);
// //         detailedErrorsCount[key] = df.length;
// //       }
// //     }

// //     const summaryHtml = summaryToHtmlTable(resultDict);

// //     // Clean up uploaded file
// //     fs.unlinkSync(filepath);

// //     return res.json({
// //       table_html:            summaryHtml,
// //       detailed_errors_html:  detailedErrorsHtml,
// //       detailed_errors_count: detailedErrorsCount,
// //       excel_filename:        path.basename(excelFilename),
// //     });

// //   } catch (err) {
// //     if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
// //     console.error(err);

// //     if (err.message && err.message.includes('Missing column')) {
// //       return res.status(400).json({ error: err.message });
// //     }
// //     return res.status(500).json({ error: `Processing error: ${err.message}` });
// //   }
// // });

// // // GET /download/:filename  →  serve the generated Excel file
// // app.get('/download/:filename', (req, res) => {
// //   const filePath = path.join(UPLOAD_FOLDER, req.params.filename);
// //   if (!fs.existsSync(filePath)) {
// //     return res.status(404).json({ error: 'Kindly refresh the URL & reupload the file.' });
// //   }
// //   res.download(filePath);
// // });

// // // ── Helpers ───────────────────────────────────────────────────────────────────

// // /**
// //  * Convert an array of row-objects to an HTML <table> string.
// //  * Mirrors pandas DataFrame.to_html(index=False).
// //  */
// // function arrayToHtmlTable(rows) {
// //   if (!rows || rows.length === 0) return '<table><tbody></tbody></table>';
// //   const headers = Object.keys(rows[0]);
// //   let html = '<table border="1" class="dataframe">\n<thead><tr>';
// //   html += headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
// //   html += '</tr></thead>\n<tbody>\n';
// //   for (const row of rows) {
// //     html += '<tr>';
// //     html += headers.map(h => `<td>${escapeHtml(String(row[h] ?? ''))}</td>`).join('');
// //     html += '</tr>\n';
// //   }
// //   html += '</tbody>\n</table>';
// //   return html;
// // }

// // /**
// //  * Build the Error Summary HTML table from resultDict.
// //  */
// // function summaryToHtmlTable(resultDict) {
// //   const rows = [];
// //   for (const [key, df] of Object.entries(resultDict)) {
// //     if (key === 'Error Summary') continue;
// //     const count = Array.isArray(df) ? df.length : 0;
// //     rows.push({ 'Sheet Name': key, 'Error Count': count });
// //   }
// //   return arrayToHtmlTable(rows);
// // }

// // function escapeHtml(str) {
// //   return str
// //     .replace(/&/g, '&amp;')
// //     .replace(/</g, '&lt;')
// //     .replace(/>/g, '&gt;')
// //     .replace(/"/g, '&quot;');
// // }

// // app.get('/health', (req,res)=>{

// //     res.status(200).send('OK');

// // });
// // // ─// ── Start ─────────────────────────────────────────────────────────────────────
// // app.get('/health', (req,res)=>{
// //     res.send('OK');
// // });

// // app.listen(PORT,'0.0.0.0',()=>{

// //     console.log(
// //         `Server running on port ${PORT}`
// //     );

// // });
// /**
//  * TDO Quality Analysis - Node.js/Express Server
//  *
//  * Run:
//  *   npm install
//  *   npm start
//  *
//  * Visit:
//  *   http://localhost:8080
//  */

// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const Papa = require('papaparse');
// const os = require('os');
// const compression = require('compression');

// const { processCSV } = require('./src/queries');
// const { createExcel } = require('./src/excel');

// const app = express();

// app.use(compression());

// const PORT = process.env.PORT || 8080;

// // ─────────────────────────────────────────────────────────────
// // Folders
// // ─────────────────────────────────────────────────────────────

// const UPLOAD_FOLDER = path.join(os.tmpdir(), 'uploads');

// if (!fs.existsSync(UPLOAD_FOLDER)) {
//     fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
// }

// // ─────────────────────────────────────────────────────────────
// // Static files
// // ─────────────────────────────────────────────────────────────

// app.use(
//     '/static',
//     express.static(
//         path.join(__dirname, 'public', 'static'),
//         {
//             maxAge: '7d',
//             etag: true
//         }
//     )
// );

// // ─────────────────────────────────────────────────────────────
// // Multer upload
// // ─────────────────────────────────────────────────────────────

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, UPLOAD_FOLDER);
//     },

//     filename: (req, file, cb) => {
//         const safeName = path.basename(file.originalname);

//         cb(
//             null,
//             `${Date.now()}-${safeName}`
//         );
//     }
// });

// // Limit upload size.
// // Adjust if your files are larger.
// const upload = multer({
//     storage,

//     limits: {
//         fileSize: 100 * 1024 * 1024 // 100 MB
//     }
// });

// // ─────────────────────────────────────────────────────────────
// // GET /
// // ─────────────────────────────────────────────────────────────

// app.get('/', (req, res) => {

//     res.sendFile(
//         path.join(__dirname, 'public', 'index.html')
//     );

// });

// // ─────────────────────────────────────────────────────────────
// // Memory logger
// // ─────────────────────────────────────────────────────────────

// function logMemory(label) {

//     const memory = process.memoryUsage();

//     console.log(
//         `[MEMORY] ${label} | ` +
//         `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB | ` +
//         `Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB | ` +
//         `Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB | ` +
//         `External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`
//     );

// }

// // ─────────────────────────────────────────────────────────────
// // POST /upload
// // ─────────────────────────────────────────────────────────────

// app.post(
//     '/upload',
//     upload.single('file'),

//     async (req, res) => {

//         if (!req.file) {

//             return res.status(400).json({
//                 error: 'No file provided'
//             });

//         }

//         const filepath = req.file.path;

//         logMemory('Upload received');

//         try {

//             // ─────────────────────────────────────────────
//             // Read CSV
//             // ─────────────────────────────────────────────

//             const csvText = fs.readFileSync(
//                 filepath,
//                 'utf-8'
//             );

//             console.log(
//                 `CSV size: ${(Buffer.byteLength(csvText, 'utf8') / 1024 / 1024).toFixed(2)} MB`
//             );

//             logMemory('After reading CSV');

//             // ─────────────────────────────────────────────
//             // Parse CSV
//             // ─────────────────────────────────────────────

//             const parsed = Papa.parse(
//                 csvText,
//                 {
//                     header: true,
//                     skipEmptyLines: true
//                 }
//             );

//             if (parsed.errors && parsed.errors.length > 0) {

//                 console.warn(
//                     `CSV parsing returned ${parsed.errors.length} errors`
//                 );

//             }

//             const rows = parsed.data;

//             console.log(
//                 `CSV rows: ${rows.length}`
//             );

//             logMemory('After CSV parsing');

//             // The CSV string is no longer needed.
//             // This removes our reference to it.
//             //
//             // NOTE:
//             // JavaScript may not immediately release the memory.
//             //
//             // We intentionally do not keep `parsed`.

//             // ─────────────────────────────────────────────
//             // Process validation
//             // ─────────────────────────────────────────────

//             const resultDict = processCSV(rows);

//             console.log(
//                 'Validation completed'
//             );

//             logMemory('After processCSV');

//             // `rows` is no longer needed after processCSV.
//             // Setting it to null helps garbage collection
//             // when processing large files.
//             //
//             // We declared it with const above, so instead
//             // we rely on scope ending after this request.
//             //
//             // The resultDict is now the main object.

//             // ─────────────────────────────────────────────
//             // Create Excel
//             // ─────────────────────────────────────────────

//             const excelFilename = await createExcel(
//                 resultDict,
//                 UPLOAD_FOLDER
//             );

//             console.log(
//                 `Excel created: ${excelFilename}`
//             );

//             logMemory('After createExcel');

//             // ─────────────────────────────────────────────
//             // Build response
//             // ─────────────────────────────────────────────

//             const detailedErrorsHtml = {};
//             const detailedErrorsCount = {};

//             for (
//                 const [key, df]
//                 of Object.entries(resultDict)
//             ) {

//                 if (key === 'Error Summary') {
//                     continue;
//                 }

//                 if (
//                     Array.isArray(df) &&
//                     df.length > 0
//                 ) {

//                     console.log(
//                         `Building HTML for ${key}: ${df.length} rows`
//                     );

//                     detailedErrorsHtml[key] =
//                         arrayToHtmlTable(df);

//                     detailedErrorsCount[key] =
//                         df.length;
//                 }

//             }

//             logMemory(
//                 'After building detailed HTML'
//             );

//             // ─────────────────────────────────────────────
//             // Summary
//             // ─────────────────────────────────────────────

//             const summaryHtml =
//                 summaryToHtmlTable(resultDict);

//             // ─────────────────────────────────────────────
//             // Remove uploaded CSV
//             // ─────────────────────────────────────────────

//             safeDelete(filepath);

//             logMemory('Before response');

//             // ─────────────────────────────────────────────
//             // Response
//             // ─────────────────────────────────────────────

//             return res.json({

//                 table_html: summaryHtml,

//                 detailed_errors_html:
//                     detailedErrorsHtml,

//                 detailed_errors_count:
//                     detailedErrorsCount,

//                 excel_filename:
//                     path.basename(excelFilename)

//             });

//         } catch (err) {

//             safeDelete(filepath);

//             console.error(
//                 'Processing error:',
//                 err
//             );

//             if (
//                 err.message &&
//                 err.message.includes('Missing column')
//             ) {

//                 return res.status(400).json({
//                     error: err.message
//                 });

//             }

//             return res.status(500).json({
//                 error:
//                     `Processing error: ${err.message}`
//             });

//         }

//     }
// );

// // ─────────────────────────────────────────────────────────────
// // Download Excel
// // ─────────────────────────────────────────────────────────────

// app.get(
//     '/download/:filename',
//     (req, res) => {

//         const filename =
//             path.basename(req.params.filename);

//         const filePath =
//             path.join(
//                 UPLOAD_FOLDER,
//                 filename
//             );

//         if (!fs.existsSync(filePath)) {

//             return res.status(404).json({
//                 error:
//                     'Kindly refresh the URL & reupload the file.'
//             });

//         }

//         res.download(filePath);

//     }
// );

// // ─────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────

// function safeDelete(filepath) {

//     try {

//         if (
//             filepath &&
//             fs.existsSync(filepath)
//         ) {

//             fs.unlinkSync(filepath);

//         }

//     } catch (err) {

//         console.error(
//             'Failed to delete file:',
//             err.message
//         );

//     }

// }

// // ─────────────────────────────────────────────────────────────
// // HTML Table
// // ─────────────────────────────────────────────────────────────

// function arrayToHtmlTable(rows) {

//     if (
//         !rows ||
//         rows.length === 0
//     ) {

//         return '<table><tbody></tbody></table>';

//     }

//     const headers =
//         Object.keys(rows[0]);

//     let html =
//         '<table border="1" class="dataframe">\n' +
//         '<thead><tr>';

//     html += headers
//         .map(
//             h =>
//                 `<th>${escapeHtml(h)}</th>`
//         )
//         .join('');

//     html +=
//         '</tr></thead>\n<tbody>\n';

//     for (const row of rows) {

//         html += '<tr>';

//         html += headers
//             .map(
//                 h =>
//                     `<td>${escapeHtml(
//                         String(row[h] ?? '')
//                     )}</td>`
//             )
//             .join('');

//         html += '</tr>\n';

//     }

//     html +=
//         '</tbody>\n</table>';

//     return html;

// }

// // ─────────────────────────────────────────────────────────────
// // Summary Table
// // ─────────────────────────────────────────────────────────────

// function summaryToHtmlTable(resultDict) {

//     const rows = [];

//     for (
//         const [key, df]
//         of Object.entries(resultDict)
//     ) {

//         if (key === 'Error Summary') {
//             continue;
//         }

//         const count =
//             Array.isArray(df)
//                 ? df.length
//                 : 0;

//         rows.push({

//             'Sheet Name': key,

//             'Error Count': count

//         });

//     }

//     return arrayToHtmlTable(rows);

// }

// // ─────────────────────────────────────────────────────────────
// // HTML escaping
// // ─────────────────────────────────────────────────────────────

// function escapeHtml(str) {

//     return String(str)

//         .replace(
//             /&/g,
//             '&amp;'
//         )

//         .replace(
//             /</g,
//             '&lt;'
//         )

//         .replace(
//             />/g,
//             '&gt;'
//         )

//         .replace(
//             /"/g,
//             '&quot;'
//         );

// }

// // ─────────────────────────────────────────────────────────────
// // Health check
// // ─────────────────────────────────────────────────────────────

// app.get(
//     '/health',
//     (req, res) => {

//         res.status(200).send('OK');

//     }
// );

// // ─────────────────────────────────────────────────────────────
// // Multer error handler
// // ─────────────────────────────────────────────────────────────

// app.use(
//     (err, req, res, next) => {

//         if (
//             err instanceof multer.MulterError
//         ) {

//             if (
//                 err.code === 'LIMIT_FILE_SIZE'
//             ) {

//                 return res.status(413).json({
//                     error:
//                         'File is too large. Maximum allowed size is 100 MB.'
//                 });

//             }

//             return res.status(400).json({
//                 error: err.message
//             });

//         }

//         next(err);

//     }
// );

// // ─────────────────────────────────────────────────────────────
// // Start
// // ─────────────────────────────────────────────────────────────

// app.listen(
//     PORT,
//     '0.0.0.0',
//     () => {

//         console.log(
//             `Server running on port ${PORT}`
//         );

//         console.log(
//             `Node version: ${process.version}`
//         );

//         logMemory('Server startup');

//     }
// );

/**
 * TDO Quality Analysis - Node.js/Express Server
 *
 * Optimized version:
 * - Large CSV support
 * - Memory monitoring
 * - Single processing job at a time
 * - Temporary Excel download
 * - Excel deleted after download
 * - Automatic cleanup of old Excel files
 * - Safe download filenames
 * - Multer upload limit
 *
 * Run:
 *   npm install
 *   npm start
 *
 * Visit:
 *   http://localhost:8080
 */

'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const os = require('os');
const compression = require('compression');

const { processCSV } = require('./src/queries');
const { createExcel } = require('./src/excel');


// ============================================================
// APP
// ============================================================

const app = express();

app.use(compression());

const PORT =
    process.env.PORT || 8080;


// ============================================================
// FOLDERS
// ============================================================

const UPLOAD_FOLDER =
    path.join(
        os.tmpdir(),
        'uploads'
    );

if (!fs.existsSync(UPLOAD_FOLDER)) {

    fs.mkdirSync(
        UPLOAD_FOLDER,
        {
            recursive: true
        }
    );

}


// ============================================================
// STATIC FILES
// ============================================================

app.use(
    '/static',
    express.static(
        path.join(
            __dirname,
            'public',
            'static'
        ),
        {
            maxAge: '7d',
            etag: true
        }
    )
);


// ============================================================
// MULTER
// ============================================================

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                UPLOAD_FOLDER
            );

        },

        filename: (
            req,
            file,
            cb
        ) => {

            const safeName =
                path.basename(
                    file.originalname
                );

            cb(
                null,
                `${Date.now()}-${safeName}`
            );

        }

    });


const upload =
    multer({

        storage,

        limits: {

            // Maximum CSV upload size
            fileSize:
                100 * 1024 * 1024

        }

    });


// ============================================================
// PROCESSING LOCK
// ============================================================
//
// Prevent multiple large files from being processed
// simultaneously and consuming all Render memory.
//

let processing = false;


// ============================================================
// MEMORY LOGGER
// ============================================================

function logMemory(label) {

    const memory =
        process.memoryUsage();

    console.log(
        `[MEMORY] ${label} | ` +
        `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB | ` +
        `Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB | ` +
        `Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB | ` +
        `External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`
    );

}


// ============================================================
// SAFE DELETE
// ============================================================

function safeDelete(filepath) {

    try {

        if (
            filepath &&
            fs.existsSync(filepath)
        ) {

            fs.unlinkSync(
                filepath
            );

            console.log(
                `Deleted temporary file: ${filepath}`
            );

        }

    } catch (err) {

        console.error(
            `Failed to delete file: ${filepath}`,
            err.message
        );

    }

}


// ============================================================
// CLEAN OLD EXCEL FILES
// ============================================================
//
// Excel files older than 30 minutes are deleted.
//

function cleanupOldExcelFiles() {

    try {

        if (
            !fs.existsSync(
                UPLOAD_FOLDER
            )
        ) {

            return;

        }

        const files =
            fs.readdirSync(
                UPLOAD_FOLDER
            );

        const now =
            Date.now();

        const MAX_AGE =
            30 * 60 * 1000;

        for (
            const filename
            of files
        ) {

            if (
                !filename
                    .toLowerCase()
                    .endsWith('.xlsx')
            ) {

                continue;

            }

            const filePath =
                path.join(
                    UPLOAD_FOLDER,
                    filename
                );

            try {

                const stat =
                    fs.statSync(
                        filePath
                    );

                const age =
                    now -
                    stat.mtimeMs;

                if (
                    age >
                    MAX_AGE
                ) {

                    safeDelete(
                        filePath
                    );

                }

            } catch (err) {

                console.error(
                    `Cleanup error for ${filename}:`,
                    err.message
                );

            }

        }

    } catch (err) {

        console.error(
            'Excel cleanup error:',
            err.message
        );

    }

}


// Run cleanup every 10 minutes
setInterval(
    cleanupOldExcelFiles,
    10 * 60 * 1000
);

// Initial cleanup
cleanupOldExcelFiles();


// ============================================================
// GET /
// ============================================================

app.get(
    '/',
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                'public',
                'index.html'
            )
        );

    }
);


// ============================================================
// POST /upload
// ============================================================

app.post(
    '/upload',
    upload.single('file'),

    async (req, res) => {

        if (!req.file) {

            return res.status(400).json({

                error:
                    'No file provided'

            });

        }

        const filepath =
            req.file.path;


        // ====================================================
        // Prevent concurrent processing
        // ====================================================

        if (processing) {

            safeDelete(
                filepath
            );

            return res.status(429).json({

                error:
                    'Another file is currently being processed. Please wait until it finishes and try again.'

            });

        }


        processing = true;


        try {

            logMemory(
                'Upload received'
            );


            // =================================================
            // READ CSV
            // =================================================

            const csvText =
                fs.readFileSync(
                    filepath,
                    'utf8'
                );

            console.log(
                `CSV size: ${(Buffer.byteLength(csvText, 'utf8') / 1024 / 1024).toFixed(2)} MB`
            );


            logMemory(
                'After reading CSV'
            );


            // =================================================
            // PARSE CSV
            // =================================================

            const parsed =
                Papa.parse(
                    csvText,
                    {
                        header: true,
                        skipEmptyLines: true
                    }
                );


            if (
                parsed.errors &&
                parsed.errors.length > 0
            ) {

                console.warn(
                    `CSV parsing returned ${parsed.errors.length} errors`
                );

            }


            const rows =
                parsed.data;


            console.log(
                `CSV rows: ${rows.length}`
            );


            logMemory(
                'After CSV parsing'
            );


            // =================================================
            // VALIDATION
            // =================================================

            const resultDict =
                processCSV(
                    rows
                );


            console.log(
                'Validation completed'
            );


            logMemory(
                'After processCSV'
            );


            // =================================================
            // CREATE EXCEL
            // =================================================

            const excelFilename =
                await createExcel(
                    resultDict,
                    UPLOAD_FOLDER
                );


            console.log(
                `Excel created: ${excelFilename}`
            );


            logMemory(
                'After createExcel'
            );


            // =================================================
            // BUILD HTML
            // =================================================

            const detailedErrorsHtml = {};

            const detailedErrorsCount = {};


            for (
                const [
                    key,
                    df
                ]
                of Object.entries(
                    resultDict
                )
            ) {

                if (
                    key ===
                    'Error Summary'
                ) {

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
                        arrayToHtmlTable(
                            df
                        );


                    detailedErrorsCount[key] =
                        df.length;

                }

            }


            logMemory(
                'After building detailed HTML'
            );


            // =================================================
            // SUMMARY
            // =================================================

            const summaryHtml =
                summaryToHtmlTable(
                    resultDict
                );


            // =================================================
            // DELETE ORIGINAL CSV
            // =================================================

            safeDelete(
                filepath
            );


            // =================================================
            // EXCEL IS NOT DELETED
            //
            // It must remain available for /download
            // =================================================


            const excelBasename =
                path.basename(
                    excelFilename
                );


            const downloadUrl =
                `/download/${encodeURIComponent(
                    excelBasename
                )}`;


            logMemory(
                'Before response'
            );


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                table_html:
                    summaryHtml,

                detailed_errors_html:
                    detailedErrorsHtml,

                detailed_errors_count:
                    detailedErrorsCount,

                excel_filename:
                    excelBasename,

                download_url:
                    downloadUrl

            });


        } catch (err) {

            console.error(
                'Processing error:',
                err
            );


            // Delete uploaded CSV
            safeDelete(
                filepath
            );


            if (
                err.message &&
                err.message.includes(
                    'Missing column'
                )
            ) {

                return res.status(400).json({

                    error:
                        err.message

                });

            }


            return res.status(500).json({

                error:
                    `Processing error: ${err.message}`

            });


        } finally {

            // =================================================
            // RELEASE PROCESSING LOCK
            // =================================================

            processing = false;

            logMemory(
                'Request finished'
            );

        }

    }
);


// ============================================================
// DOWNLOAD EXCEL
// ============================================================

app.get(
    '/download/:filename',

    (req, res) => {

        try {

            // =================================================
            // Secure filename
            // =================================================

            const filename =
                path.basename(
                    decodeURIComponent(
                        req.params.filename
                    )
                );


            // Only allow XLSX files
            if (
                !filename
                    .toLowerCase()
                    .endsWith('.xlsx')
            ) {

                return res.status(400).json({

                    error:
                        'Invalid Excel filename.'

                });

            }


            const filePath =
                path.join(
                    UPLOAD_FOLDER,
                    filename
                );


            console.log(
                `Download requested: ${filePath}`
            );


            // =================================================
            // Check file
            // =================================================

            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                console.error(
                    `Excel file not found: ${filePath}`
                );


                return res.status(404).json({

                    error:
                        'Excel report is no longer available. Please upload the CSV again.'

                });

            }


            // =================================================
            // File information
            // =================================================

            const stat =
                fs.statSync(
                    filePath
                );


            console.log(
                `Sending Excel: ${filename} ` +
                `(${(stat.size / 1024 / 1024).toFixed(2)} MB)`
            );


            // =================================================
            // Download
            // =================================================

            res.download(
                filePath,
                filename,

                (err) => {

                    if (err) {

                        console.error(
                            `Download error for ${filename}:`,
                            err.message
                        );

                        return;

                    }


                    console.log(
                        `Download completed: ${filename}`
                    );


                    // =================================================
                    // Delete after successful download
                    // =================================================

                    setTimeout(
                        () => {

                            safeDelete(
                                filePath
                            );

                        },
                        5000
                    );

                }
            );


        } catch (err) {

            console.error(
                'Download route error:',
                err
            );


            if (
                !res.headersSent
            ) {

                return res.status(500).json({

                    error:
                        'Unable to download the Excel report.'

                });

            }

        }

    }
);


// ============================================================
// HTML TABLE
// ============================================================

function arrayToHtmlTable(rows) {

    if (
        !rows ||
        rows.length === 0
    ) {

        return (
            '<table>' +
            '<tbody></tbody>' +
            '</table>'
        );

    }


    const headers =
        Object.keys(
            rows[0]
        );


    let html =
        '<table border="1" class="dataframe">\n' +
        '<thead><tr>';


    html +=
        headers
            .map(
                h =>
                    `<th>${escapeHtml(h)}</th>`
            )
            .join('');


    html +=
        '</tr></thead>\n' +
        '<tbody>\n';


    for (
        const row
        of rows
    ) {

        html +=
            '<tr>';


        html +=
            headers
                .map(
                    h =>
                        `<td>${escapeHtml(
                            String(
                                row[h] ?? ''
                            )
                        )}</td>`
                )
                .join('');


        html +=
            '</tr>\n';

    }


    html +=
        '</tbody>\n' +
        '</table>';


    return html;

}


// ============================================================
// SUMMARY TABLE
// ============================================================

function summaryToHtmlTable(
    resultDict
) {

    const rows = [];


    for (
        const [
            key,
            df
        ]
        of Object.entries(
            resultDict
        )
    ) {

        if (
            key ===
            'Error Summary'
        ) {

            continue;

        }


        const count =
            Array.isArray(df)
                ? df.length
                : 0;


        rows.push({

            'Sheet Name':
                key,

            'Error Count':
                count

        });

    }


    return arrayToHtmlTable(
        rows
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

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
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


// ============================================================
// HEALTH
// ============================================================

app.get(
    '/health',
    (req, res) => {

        res.status(200).send(
            'OK'
        );

    }
);


// ============================================================
// MULTER ERROR HANDLER
// ============================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        if (
            err instanceof
            multer.MulterError
        ) {

            if (
                err.code ===
                'LIMIT_FILE_SIZE'
            ) {

                return res.status(413).json({

                    error:
                        'File is too large. Maximum allowed size is 100 MB.'

                });

            }


            return res.status(400).json({

                error:
                    err.message

            });

        }


        console.error(
            'Unhandled error:',
            err
        );


        next(err);

    }
);


// ============================================================
// START SERVER
// ============================================================

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

        console.log(
            `Upload folder: ${UPLOAD_FOLDER}`
        );

        logMemory(
            'Server startup'
        );

    }
);