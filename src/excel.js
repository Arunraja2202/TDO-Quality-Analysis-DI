// // /**
// //  * src/excel.js
// //  *
// //  * Generates Excel report with:
// //  * - Error Summary sheet
// //  * - Hyperlinks to each sheet
// //  * - Header styling
// //  * - Auto column sizing
// //  */

// // 'use strict';

// // const ExcelJS = require('exceljs');
// // const path = require('path');

// // /**
// //  * @param {Object} resultDict
// //  * @param {string} outputDir
// //  * @returns {Promise<string>}
// //  */
// // async function createExcel(resultDict, outputDir) {

// //     const timestamp = new Date()
// //         .toISOString()
// //         .replace(/T/, '_')
// //         .replace(/:/g, '')
// //         .slice(0,17);

// //     const filename =
// //         `DI-Error-Report-${timestamp}.xlsx`;

// //     const filepath =
// //         path.join(outputDir, filename);

// //     const workbook =
// //         new ExcelJS.Workbook();

// //     workbook.creator = 'TDO Quality Analysis';

// //     // ======================================================
// //     // Create Summary Sheet
// //     // ======================================================

// //     const summarySheet =
// //         workbook.addWorksheet('Error Summary');

// //     summarySheet.columns = [
// //         {
// //             header:'Sheet Name',
// //             key:'sheet',
// //             width:40
// //         },
// //         {
// //             header:'Error Count',
// //             key:'count',
// //             width:20
// //         },
// //         {
// //             header:'Navigation',
// //             key:'nav',
// //             width:25
// //         }
// //     ];

// //     // Header style
// //     summarySheet.getRow(1).font = {
// //         bold:true,
// //         color:{argb:'FFFFFF'}
// //     };

// //     summarySheet.getRow(1).fill = {
// //         type:'pattern',
// //         pattern:'solid',
// //         fgColor:{argb:'FF0000'}
// //     };

// //     summarySheet.getRow(1).alignment = {
// //         horizontal:'center'
// //     };

// //     let summaryRowNo=2;

// //     // ======================================================
// //     // Detail sheets
// //     // ======================================================

// //     for(const [sheetName,data]
// //         of Object.entries(resultDict)) {

// //         if(sheetName==='Error Summary')
// //             continue;

// //         const safeSheetName =
// //             safeName(sheetName);

// //         const ws =
// //             workbook.addWorksheet(
// //                 safeSheetName
// //             );

// //         // No data
// //         if(
// //             !Array.isArray(data)
// //             || data.length===0
// //         ){

// //             ws.addRow(['No errors found']);

// //         } else {

// //             const headers =
// //                 Object.keys(data[0]);

// //             ws.columns =
// //                 headers.map(h=>({
// //                     header:h,
// //                     key:h,
// //                     width:25
// //                 }));

// //             data.forEach(row=>{
// //                 ws.addRow(row);
// //             });

// //             // Header style
// //             ws.getRow(1).font={
// //                 bold:true,
// //                 color:{argb:'FFFFFF'}
// //             };

// //             ws.getRow(1).fill={
// //                 type:'pattern',
// //                 pattern:'solid',
// //                 fgColor:{argb:'FF0000'}
// //             };

// //             ws.getRow(1).alignment={
// //                 horizontal:'center'
// //             };

// //             // Auto width
// //             ws.columns.forEach(column=>{

// //                 let maxLength=15;

// //                 column.eachCell(
// //                     {includeEmpty:true},
// //                     cell=>{

// //                     const length=
// //                     cell.value
// //                     ? cell.value
// //                         .toString()
// //                         .length
// //                     : 10;

// //                     if(length>maxLength)
// //                         maxLength=length;

// //                 });

// //                 column.width =
// //                     Math.min(
// //                         maxLength+2,
// //                         50
// //                     );

// //             });
// //         }

// //         // ========================================
// //         // Summary row
// //         // ========================================

// //         const errorCount =
// //             Array.isArray(data)
// //             ? data.length
// //             : 0;

// //         summarySheet.addRow({
// //             sheet:safeSheetName,
// //             count:errorCount,
// //             nav:'Open Sheet'
// //         });

// //         // Hyperlink
// //         const hyperlinkCell =
// //             summarySheet.getCell(
// //                 `C${summaryRowNo}`
// //             );

