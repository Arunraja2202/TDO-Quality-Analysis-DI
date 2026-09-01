/**
 * src/excel.js
 *
 * Streaming Excel report generator
 *
 * Excel is generated ONLY when user clicks Download.
 */

'use strict';

const ExcelJS =
    require('exceljs');

const path =
    require('path');

const fs =
    require('fs');


// ============================================================
// CREATE EXCEL
// ============================================================

async function createExcel(
    resultDict,
    outputDir
) {

    // ========================================================
    // Ensure output folder exists
    // ========================================================

    if (
        !fs.existsSync(
            outputDir
        )
    ) {

        fs.mkdirSync(
            outputDir,
            {
                recursive: true
            }
        );

    }


    // ========================================================
    // Filename
    // ========================================================

    const now =
        new Date();


    const timestamp =
        now
            .toISOString()
            .replace(
                /T/,
                '_'
            )
            .replace(
                /:/g,
                ''
            )
            .replace(
                /\./g,
                ''
            )
            .replace(
                /Z/g,
                ''
            );


    const filename =
        `DI-Error-Report-${timestamp}.xlsx`;


    const filepath =
        path.join(
            outputDir,
            filename
        );


    // ========================================================
    // Streaming Workbook
    // ========================================================

    const workbook =
        new ExcelJS.stream.xlsx.WorkbookWriter({

            filename:
                filepath,

            useStyles:
                true,

            // Lower memory usage
            useSharedStrings:
                false

        });


    workbook.creator =
        'TDO Quality Analysis';


    workbook.created =
        now;


    // ========================================================
    // Styles
    // ========================================================

    const headerFont = {

        bold:
            true,

        color: {

            argb:
                'FFFFFFFF'

        }

    };


    const headerFill = {

        type:
            'pattern',

        pattern:
            'solid',

        fgColor: {

            argb:
                'FFFF0000'

        }

    };


    const headerAlignment = {

        horizontal:
            'center',

        vertical:
            'middle'

    };


    // ========================================================
    // ERROR SUMMARY
    // ========================================================

    const summarySheet =
        workbook.addWorksheet(
            'Error Summary'
        );


    summarySheet.columns = [

        {

            header:
                'Sheet Name',

            key:
                'sheet',

            width:
                40

        },

        {

            header:
                'Error Count',

            key:
                'count',

            width:
                20

        },

        {

            header:
                'Navigation',

            key:
                'nav',

            width:
                25

        }

    ];


    // ========================================================
    // Summary header
    // ========================================================

    const summaryHeader =
        summarySheet.getRow(
            1
        );


    summaryHeader.font =
        headerFont;


    summaryHeader.fill =
        headerFill;


    summaryHeader.alignment =
        headerAlignment;


    summaryHeader.commit();


    // ========================================================
    // Detail sheets
    // ========================================================

    for (
        const [
            sheetName,
            data
        ]
        of Object.entries(
            resultDict
        )
    ) {

        if (
            sheetName ===
            'Error Summary'
        ) {

            continue;

        }


        const safeSheetName =
            safeName(
                sheetName
            );


        const worksheet =
            workbook.addWorksheet(
                safeSheetName
            );


        const errorCount =
            Array.isArray(data)
                ? data.length
                : 0;


        // ====================================================
        // NO ERRORS
        // ====================================================

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            worksheet.columns = [

                {

                    header:
                        'Result',

                    key:
                        'result',

                    width:
                        25

                }

            ];


            const header =
                worksheet.getRow(
                    1
                );


            header.font =
                headerFont;


            header.fill =
                headerFill;


            header.alignment =
                headerAlignment;


            header.commit();


            worksheet
                .addRow({

                    result:
                        'No errors found'

                })
                .commit();

        }


        // ====================================================
        // ERRORS EXIST
        // ====================================================

        else {

            const headers =
                Object.keys(
                    data[0]
                );


            // =================================================
            // Determine practical column widths
            //
            // Only inspect first 100 rows.
            // This is much faster than scanning everything.
            // =================================================

            const sampleSize =
                Math.min(
                    data.length,
                    100
                );


            const widths =
                headers.map(

                    header =>
                        Math.max(
                            15,
                            String(header).length + 2
                        )

                );


            for (
                let rowIndex = 0;
                rowIndex < sampleSize;
                rowIndex++
            ) {

                const row =
                    data[rowIndex];


                for (
                    let columnIndex = 0;
                    columnIndex < headers.length;
                    columnIndex++
                ) {

                    const header =
                        headers[
                            columnIndex
                        ];


                    const value =
                        row[header];


                    if (
                        value === null ||
                        value === undefined
                    ) {

                        continue;

                    }


                    const length =
                        String(value)
                            .length + 2;


                    widths[
                        columnIndex
                    ] =
                        Math.min(

                            Math.max(

                                widths[
                                    columnIndex
                                ],

                                length

                            ),

                            50

                        );

                }

            }


            // =================================================
            // Columns
            // =================================================

            worksheet.columns =

                headers.map(

                    (
                        header,
                        index
                    ) => ({

                        header,

                        key:
                            header,

                        width:
                            widths[index]

                    })

                );


            // =================================================
            // Header styling
            // =================================================

            const header =
                worksheet.getRow(
                    1
                );


            header.font =
                headerFont;


            header.fill =
                headerFill;


            header.alignment =
                headerAlignment;


            header.commit();


            // =================================================
            // STREAM DATA ROWS
            // =================================================

            for (
                const row
                of data
            ) {

                worksheet
                    .addRow(
                        row
                    )
                    .commit();

            }

        }


        // ====================================================
        // SUMMARY ROW
        // ====================================================

        const summaryRow =
            summarySheet.addRow({

                sheet:
                    safeSheetName,

                count:
                    errorCount,

                nav:
                    'Open'

            });


        // ====================================================
        // HYPERLINK
        // ====================================================

        const hyperlinkCell =
            summaryRow.getCell(
                3
            );


        hyperlinkCell.value = {

            text:
                'Open',

            hyperlink:
                `#'${safeSheetName}'!A1`

        };


        hyperlinkCell.font = {

            color: {

                argb:
                    'FF0000FF'

            },

            underline:
                true

        };


        summaryRow.commit();


        // ====================================================
        // Commit worksheet
        // ====================================================

        worksheet.commit();

    }


    // ========================================================
    // Commit Summary
    // ========================================================

    summarySheet.commit();


    // ========================================================
    // Commit Workbook
    // ========================================================

    await workbook.commit();


    // ========================================================
    // Verify Excel
    // ========================================================

    if (
        !fs.existsSync(
            filepath
        )
    ) {

        throw new Error(
            'Excel file was not created.'
        );

    }


    const stat =
        fs.statSync(
            filepath
        );


    if (
        stat.size === 0
    ) {

        throw new Error(
            'Generated Excel file is empty.'
        );

    }


    console.log(

        `Excel ready: ${filepath} | ` +

        `${(
            stat.size /
            1024 /
            1024
        ).toFixed(2)} MB`

    );


    return filepath;

}


// ============================================================
// SAFE SHEET NAME
// ============================================================

function safeName(
    name
) {

    let safe =
        String(name)

            .replace(
                /[\\/?*[\]:]/g,
                '_'
            )

            .trim();


    if (!safe) {

        safe =
            'Sheet';

    }


    return safe.slice(
        0,
        31
    );

}


module.exports = {

    createExcel

};