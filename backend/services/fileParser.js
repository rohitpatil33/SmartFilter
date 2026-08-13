const csv = require("csv-parser");
const XLSX = require("xlsx");
const stream = require("stream");
const AdmZip = require("adm-zip");
const { XMLParser } = require("fast-xml-parser");


/*
=========================================================
HELPERS
=========================================================
*/

function asArray(value) {

    if (!value) {
        return [];
    }

    return Array.isArray(value)
        ? value
        : [value];

}


function normalizeText(value) {

    return String(value ?? "")
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


function isNonEmpty(value) {

    return normalizeText(value) !== "";

}


/*
=========================================================
GET VISIBLE EXCEL COLUMNS

IMPORTANT:

We do NOT hardcode column names.

If Excel marks a column as hidden, that column will
not be returned to the frontend.

This solves cases such as:

Epicore item Code
Actual Consumption
UOM

when they are hidden in the actual Excel sheet.
=========================================================
*/

function getVisibleColumnIndexes(
    worksheet,
    maxColumns
) {

    const columnInfo =
        worksheet["!cols"] || [];


    const visibleIndexes = [];


    for (
        let index = 0;
        index < maxColumns;
        index++
    ) {

        const column =
            columnInfo[index];


        /*
        Excel/SheetJS hidden column.
        */

        const isHidden =
            column &&
            (
                column.hidden === true ||
                column.hidden === 1
            );


        if (!isHidden) {

            visibleIndexes.push(
                index
            );

        }

    }


    return visibleIndexes;

}


/*
=========================================================
FIND HEADER ROW
=========================================================
*/

function findHeaderRow(sheetData) {

    const rowsToCheck =
        Math.min(
            sheetData.length,
            20
        );


    let headerRowIndex = -1;

    let highestColumnCount = 0;


    for (
        let i = 0;
        i < rowsToCheck;
        i++
    ) {

        const row =
            sheetData[i];


        if (!Array.isArray(row)) {
            continue;
        }


        const nonEmptyCount =
            row.filter(
                isNonEmpty
            ).length;


        if (
            nonEmptyCount < 2
        ) {

            continue;

        }


        if (
            nonEmptyCount >
            highestColumnCount
        ) {

            highestColumnCount =
                nonEmptyCount;

            headerRowIndex =
                i;

        }

    }


    return headerRowIndex;

}


/*
=========================================================
CREATE COLUMN HEADERS

Preserves the actual Excel column names.
=========================================================
*/

function createHeaders(
    rawHeaders,
    visibleColumnIndexes
) {

    const headers = [];

    const usedHeaders =
        new Set();


    visibleColumnIndexes.forEach(
        (originalIndex) => {

            const header =
                rawHeaders[
                    originalIndex
                ];


            let columnName =
                normalizeText(
                    header
                );


            /*
            Empty header.
            */

            if (!columnName) {

                columnName =
                    `Column ${originalIndex + 1}`;

            }


            /*
            Handle duplicate Excel headers.
            */

            let uniqueName =
                columnName;

            let counter = 1;


            while (
                usedHeaders.has(
                    uniqueName
                )
            ) {

                uniqueName =
                    `${columnName} (${counter})`;

                counter++;

            }


            usedHeaders.add(
                uniqueName
            );


            headers.push({

                name:
                    uniqueName,

                originalIndex

            });

        }
    );


    return headers;

}


/*
=========================================================
EXTRACT MERGED CELL INFORMATION

This allows the frontend to understand Excel merged
cells without exposing hidden columns.

We keep original Excel row/column coordinates because
image mapping depends on them.
=========================================================
*/

function extractMergedCells(
    worksheet,
    headers,
    rows,
    headerRowIndex
) {

    const merges =
        worksheet["!merges"] || [];


    if (
        merges.length === 0
    ) {

        return;

    }


    const visibleColumnSet =
        new Set(
            headers.map(
                (header) =>
                    header.originalIndex
            )
        );


    /*
    Map original Excel column index
    to visible column name.
    */

    const originalColumnToName =
        new Map();


    headers.forEach(
        (header) => {

            originalColumnToName.set(
                header.originalIndex,
                header.name
            );

        }
    );


    rows.forEach(
        (row) => {

            row.__mergedCells = [];

        }
    );


    let mergeId = 1;


    merges.forEach(
        (merge) => {

            const startRow =
                merge.s.r + 1;

            const endRow =
                merge.e.r + 1;

            const startColumn =
                merge.s.c;

            const endColumn =
                merge.e.c;


            /*
            Skip completely hidden columns.
            */

            const visibleColumnsInMerge =
                [];


            for (
                let column =
                    startColumn;

                column <=
                    endColumn;

                column++
            ) {

                if (
                    visibleColumnSet.has(
                        column
                    )
                ) {

                    visibleColumnsInMerge.push(
                        column
                    );

                }

            }


            if (
                visibleColumnsInMerge.length ===
                0
            ) {

                return;

            }


            /*
            Find the anchor row.
            */

            const anchorRow =
                rows.find(
                    (row) =>
                        row.__excelRow ===
                        startRow
                );


            if (!anchorRow) {
                return;
            }


            visibleColumnsInMerge.forEach(
                (originalColumnIndex) => {

                    const columnName =
                        originalColumnToName.get(
                            originalColumnIndex
                        );


                    if (!columnName) {
                        return;
                    }


                    const value =
                        anchorRow[
                            columnName
                        ];


                    const mergedInfo = {

                        id:
                            mergeId++,

                        column:
                            columnName,

                        columnIndex:
                            originalColumnIndex,

                        value:
                            value ?? "",

                        startRow,

                        endRow,

                        rowSpan:
                            endRow -
                            startRow +
                            1,

                        columnSpan:
                            endColumn -
                            startColumn +
                            1,

                        anchorRowId:
                            anchorRow
                                .__smartFilterRowId

                    };


                    /*
                    Attach merge information
                    to every row covered by
                    this merged cell.
                    */

                    rows.forEach(
                        (row) => {

                            if (
                                row.__excelRow >=
                                    startRow &&
                                row.__excelRow <=
                                    endRow
                            ) {

                                row.__mergedCells.push(
                                    mergedInfo
                                );

                            }

                        }
                    );

                }
            );

        }
    );

}


/*
=========================================================
EXTRACT IMAGES FROM XLSX
=========================================================
*/

function extractExcelImages(
    buffer
) {

    const zip =
        new AdmZip(
            buffer
        );


    const entries =
        zip.getEntries();


    const drawingEntries =
        entries.filter(
            (entry) =>
                /^xl\/drawings\/drawing\d+\.xml$/
                    .test(
                        entry.entryName
                    )
        );


    if (
        drawingEntries.length === 0
    ) {

        return [];

    }


    const parser =
        new XMLParser({

            ignoreAttributes:
                false,

            attributeNamePrefix:
                "@_"

        });


    const images = [];


    for (
        const drawingEntry
        of drawingEntries
    ) {

        const drawingPath =
            drawingEntry.entryName;


        const drawingXml =
            drawingEntry
                .getData()
                .toString(
                    "utf8"
                );


        let drawing;


        try {

            drawing =
                parser.parse(
                    drawingXml
                );

        } catch (
            error
        ) {

            console.error(
                "Unable to parse drawing XML:",
                error
            );

            continue;

        }


        /*
        =====================================================
        RELATIONSHIPS
        =====================================================
        */

        const drawingDirectory =
            drawingPath.substring(
                0,
                drawingPath.lastIndexOf("/")
            );


        const drawingFileName =
            drawingPath.substring(
                drawingPath.lastIndexOf("/") + 1
            );


        const relationshipPath =
            `${drawingDirectory}/_rels/${drawingFileName}.rels`;


        const relationshipEntry =
            entries.find(
                (entry) =>
                    entry.entryName ===
                    relationshipPath
            );


        if (
            !relationshipEntry
        ) {

            continue;

        }


        const relationshipXml =
            relationshipEntry
                .getData()
                .toString(
                    "utf8"
                );


        let relationships;


        try {

            relationships =
                parser.parse(
                    relationshipXml
                );

        } catch (
            error
        ) {

            console.error(
                "Unable to parse image relationships:",
                error
            );

            continue;

        }


        const relationshipList =
            asArray(
                relationships
                    ?.Relationships
                    ?.Relationship
            );


        const imageRelationships = {};


        relationshipList.forEach(
            (relationship) => {

                const type =
                    relationship?.[
                        "@_Type"
                    ];


                const id =
                    relationship?.[
                        "@_Id"
                    ];


                const target =
                    relationship?.[
                        "@_Target"
                    ];


                if (
                    type &&
                    type.endsWith(
                        "/image"
                    ) &&
                    id &&
                    target
                ) {

                    let imagePath;


                    if (
                        target.startsWith("/")
                    ) {

                        imagePath =
                            target.substring(
                                1
                            );

                    } else {

                        const base =
                            drawingDirectory
                                .split("/");


                        const targetParts =
                            target.split("/");


                        for (
                            const part
                            of targetParts
                        ) {

                            if (
                                part === ".."
                            ) {

                                base.pop();

                            } else if (
                                part !== "."
                            ) {

                                base.push(
                                    part
                                );

                            }

                        }


                        imagePath =
                            base.join(
                                "/"
                            );

                    }


                    imageRelationships[id] =
                        imagePath;

                }

            }
        );


        /*
        =====================================================
        DRAWING ANCHORS
        =====================================================
        */

        const root =
            drawing?.[
                "xdr:wsDr"
            ] ||
            drawing?.wsDr ||
            drawing;


        const twoCellAnchors =
            asArray(
                root?.[
                    "xdr:twoCellAnchor"
                ] ||
                root?.twoCellAnchor
            );


        const oneCellAnchors =
            asArray(
                root?.[
                    "xdr:oneCellAnchor"
                ] ||
                root?.oneCellAnchor
            );


        const anchors = [

            ...twoCellAnchors,

            ...oneCellAnchors

        ];


        anchors.forEach(
            (anchor) => {

                const from =
                    anchor?.[
                        "xdr:from"
                    ] ||
                    anchor?.from;


                const picture =
                    anchor?.[
                        "xdr:pic"
                    ] ||
                    anchor?.pic;


                if (
                    !from ||
                    !picture
                ) {

                    return;

                }


                const excelRow =
                    Number(
                        from?.[
                            "xdr:row"
                        ] ??
                        from?.row ??
                        -1
                    );


                const excelColumn =
                    Number(
                        from?.[
                            "xdr:col"
                        ] ??
                        from?.col ??
                        -1
                    );


                if (
                    excelRow < 0 ||
                    excelColumn < 0
                ) {

                    return;

                }


                const blip =
                    picture?.[
                        "xdr:blipFill"
                    ]?.[
                        "a:blip"
                    ] ||
                    picture?.blipFill?.blip;


                const relationshipId =
                    blip?.[
                        "@_r:embed"
                    ] ||
                    blip?.[
                        "@_embed"
                    ];


                if (
                    !relationshipId
                ) {

                    return;

                }


                const imagePath =
                    imageRelationships[
                        relationshipId
                    ];


                if (
                    !imagePath
                ) {

                    return;

                }


                const imageEntry =
                    entries.find(
                        (entry) =>
                            entry.entryName ===
                            imagePath
                    );


                if (
                    !imageEntry
                ) {

                    return;

                }


                const imageBuffer =
                    imageEntry.getData();


                const extension =
                    imagePath
                        .split(".")
                        .pop()
                        .toLowerCase();


                let mimeType =
                    "image/png";


                if (
                    extension ===
                        "jpg" ||
                    extension ===
                        "jpeg"
                ) {

                    mimeType =
                        "image/jpeg";

                } else if (
                    extension ===
                    "gif"
                ) {

                    mimeType =
                        "image/gif";

                } else if (
                    extension ===
                    "webp"
                ) {

                    mimeType =
                        "image/webp";

                } else if (
                    extension ===
                    "bmp"
                ) {

                    mimeType =
                        "image/bmp";

                }


                images.push({

                    excelRow,

                    excelColumn,

                    imagePath,

                    mimeType,

                    data:
                        `data:${mimeType};base64,${imageBuffer.toString(
                            "base64"
                        )}`

                });

            }
        );

    }


    /*
    =====================================================
    REMOVE DUPLICATE IMAGES
    =====================================================
    */

    const uniqueImages = [];

    const seen =
        new Set();


    images.forEach(
        (image) => {

            const key =
                `${image.imagePath}-${image.excelRow}-${image.excelColumn}`;


            if (
                !seen.has(key)
            ) {

                seen.add(key);

                uniqueImages.push(
                    image
                );

            }

        }
    );


    return uniqueImages;

}


/*
=========================================================
FIND LOGICAL ITEM START ROWS
=========================================================
*/

function findItemStartRows(
    sheetData,
    headerRowIndex
) {

    const itemStartRows = [];


    for (
        let i =
            headerRowIndex + 1;

        i < sheetData.length;

        i++
    ) {

        const row =
            sheetData[i];


        if (
            !Array.isArray(row)
        ) {

            continue;

        }


        const firstCell =
            row[0];


        const secondCell =
            row[1];


        const hasSerial =
            isNonEmpty(
                firstCell
            );


        const hasPartName =
            isNonEmpty(
                secondCell
            );


        /*
        A new logical item begins when
        both Sr. no. and Part name/Number
        are present.
        */

        if (
            hasSerial &&
            hasPartName
        ) {

            itemStartRows.push(
                i + 1
            );

        }

    }


    return itemStartRows;

}


/*
=========================================================
FIND ITEM START FOR IMAGE
=========================================================
*/

function findItemStartForImage(
    imageExcelRow,
    itemStartRows
) {

    let selectedStart =
        null;


    for (
        const itemStart
        of itemStartRows
    ) {

        if (
            itemStart <=
            imageExcelRow
        ) {

            selectedStart =
                itemStart;

        } else {

            break;

        }

    }


    return selectedStart;

}


/*
=========================================================
EXCEL PARSER
=========================================================
*/

function parseExcel(
    buffer
) {

    const workbook =
        XLSX.read(
            buffer,
            {

                type:
                    "buffer",

                cellDates:
                    true,

                /*
                Important for preserving
                worksheet formatting metadata.
                */

                cellStyles:
                    true

            }
        );


    const sheetName =
        workbook.SheetNames[0];


    const worksheet =
        workbook.Sheets[
            sheetName
        ];


    if (
        !worksheet
    ) {

        return {

            rows: [],

            images: []

        };

    }


    /*
    =====================================================
    CONVERT SHEET TO 2D ARRAY
    =====================================================
    */

    const sheetData =
        XLSX.utils.sheet_to_json(
            worksheet,
            {

                header:
                    1,

                defval:
                    "",

                raw:
                    false

            }
        );


    if (
        !sheetData ||
        sheetData.length === 0
    ) {

        return {

            rows: [],

            images: []

        };

    }


    /*
    =====================================================
    HEADER
    =====================================================
    */

    const headerRowIndex =
        findHeaderRow(
            sheetData
        );


    if (
        headerRowIndex === -1
    ) {

        return {

            rows: [],

            images: []

        };

    }


    console.log(
        "Excel header row:",
        headerRowIndex + 1
    );


    const rawHeaders =
        sheetData[
            headerRowIndex
        ];


    /*
    =====================================================
    DETERMINE MAXIMUM COLUMN COUNT
    =====================================================
    */

    let maxColumns =
        rawHeaders.length;


    sheetData.forEach(
        (row) => {

            if (
                Array.isArray(row) &&
                row.length >
                    maxColumns
            ) {

                maxColumns =
                    row.length;

            }

        }
    );


    /*
    =====================================================
    GET ONLY VISIBLE EXCEL COLUMNS
    =====================================================
    */

    const visibleColumnIndexes =
        getVisibleColumnIndexes(
            worksheet,
            maxColumns
        );


    console.log(
        "Visible Excel column indexes:",
        visibleColumnIndexes
    );


    /*
    =====================================================
    CREATE REAL HEADERS
    =====================================================
    */

    const headers =
        createHeaders(
            rawHeaders,
            visibleColumnIndexes
        );


    console.log(
        "Visible Excel columns:",
        headers.map(
            (header) =>
                header.name
        )
    );


    /*
    =====================================================
    ITEM STARTS
    =====================================================
    */

    const itemStartRows =
        findItemStartRows(
            sheetData,
            headerRowIndex
        );


    console.log(
        "Logical item starts:",
        itemStartRows
    );


    /*
    =====================================================
    CREATE ROWS
    =====================================================
    */

    const rows = [];


    for (
        let i =
            headerRowIndex + 1;

        i < sheetData.length;

        i++
    ) {

        const row =
            sheetData[i];


        if (
            !Array.isArray(row)
        ) {

            continue;

        }


        /*
        Only use VISIBLE columns.
        */

        const visibleValues =
            visibleColumnIndexes.map(
                (columnIndex) =>
                    row[
                        columnIndex
                    ] ?? ""
            );


        const hasTableData =
            visibleValues.some(
                isNonEmpty
            );


        if (
            !hasTableData
        ) {

            continue;

        }


        /*
        =====================================================
        FOOTER DETECTION
        =====================================================
        */

        const firstCell =
            normalizeText(
                row[0]
            ).toLowerCase();


        const hasSecondCell =
            isNonEmpty(
                row[1]
            );


        const hasPaintData =
            isNonEmpty(
                row[4]
            ) ||
            isNonEmpty(
                row[5]
            );


        const looksLikeFooter =
            (
                firstCell.startsWith(
                    "prepared by"
                ) ||
                firstCell.startsWith(
                    "approved by"
                )
            ) &&
            !hasSecondCell &&
            !hasPaintData;


        if (
            looksLikeFooter
        ) {

            continue;

        }


        const currentExcelRow =
            i + 1;


        /*
        =====================================================
        FIND LOGICAL ITEM
        =====================================================
        */

        let currentItemIndex =
            -1;


        for (
            let itemIndex = 0;

            itemIndex <
                itemStartRows.length;

            itemIndex++
        ) {

            if (
                itemStartRows[
                    itemIndex
                ] <=
                currentExcelRow
            ) {

                currentItemIndex =
                    itemIndex;

            } else {

                break;

            }

        }


        /*
        =====================================================
        CREATE ROW OBJECT
        =====================================================
        */

        const object = {};


        headers.forEach(
            (
                header
            ) => {

                object[
                    header.name
                ] =
                    row[
                        header.originalIndex
                    ] ?? "";

            }
        );


        /*
        Unique physical row.
        */

        object.__smartFilterRowId =
            rows.length;


        /*
        Logical item.
        */

        object.__itemId =
            currentItemIndex;


        /*
        Keep original Excel row
        temporarily for image/merge
        mapping.
        */

        object.__excelRow =
            currentExcelRow;


        rows.push(
            object
        );

    }


    /*
    =====================================================
    MERGED CELLS
    =====================================================
    */

    extractMergedCells(
        worksheet,
        headers,
        rows,
        headerRowIndex
    );


    /*
    =====================================================
    EXTRACT EXCEL IMAGES
    =====================================================
    */

    const extractedImages =
        extractExcelImages(
            buffer
        );


    console.log(
        "Excel images found:",
        extractedImages.length
    );


    /*
    =====================================================
    MAP IMAGES TO LOGICAL ITEMS
    =====================================================
    */

    const images = [];


    extractedImages.forEach(
        (image) => {

            const imageExcelRow =
                image.excelRow + 1;


            /*
            Find parent logical item.
            */

            const itemStartExcelRow =
                findItemStartForImage(
                    imageExcelRow,
                    itemStartRows
                );


            if (
                !itemStartExcelRow
            ) {

                console.warn(
                    "Unable to map image:",
                    imageExcelRow
                );

                return;

            }


            /*
            Find first row of item.
            */

            const selectedRow =
                rows.find(
                    (row) =>
                        row.__excelRow ===
                        itemStartExcelRow
                );


            if (
                !selectedRow
            ) {

                console.warn(
                    "Unable to find item row:",
                    itemStartExcelRow
                );

                return;

            }


            /*
            Find next item.
            */

            const nextItemStart =
                itemStartRows.find(
                    (rowNumber) =>
                        rowNumber >
                        itemStartExcelRow
                );


            const itemEndExcelRow =
                nextItemStart
                    ? nextItemStart - 1
                    : itemStartExcelRow;


            /*
            Do not assume the image is
            always column C.

            Preserve the actual Excel
            column number.
            */

            images.push({

                rowId:
                    selectedRow
                        .__smartFilterRowId,

                itemId:
                    selectedRow
                        .__itemId,

                excelRow:
                    imageExcelRow,

                startExcelRow:
                    itemStartExcelRow,

                endExcelRow:
                    itemEndExcelRow,

                excelColumn:
                    image.excelColumn,

                column:
                    headers.find(
                        (header) =>
                            header.originalIndex ===
                            image.excelColumn
                    )?.name ||
                    null,

                image:
                    image.data

            });

        }
    );


    /*
    =====================================================
    REMOVE TEMPORARY EXCEL ROW
    =====================================================
    */

    rows.forEach(
        (row) => {

            delete row.__excelRow;

        }
    );


    console.log(
        "Images mapped:",
        images.length
    );


    console.log(
        "Final columns:",
        headers.map(
            (header) =>
                header.name
        )
    );


    return {

        rows,

        images

    };

}


/*
=========================================================
CSV PARSER
=========================================================
*/

function parseCSV(
    buffer
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const rows = [];


            const readable =
                new stream.PassThrough();


            readable.end(
                buffer
            );


            readable
                .pipe(
                    csv()
                )

                .on(
                    "data",
                    (row) => {

                        rows.push(
                            row
                        );

                    }
                )

                .on(
                    "end",
                    () => {

                        const processedRows =
                            rows.map(
                                (
                                    row,
                                    index
                                ) => ({

                                    ...row,

                                    __smartFilterRowId:
                                        index,

                                    __itemId:
                                        index

                                })
                            );


                        resolve({

                            rows:
                                processedRows,

                            images: []

                        });

                    }
                )

                .on(
                    "error",
                    reject
                );

        }
    );

}