// //         hyperlinkCell.value = {
// //             text:'Open',
// //             hyperlink:
// //             `#'${safeSheetName}'!A1`
// //         };

// //         hyperlinkCell.font = {
// //             color:{argb:'0000FF'},
// //             underline:true
// //         };

// //         summaryRowNo++;
// //     }

// //     // Auto width summary columns
// //     summarySheet.columns.forEach(
// //         column=>{

// //         let maxLength=15;

// //         column.eachCell(
// //             {includeEmpty:true},
// //             cell=>{

// //             const length=
// //             cell.value
// //             ? cell.value
// //                 .toString()
// //                 .length
// //             : 10;

// //             if(length>maxLength)
// //                 maxLength=length;

// //         });

// //         column.width=
// //             Math.min(
// //                 maxLength+2,
// //                 40
// //             );

// //     });

// //     await workbook.xlsx.writeFile(
// //         filepath
// //     );

// //     return filepath;
// // }

// // /**
// //  * Safe Excel sheet name
// //  */
// // function safeName(name){

// //     return name
// //         .replace(/[\\/?*[\]:]/g,'_')
// //         .slice(0,31);
// // }

// // module.exports = {
// //     createExcel
// // };
// /**
//  * src/excel.js
//  *
//  * Optimized Excel report generator
//  *
//  * - Error Summary sheet
//  * - Hyperlinks to detail sheets
//  * - Header styling
//  * - Faster column width calculation
//  * - Avoids scanning ExcelJS cells after insertion
//  */

// 'use strict';

// const ExcelJS = require('exceljs');
// const path = require('path');

// async function createExcel(resultDict, outputDir) {

//     const timestamp = new Date()
//         .toISOString()
//         .replace(/T/, '_')
//         .replace(/:/g, '')
//         .slice(0, 17);

//     const filename =
//         `DI-Error-Report-${timestamp}.xlsx`;

//     const filepath =
//         path.join(outputDir, filename);

//     const workbook =
//         new ExcelJS.Workbook();

//     workbook.creator =
//         'TDO Quality Analysis';

//     workbook.created =
//         new Date();

//     // =========================================================
//     // Common header style
//     // =========================================================

//     const headerFont = {
//         bold: true,
//         color: {
//             argb: 'FFFFFF'
//         }
//     };

//     const headerFill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: {
//             argb: 'FF0000'
//         }
//     };

//     const headerAlignment = {
//         horizontal: 'center'
//     };

//     // =========================================================
//     // Summary Sheet
//     // =========================================================

//     const summarySheet =
//         workbook.addWorksheet('Error Summary');

//     summarySheet.columns = [
//         {
//             header: 'Sheet Name',
//             key: 'sheet',
//             width: 40
//         },
//         {
//             header: 'Error Count',
//             key: 'count',
//             width: 20
//         },
//         {
//             header: 'Navigation',
//             key: 'nav',
//             width: 25
//         }
//     ];

//     const summaryHeader =
//         summarySheet.getRow(1);

//     summaryHeader.font =
//         headerFont;

//     summaryHeader.fill =
//         headerFill;

//     summaryHeader.alignment =
//         headerAlignment;

//     // =========================================================
//     // Detail Sheets
//     // =========================================================

//     let summaryRowNo = 2;

//     for (
//         const [sheetName, data]
//         of Object.entries(resultDict)
//     ) {

//         if (sheetName === 'Error Summary') {
//             continue;
//         }

//         const safeSheetName =
//             safeName(sheetName);

//         const ws =
//             workbook.addWorksheet(
//                 safeSheetName
//             );

//         const errorCount =
//             Array.isArray(data)
//                 ? data.length
//                 : 0;

//         // =====================================================
//         // No errors
//         // =====================================================

//         if (
//             !Array.isArray(data) ||
//             data.length === 0
//         ) {

//             ws.addRow([
//                 'No errors found'
//             ]);

//             ws.getColumn(1).width = 25;

//         }

//         // =====================================================
//         // Errors exist
//         // =====================================================

//         else {

//             const headers =
//                 Object.keys(data[0]);

//             // -------------------------------------------------
//             // Calculate column widths BEFORE creating cells
//             // -------------------------------------------------

//             const widths =
//                 headers.map(
//                     () => 15
//                 );

//             // Header lengths
//             headers.forEach(
//                 (header, index) => {

//                     widths[index] =
//                         Math.max(
//                             widths[index],
//                             String(header).length + 2
//                         );

