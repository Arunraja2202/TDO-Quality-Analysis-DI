/**
 * TDO Quality Analysis - Node.js/Express Server
 *
 * New flow:
 *
 * POST /upload
 *      ↓
 * Parse CSV
 *      ↓
 * processCSV()
 *      ↓
 * Store resultDict temporarily in memory
 *      ↓
 * Return JSON + job_id + download_url
 *
 * GET /download/:jobId
 *      ↓
 * Get resultDict
 *      ↓
 * Generate Excel
 *      ↓
 * Send Excel immediately
 *      ↓
 * Delete temporary Excel
 *      ↓
 * Delete job
 */

'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const os = require('os');
const compression = require('compression');
const crypto = require('crypto');

const { processCSV } = require('./src/queries');
const { createExcel } = require('./src/excel');

const app = express();

app.use(compression());

const PORT =
    process.env.PORT || 8080;


// ============================================================
// TEMP FOLDER
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

            const originalName =
                path.basename(
                    file.originalname
                );

            cb(
                null,
                `${Date.now()}-${originalName}`
            );

        }

    });


const upload =
    multer({

        storage,

        limits: {

            // 100 MB
            fileSize:
                100 * 1024 * 1024

        }

    });


// ============================================================
// JOB STORAGE
// ============================================================
//
// Stores processed validation results.
//
// Excel is NOT generated during upload.
//
// jobId -> {
//     resultDict,
//     createdAt,
//     downloading
// }
//

const jobs =
    new Map();


// Job expiry:
//
// If user does not download within 30 minutes,
// remove the processed data from memory.

const JOB_TTL =
    30 * 60 * 1000;


// ============================================================
// PROCESSING LOCK
// ============================================================
//
// Only one large CSV processing operation at a time.
//

let processing =
    false;


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
            `Unable to delete ${filepath}:`,
            err.message
        );

    }

}


// ============================================================
// CREATE JOB ID
// ============================================================

function createJobId() {

    return crypto
        .randomBytes(16)
        .toString('hex');

}


// ============================================================
// CLEAN EXPIRED JOBS
// ============================================================

function cleanupExpiredJobs() {

    const now =
        Date.now();


    for (
        const [
            jobId,
            job
        ]
        of jobs.entries()
    ) {

        if (
            job.downloading
        ) {

            continue;

        }


        if (
            now - job.createdAt >
            JOB_TTL
        ) {

            jobs.delete(
                jobId
            );


            console.log(
                `Expired job removed: ${jobId}`
            );

        }

    }

}


// Run every 5 minutes

const jobCleanupTimer =
    setInterval(
        cleanupExpiredJobs,
        5 * 60 * 1000
    );

// Don't keep Node alive only for this timer.
jobCleanupTimer.unref();


// ============================================================
// CLEAN OLD TEMP FILES
// ============================================================

function cleanupOldTempFiles() {

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


        // Delete abandoned temp files
        // older than 30 minutes.

        const MAX_AGE =
            30 * 60 * 1000;


        for (
            const filename
            of files
        ) {

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


                if (
                    now - stat.mtimeMs >
                    MAX_AGE
                ) {

                    safeDelete(
                        filePath
                    );

                }

            } catch (err) {

                console.error(
                    `Temp cleanup error for ${filename}:`,
                    err.message
                );

            }

        }

    } catch (err) {

        console.error(
            'Temporary file cleanup error:',
            err.message
        );

    }

}


const fileCleanupTimer =
    setInterval(
        cleanupOldTempFiles,
        10 * 60 * 1000
    );

fileCleanupTimer.unref();


// ============================================================
// HOME
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
// UPLOAD
// ============================================================

app.post(
    '/upload',
    upload.single('file'),

    async (req, res) => {

        // ====================================================
        // Check upload
        // ====================================================

        if (!req.file) {

            return res
                .status(400)
                .json({

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


            return res
                .status(429)
                .json({

                    error:
                        'Another file is currently being processed. Please wait until it finishes and try again.'

                });

        }


        processing =
            true;


        try {

            console.log(
                '========================================'
            );

            console.log(
                'Starting CSV processing'
            );


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

                `CSV size: ${(
                    Buffer.byteLength(
                        csvText,
                        'utf8'
                    ) /
                    1024 /
                    1024
                ).toFixed(2)} MB`

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

                        header:
                            true,

                        skipEmptyLines:
                            true

                    }
                );


            if (
                parsed.errors &&
                parsed.errors.length > 0
            ) {

                console.warn(
                    `CSV parsing returned ${parsed.errors.length} warning/error(s)`
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
            // BUILD HTML
            // =================================================

            const detailedErrorsHtml =
                {};


            const detailedErrorsCount =
                {};


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
            // CREATE JOB
            // =================================================

            const jobId =
                createJobId();


            jobs.set(
                jobId,
                {

                    resultDict,

                    createdAt:
                        Date.now(),

                    downloading:
                        false

                }
            );


            console.log(
                `Job created: ${jobId}`
            );


            console.log(
                `Active jobs: ${jobs.size}`
            );


            // =================================================
            // DELETE ORIGINAL CSV
            // =================================================

            safeDelete(
                filepath
            );


            // =================================================
            // IMPORTANT
            //
            // NO EXCEL IS GENERATED HERE.
            // =================================================


            const downloadUrl =
                `/download/${jobId}`;


            logMemory(
                'Before JSON response'
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

                job_id:
                    jobId,

                download_url:
                    downloadUrl,

                excel_filename:
                    null

            });


        } catch (err) {

            console.error(
                'Processing error:',
                err
            );


            safeDelete(
                filepath
            );


            if (
                err.message &&
                err.message.includes(
                    'Missing column'
                )
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            err.message

                    });

            }


            return res
                .status(500)
                .json({

                    error:
                        `Processing error: ${err.message}`

                });


        } finally {

            processing =
                false;


            logMemory(
                'Upload request finished'
            );

        }

    }
);