/*
=========================================================
XLS PARSER
=========================================================
*/

function parseXLS(
    buffer
) {

    const workbook =
        XLSX.read(
            buffer,
            {

                type:
                    "buffer",

                cellDates:
                    true,

                cellStyles:
                    true

            }
        );


    const sheetName =
        workbook.SheetNames[0];


    const worksheet =
        workbook.Sheets[
            sheetName
        ];


    if (
        !worksheet
    ) {

        return {

            rows: [],

            images: []

        };

    }


    const sheetData =
        XLSX.utils.sheet_to_json(
            worksheet,
            {

                header:
                    1,

                defval:
                    "",

                raw:
                    false

            }
        );


    if (
        !sheetData.length
    ) {

        return {

            rows: [],

            images: []

        };

    }


    const headerRowIndex =
        findHeaderRow(
            sheetData
        );


    if (
        headerRowIndex === -1
    ) {

        return {

            rows: [],

            images: []

        };

    }


    const rawHeaders =
        sheetData[
            headerRowIndex
        ];


    let maxColumns =
        rawHeaders.length;


    sheetData.forEach(
        (row) => {

            if (
                Array.isArray(row) &&
                row.length >
                    maxColumns
            ) {

                maxColumns =
                    row.length;

            }

        }
    );


    const visibleColumnIndexes =
        getVisibleColumnIndexes(
            worksheet,
            maxColumns
        );


    const headers =
        createHeaders(
            rawHeaders,
            visibleColumnIndexes
        );


    const rows = [];


    for (
        let i =
            headerRowIndex + 1;

        i < sheetData.length;

        i++
    ) {

        const row =
            sheetData[i];


        if (
            !Array.isArray(row)
        ) {

            continue;

        }


        const hasData =
            visibleColumnIndexes.some(
                (columnIndex) =>
                    isNonEmpty(
                        row[
                            columnIndex
                        ]
                    )
            );


        if (!hasData) {

            continue;

        }


        const object = {};


        headers.forEach(
            (header) => {

                object[
                    header.name
                ] =
                    row[
                        header.originalIndex
                    ] ?? "";

            }
        );


        object.__smartFilterRowId =
            rows.length;


        object.__itemId =
            rows.length;


        rows.push(
            object
        );

    }


    return {

        rows,

        images: []

    };

}


/*
=========================================================
MAIN FILE PARSER
=========================================================
*/

async function parseFile(
    file
) {

    if (
        !file ||
        !file.originalname
    ) {

        throw new Error(
            "Invalid file"
        );

    }


    const extension =
        file.originalname
            .split(".")
            .pop()
            .toLowerCase();


    /*
    =====================================================
    CSV
    =====================================================
    */

    if (
        extension === "csv"
    ) {

        return await parseCSV(
            file.buffer
        );

    }


    /*
    =====================================================
    XLSX
    =====================================================
    */

    if (
        extension === "xlsx"
    ) {

        return parseExcel(
            file.buffer
        );

    }


    /*
    =====================================================
    XLS
    =====================================================
    */

    if (
        extension === "xls"
    ) {

        return parseXLS(
            file.buffer
        );

    }


    throw new Error(
        "Unsupported file format. Please upload CSV, XLSX or XLS."
    );

}


module.exports = {

    parseFile

};