//                 }
//             );

//             // Calculate widths from source data.
//             //
//             // IMPORTANT:
//             // We don't inspect ExcelJS cells afterward.
//             //
//             for (const row of data) {

//                 for (
//                     let i = 0;
//                     i < headers.length;
//                     i++
//                 ) {

//                     const value =
//                         row[headers[i]];

//                     if (
//                         value === null ||
//                         value === undefined ||
//                         value === ''
//                     ) {
//                         continue;
//                     }

//                     const length =
//                         String(value).length;

//                     if (
//                         length + 2 >
//                         widths[i]
//                     ) {

//                         widths[i] =
//                             length + 2;

//                     }

//                 }

//             }

//             // Maximum width
//             for (
//                 let i = 0;
//                 i < widths.length;
//                 i++
//             ) {

//                 widths[i] =
//                     Math.min(
//                         widths[i],
//                         50
//                     );

//             }

//             // -------------------------------------------------
//             // Create columns
//             // -------------------------------------------------

//             ws.columns =
//                 headers.map(
//                     (header, index) => ({
//                         header: header,
//                         key: header,
//                         width: widths[index]
//                     })
//                 );

//             // -------------------------------------------------
//             // Header styling
//             // -------------------------------------------------

//             const headerRow =
//                 ws.getRow(1);

//             headerRow.font =
//                 headerFont;

//             headerRow.fill =
//                 headerFill;

//             headerRow.alignment =
//                 headerAlignment;

//             // -------------------------------------------------
//             // Add rows
//             // -------------------------------------------------

//             //
//             // addRows() is faster than repeatedly calling
//             // addRow() for many records.
//             //

//             ws.addRows(data);

//         }

//         // =====================================================
//         // Summary
//         // =====================================================

//         summarySheet.addRow({
//             sheet: safeSheetName,
//             count: errorCount,
//             nav: 'Open Sheet'
//         });

//         const hyperlinkCell =
//             summarySheet.getCell(
//                 `C${summaryRowNo}`
//             );

//         hyperlinkCell.value = {
//             text: 'Open',
//             hyperlink:
//                 `#'${safeSheetName}'!A1`
//         };

//         hyperlinkCell.font = {
//             color: {
//                 argb: '0000FF'
//             },
//             underline: true
//         };

//         summaryRowNo++;

//     }

//     // =========================================================
//     // Summary column widths
//     // =========================================================

//     summarySheet.getColumn(1).width = 40;
//     summarySheet.getColumn(2).width = 20;
//     summarySheet.getColumn(3).width = 25;

//     // =========================================================
//     // Freeze headers
//     // =========================================================

//     for (
//         const worksheet
//         of workbook.worksheets
//     ) {

//         worksheet.views = [
//             {
//                 state: 'frozen',
//                 ySplit: 1
//             }
//         ];

//     }

//     // =========================================================
//     // Write Excel
//     // =========================================================

//     await workbook.xlsx.writeFile(
//         filepath
//     );

//     return filepath;
// }


// // =============================================================
// // Safe Excel sheet name
// // =============================================================

// function safeName(name) {

//     let safe =
//         String(name)
//             .replace(
//                 /[\\/?*[\]:]/g,
//                 '_'
//             )
//             .trim();

//     if (!safe) {
//         safe = 'Sheet';
//     }

//     return safe.slice(0, 31);
// }


// module.exports = {
//     createExcel
// };

/**
 * src/excel.js
 *
 * Optimized streaming Excel generator.
 *
 * Features:
 * - Error Summary sheet
 * - Hyperlinks to detail sheets
 * - Header styling
 * - Frozen headers
 * - Streaming rows
 * - Much lower memory usage
 * - Faster than repeatedly using addRow()
 */

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');


// ============================================================
// CREATE EXCEL
// ============================================================