// ============================================================
// DOWNLOAD EXCEL
// ============================================================
//
// User clicks Download.
//
// Only NOW do we generate the Excel file.
//
// resultDict
//     ↓
// Streaming Excel
//     ↓
// temporary XLSX
//     ↓
// res.download()
//     ↓
// delete XLSX
//     ↓
// delete job
//

app.get(
    '/download/:jobId',

    async (req, res) => {

        const jobId =
            String(
                req.params.jobId ||
                ''
            );


        console.log(
            '========================================'
        );

        console.log(
            `Download requested for job: ${jobId}`
        );


        // ====================================================
        // Validate ID
        // ====================================================

        if (
            !/^[a-f0-9]{32}$/i.test(
                jobId
            )
        ) {

            return res
                .status(400)
                .json({

                    error:
                        'Invalid download request.'

                });

        }


        // ====================================================
        // Find job
        // ====================================================

        const job =
            jobs.get(
                jobId
            );


        if (!job) {

            console.error(
                `Job not found: ${jobId}`
            );


            return res
                .status(404)
                .json({

                    error:
                        'The report is no longer available. Please upload the CSV again.'

                });

        }


        // ====================================================
        // Prevent duplicate download generation
        // ====================================================

        if (
            job.downloading
        ) {

            return res
                .status(409)
                .json({

                    error:
                        'The Excel report is already being generated. Please wait.'

                });

        }


        job.downloading =
            true;


        let excelFilepath =
            null;


        try {

            logMemory(
                'Before Excel generation'
            );


            // =================================================
            // GENERATE EXCEL
            // =================================================

            excelFilepath =
                await createExcel(
                    job.resultDict,
                    UPLOAD_FOLDER
                );


            console.log(
                `Excel generated: ${excelFilepath}`
            );


            logMemory(
                'After Excel generation'
            );


            // =================================================
            // VERIFY FILE
            // =================================================

            if (
                !fs.existsSync(
                    excelFilepath
                )
            ) {

                throw new Error(
                    'Excel file was not created.'
                );

            }


            const filename =
                path.basename(
                    excelFilepath
                );


            const stat =
                fs.statSync(
                    excelFilepath
                );


            console.log(

                `Sending Excel: ${filename} | ` +
                `${(
                    stat.size /
                    1024 /
                    1024
                ).toFixed(2)} MB`

            );


            // =================================================
            // SEND FILE
            // =================================================

            return res.download(

                excelFilepath,

                filename,

                err => {

                    if (err) {

                        console.error(
                            'Excel download error:',
                            err.message
                        );


                        // Allow retry if the HTTP download failed.
                        job.downloading =
                            false;


                        safeDelete(
                            excelFilepath
                        );


                        return;

                    }


                    console.log(
                        `Excel download completed: ${filename}`
                    );


                    // =========================================
                    // Delete temporary XLSX
                    // =========================================

                    safeDelete(
                        excelFilepath
                    );


                    // =========================================
                    // Delete processed job
                    //
                    // Report was downloaded successfully.
                    // =========================================

                    jobs.delete(
                        jobId
                    );


                    console.log(
                        `Job removed: ${jobId}`
                    );


                    console.log(
                        `Active jobs: ${jobs.size}`
                    );


                    logMemory(
                        'After Excel download cleanup'
                    );

                }

            );


        } catch (err) {

            console.error(
                'Excel generation error:',
                err
            );


            job.downloading =
                false;


            if (
                excelFilepath
            ) {

                safeDelete(
                    excelFilepath
                );

            }


            if (
                !res.headersSent
            ) {

                return res
                    .status(500)
                    .json({

                        error:
                            `Unable to generate Excel report: ${err.message}`

                    });

            }

        }

    }
);


// ============================================================
// HTML TABLE
// ============================================================

function arrayToHtmlTable(
    rows
) {

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

    const rows =
        [];


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


        rows.push({

            'Sheet Name':
                key,

            'Error Count':
                Array.isArray(df)
                    ? df.length
                    : 0

        });

    }


    return arrayToHtmlTable(
        rows
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    str
) {

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
// HEALTH CHECK
// ============================================================

app.get(
    '/health',

    (req, res) => {

        res
            .status(200)
            .send(
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

                return res
                    .status(413)
                    .json({

                        error:
                            'File is too large. Maximum allowed size is 100 MB.'

                    });

            }


            return res
                .status(400)
                .json({

                    error:
                        err.message

                });

        }


        next(
            err
        );

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