async function createExcel(
    resultDict,
    outputDir
) {

    // =========================================================
    // Filename
    // =========================================================

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /T/,
                '_'
            )
            .replace(
                /:/g,
                ''
            )
            .slice(
                0,
                17
            );


    const filename =
        `DI-Error-Report-${timestamp}.xlsx`;


    const filepath =
        path.join(
            outputDir,
            filename
        );


    // =========================================================
    // STREAMING WORKBOOK
    // =========================================================

    const workbook =
        new ExcelJS.stream.xlsx.WorkbookWriter({

            filename:

                filepath,

            useStyles:

                true,

            useSharedStrings:

                false

        });


    workbook.creator =
        'TDO Quality Analysis';


    workbook.created =
        new Date();


    // =========================================================
    // COMMON HEADER STYLE
    // =========================================================

    const headerFont = {

        bold: true,

        color: {
            argb: 'FFFFFF'
        }

    };


    const headerFill = {

        type: 'pattern',

        pattern: 'solid',

        fgColor: {
            argb: 'FF0000'
        }

    };


    const headerAlignment = {

        horizontal:
            'center',

        vertical:
            'middle'

    };


    // =========================================================
    // SUMMARY SHEET
    // =========================================================

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


    // =========================================================
    // SUMMARY HEADER
    // =========================================================

    const summaryHeader =
        summarySheet.getRow(1);


    summaryHeader.font =
        headerFont;


    summaryHeader.fill =
        headerFill;


    summaryHeader.alignment =
        headerAlignment;


    summaryHeader.commit();


    // =========================================================
    // FREEZE SUMMARY HEADER
    // =========================================================

    summarySheet.views = [

        {
            state:
                'frozen',

            ySplit:
                1
        }

    ];


    let summaryRowNo =
        2;


    // =========================================================
    // DETAIL SHEETS
    // =========================================================

    for (
        const [
            sheetName,
            data
        ]
        of Object.entries(
            resultDict
        )
    ) {

        // Skip summary
        if (
            sheetName ===
            'Error Summary'
        ) {

            continue;

        }


        // =====================================================
        // Safe sheet name
        // =====================================================

        const safeSheetName =
            safeName(
                sheetName
            );


        const ws =
            workbook.addWorksheet(
                safeSheetName
            );


        const errorCount =
            Array.isArray(data)
                ? data.length
                : 0;


        // =====================================================
        // No errors
        // =====================================================

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            ws.columns = [

                {
                    header:
                        'Result',

                    key:
                        'result',

                    width:
                        25
                }

            ];


            const headerRow =
                ws.getRow(1);


            headerRow.font =
                headerFont;


            headerRow.fill =
                headerFill;


            headerRow.alignment =
                headerAlignment;


            headerRow.commit();


            ws.addRow({

                result:
                    'No errors found'

            }).commit();


        }

        // =====================================================
        // Data exists
        // =====================================================

        else {

            const headers =
                Object.keys(
                    data[0]
                );


            // =================================================
            // Columns
            //
            // Fixed width is intentional.
            //
            // Scanning every cell to calculate auto width
            // is expensive for large Excel reports.
            // =================================================

            ws.columns =
                headers.map(
                    header => ({

                        header:
                            header,

                        key:
                            header,

                        width:
                            25

                    })
                );


            // =================================================
            // Header
            // =================================================

            const headerRow =
                ws.getRow(1);


            headerRow.font =
                headerFont;


            headerRow.fill =
                headerFill;


            headerRow.alignment =
                headerAlignment;


            headerRow.commit();


            // =================================================
            // Freeze header
            // =================================================

            ws.views = [

                {
                    state:
                        'frozen',

                    ySplit:
                        1
                }

            ];


            // =================================================
            // STREAM ROWS
            // =================================================

            for (
                const row
                of data
            ) {

                const excelRow =
                    ws.addRow(
                        row
                    );


                excelRow.commit();

            }

        }


        // =====================================================
        // Summary row
        // =====================================================

        const summaryRow =
            summarySheet.addRow({

                sheet:
                    safeSheetName,

                count:
                    errorCount,

                nav:
                    'Open'

            });


        // =====================================================
        // Hyperlink
        // =====================================================

        const hyperlinkCell =
            summaryRow.getCell(3);


        hyperlinkCell.value = {

            text:
                'Open',

            hyperlink:
                `#'${safeSheetName}'!A1`

        };


        hyperlinkCell.font = {

            color: {
                argb:
                    '0000FF'
            },

            underline:
                true

        };


        summaryRow.commit();


        summaryRowNo++;

    }


    // =========================================================
    // Commit summary sheet
    // =========================================================

    summarySheet.commit();


    // =========================================================
    // Finalize workbook
    // =========================================================

    await workbook.commit();


    return filepath;

}


// ============================================================
// SAFE EXCEL SHEET NAME
// ============================================================

function safeName(name) {

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