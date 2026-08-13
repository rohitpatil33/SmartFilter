import React, {
    useMemo,
    useState
} from "react";

import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

import {
    DataGrid
} from "@mui/x-data-grid";

import SmartFilter from "./SmartFilter";


function DataTable({ data }) {

    /*
    =========================================================
    FILTER STATES
    =========================================================
    */

    const [
        globalSearch,
        setGlobalSearch
    ] = useState("");


    const [
        selectedColumn,
        setSelectedColumn
    ] = useState("");


    const [
        columnSearch,
        setColumnSearch
    ] = useState("");


    const [
        advancedFilters,
        setAdvancedFilters
    ] = useState([]);


    /*
    =========================================================
    IMAGE PREVIEW
    =========================================================
    */

    const [
        selectedImage,
        setSelectedImage
    ] = useState(null);


    /*
    =========================================================
    FULL CELL / COLUMN VALUE
    =========================================================
    */

    const [
        selectedCell,
        setSelectedCell
    ] = useState(null);


    /*
    =========================================================
    SAFE DATA
    =========================================================
    */

    const safeRows =
        data?.rows || [];


    const safeColumns =
        data?.columns || [];


    const safeImages =
        data?.images || [];


    /*
    =========================================================
    IMAGE MAP
    =========================================================
    */

    const imageMap =
        useMemo(() => {

            const map =
                new Map();


            safeImages.forEach(
                (imageItem) => {

                    if (
                        imageItem?.rowId ===
                            undefined ||
                        imageItem?.rowId ===
                            null
                    ) {

                        return;

                    }


                    const key =
                        String(
                            imageItem.rowId
                        );


                    if (
                        !map.has(key)
                    ) {

                        map.set(
                            key,
                            imageItem
                        );

                    }

                }
            );


            return map;

        }, [
            safeImages
        ]);


    /*
    =========================================================
    OPEN FULL VALUE
    =========================================================
    */

    const handleCellClick = (
        column,
        value
    ) => {

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {

            return;

        }


        setSelectedCell({

            column,

            value:
                String(value)

        });

    };


    /*
    =========================================================
    CLOSE FULL VALUE
    =========================================================
    */

    const handleCloseCell =
        () => {

            setSelectedCell(
                null
            );

        };


    /*
    =========================================================
    GET IMAGE
    =========================================================
    */

    const getRowImage = (
        row,
        column
    ) => {

        if (
            column !==
            "Part Pictorial"
        ) {

            return null;

        }


        const rowId =
            row?.__smartFilterRowId;


        if (
            rowId === undefined ||
            rowId === null
        ) {

            return null;

        }


        return (
            imageMap.get(
                String(rowId)
            ) || null
        );

    };


    /*
    =========================================================
    DETECT COLUMN TYPE
    =========================================================
    */

    const detectColumnType = (
        column
    ) => {

        const values =
            safeRows
                .map(
                    (row) =>
                        row[column]
                )
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        String(
                            value
                        ).trim() !== ""
                );


        if (
            values.length === 0
        ) {

            return "text";

        }


        const allNumbers =
            values.every(
                (value) => {

                    const cleaned =
                        String(value)
                            .replace(
                                /,/g,
                                ""
                            )
                            .trim();


                    return (
                        cleaned !== "" &&
                        !Number.isNaN(
                            Number(cleaned)
                        )
                    );

                }
            );


        if (allNumbers) {

            return "number";

        }


        return "text";

    };


    /*
    =========================================================
    ADVANCED FILTER
    =========================================================
    */

    const applyAdvancedFilter = (
        row,
        filter
    ) => {

        if (
            !filter ||
            !filter.column
        ) {

            return true;

        }


        const rowValue =
            row[
                filter.column
            ];


        const filterValue =
            String(
                filter.value ?? ""
            )
                .toLowerCase()
                .trim();


        const value =
            String(
                rowValue ?? ""
            )
                .toLowerCase()
                .trim();


        /*
        Empty filter
        */

        if (
            !filterValue
        ) {

            return true;

        }


        const type =
            detectColumnType(
                filter.column
            );


        /*
        =====================================================
        NUMBER
        =====================================================
        */

        if (
            type === "number"
        ) {

            const rowNumber =
                Number(
                    String(
                        rowValue ?? ""
                    )
                        .replace(
                            /,/g,
                            ""
                        )
                );


            const searchNumber =
                Number(
                    filter.value
                );


            if (
                Number.isNaN(
                    rowNumber
                ) ||
                Number.isNaN(
                    searchNumber
                )
            ) {

                return false;

            }


            switch (
                filter.operator
            ) {

                case "greaterThan":

                    return (
                        rowNumber >
                        searchNumber
                    );


                case "greaterThanOrEqual":

                    return (
                        rowNumber >=
                        searchNumber
                    );


                case "lessThan":

                    return (
                        rowNumber <
                        searchNumber
                    );


                case "lessThanOrEqual":

                    return (
                        rowNumber <=
                        searchNumber
                    );


                case "equals":

                default:

                    return (
                        rowNumber ===
                        searchNumber
                    );

            }

        }


        /*
        =====================================================
        TEXT
        =====================================================
        */

        switch (
            filter.operator
        ) {

            case "equals":

                return (
                    value ===
                    filterValue
                );


            case "startsWith":

                return value.startsWith(
                    filterValue
                );


            case "endsWith":

                return value.endsWith(
                    filterValue
                );


            case "contains":

            default:

                return value.includes(
                    filterValue
                );

        }

    };


    /*
    =========================================================
    DIRECT MATCHING
    =========================================================
    */

    const directlyMatchedRows =
        useMemo(() => {

            return safeRows.filter(
                (row) => {

                    /*
                    =================================================
                    SEARCH ENTIRE FILE
                    =================================================
                    */

                    if (
                        globalSearch.trim()
                    ) {

                        const search =
                            globalSearch
                                .toLowerCase()
                                .trim();


                        const matches =
                            Object.entries(
                                row
                            )
                                .filter(
                                    ([key]) =>
                                        key !==
                                            "__smartFilterRowId" &&
                                        key !==
                                            "__itemId" &&
                                        key !==
                                            "__excelRow"
                                )
                                .some(
                                    ([, value]) =>
                                        String(
                                            value ?? ""
                                        )
                                            .toLowerCase()
                                            .includes(
                                                search
                                            )
                                );


                        if (!matches) {

                            return false;

                        }

                    }


                    /*
                    =================================================
                    COLUMN SEARCH
                    =================================================
                    */

                    if (
                        selectedColumn &&
                        columnSearch.trim()
                    ) {

                        const search =
                            columnSearch
                                .toLowerCase()
                                .trim();


                        const value =
                            String(
                                row[
                                    selectedColumn
                                ] ?? ""
                            )
                                .toLowerCase();


                        if (
                            !value.includes(
                                search
                            )
                        ) {

                            return false;

                        }

                    }


                    /*
                    =================================================
                    ADVANCED FILTER
                    =================================================
                    */

                    if (
                        advancedFilters.length
                    ) {

                        const matches =
                            advancedFilters.every(
                                (filter) =>
                                    applyAdvancedFilter(
                                        row,
                                        filter
                                    )
                            );


                        if (!matches) {

                            return false;

                        }

                    }


                    return true;

                }
            );

        }, [
            safeRows,
            globalSearch,
            selectedColumn,
            columnSearch,
            advancedFilters
        ]);


    /*
    =========================================================
    COMPLETE ITEM FILTERING

    If one physical row matches,
    return all rows belonging to
    that logical item.
    =========================================================
    */

    const filteredRows =
        useMemo(() => {

            const hasFilter =
                Boolean(
                    globalSearch.trim()
                ) ||
                Boolean(
                    selectedColumn
                ) ||
                Boolean(
                    columnSearch.trim()
                ) ||
                advancedFilters.length > 0;


            /*
            No filters:
            show everything.
            */

            if (!hasFilter) {

                return safeRows;

            }


            /*
            Find logical item IDs.
            */

            const matchedItemIds =
                new Set();


            directlyMatchedRows.forEach(
                (row) => {

                    if (
                        row.__itemId !==
                            undefined &&
                        row.__itemId !==
                            null &&
                        row.__itemId >= 0
                    ) {

                        matchedItemIds.add(
                            row.__itemId
                        );

                    }

                }
            );


            /*
            Return complete item.
            */

            if (
                matchedItemIds.size > 0
            ) {

                return safeRows.filter(
                    (row) =>
                        matchedItemIds.has(
                            row.__itemId
                        )
                );

            }


            /*
            Fallback for CSV /
            normal flat files.
            */

            return directlyMatchedRows;

        }, [
            safeRows,
            directlyMatchedRows,
            globalSearch,
            selectedColumn,
            columnSearch,
            advancedFilters
        ]);


    /*
    =========================================================
    DATAGRID COLUMNS
    =========================================================
    */

    const columns =
        useMemo(() => {

            const visibleColumns =
                safeColumns.filter(
                    (column) =>
                        column !==
                            "__smartFilterRowId" &&
                        column !==
                            "__itemId" &&
                        column !==
                            "__excelRow"
                );


            return visibleColumns.map(
                (column) => {

                    /*
                    =================================================
                    PART PICTORIAL
                    =================================================
                    */

                    if (
                        column ===
                        "Part Pictorial"
                    ) {

                        return {

                            field:
                                column,

                            headerName:
                                column,

                            width:
                                210,

                            minWidth:
                                210,

                            sortable:
                                false,

                            resizable:
                                true,


                            /*
                            Full column name is clickable.
                            */

                            renderHeader:
                                () => (

                                    <Box

                                        onClick={() =>
                                            handleCellClick(
                                                "Column Name",
                                                column
                                            )
                                        }

                                        title="Click to view full column name"

                                        sx={{
                                            width:
                                                "100%",

                                            height:
                                                "100%",

                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            whiteSpace:
                                                "normal",

                                            wordBreak:
                                                "break-word",

                                            lineHeight:
                                                1.2,

                                            fontWeight:
                                                700,

                                            color:
                                                "#334155",

                                            cursor:
                                                "pointer",

                                            "&:hover":
                                            {
                                                color:
                                                    "#2563EB"
                                            }
                                        }}

                                    >

                                        {
                                            column
                                        }

                                    </Box>

                                ),


                            renderCell:
                                (params) => {

                                    const imageData =
                                        getRowImage(
                                            params.row,
                                            column
                                        );


                                    if (
                                        !imageData
                                    ) {

                                        return null;

                                    }


                                    return (

                                        <Box

                                            onClick={() =>
                                                setSelectedImage(
                                                    imageData.image
                                                )
                                            }

                                            title="Click to view image"

                                            sx={{
                                                width:
                                                    82,

                                                height:
                                                    58,

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                justifyContent:
                                                    "center",

                                                border:
                                                    "1px solid #D9E2EC",

                                                borderRadius:
                                                    "10px",

                                                backgroundColor:
                                                    "#F8FAFC",

                                                overflow:
                                                    "hidden",

                                                cursor:
                                                    "pointer",

                                                position:
                                                    "relative",

                                                "&:hover .smartfilter-image-overlay":
                                                {
                                                    opacity:
                                                        1
                                                }
                                            }}

                                        >

                                            <Box

                                                component="img"

                                                src={
                                                    imageData.image
                                                }

                                                alt="Part pictorial"

                                                sx={{
                                                    width:
                                                        "100%",

                                                    height:
                                                        "100%",

                                                    objectFit:
                                                        "contain"
                                                }}

                                            />


                                            <Box

                                                className="smartfilter-image-overlay"

                                                sx={{
                                                    position:
                                                        "absolute",

                                                    inset:
                                                        0,

                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    justifyContent:
                                                        "center",

                                                    backgroundColor:
                                                        "rgba(15,23,42,0.55)",

                                                    opacity:
                                                        0,

                                                    transition:
                                                        "opacity 0.2s ease"
                                                }}

                                            >

                                                <ZoomInIcon
                                                    sx={{
                                                        color:
                                                            "#FFFFFF"
                                                    }}
                                                />

                                            </Box>

                                        </Box>

                                    );

                                }

                        };

                    }


                    /*
                    =================================================
                    NORMAL COLUMN
                    =================================================
                    */

                    const calculatedWidth =
                        Math.max(
                            180,
                            Math.min(
                                300,
                                column.length * 10
                            )
                        );


                    return {

                        field:
                            column,

                        headerName:
                            column,

                        width:
                            calculatedWidth,

                        minWidth:
                            180,

                        maxWidth:
                            450,

                        sortable:
                            true,

                        resizable:
                            true,


                        /*
                        =================================================
                        COLUMN HEADER
                        =================================================

                        If header is too long,
                        it wraps.

                        Clicking it opens
                        the complete name.
                        */

                        renderHeader:
                            () => (

                                <Box

                                    onClick={() =>
                                        handleCellClick(
                                            "Column Name",
                                            column
                                        )
                                    }

                                    title="Click to view full column name"

                                    sx={{
                                        width:
                                            "100%",

                                        height:
                                            "100%",

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        whiteSpace:
                                            "normal",

                                        overflow:
                                            "hidden",

                                        wordBreak:
                                            "break-word",

                                        overflowWrap:
                                            "anywhere",

                                        lineHeight:
                                            1.2,

                                        fontWeight:
                                            700,

                                        color:
                                            "#334155",

                                        cursor:
                                            "pointer",

                                        "&:hover":
                                        {
                                            color:
                                                "#2563EB"
                                        }
                                    }}

                                >

                                    {
                                        column
                                    }

                                </Box>

                            ),


                        /*
                        =================================================
                        NORMAL CELL
                        =================================================

                        Long values can be clicked.
                        */

                        renderCell:
                            (params) => {

                                const value =
                                    params.value ??
                                    "";


                                if (
                                    String(
                                        value
                                    ).trim() === ""
                                ) {

                                    return null;

                                }


                                return (

                                    <Box

                                        onClick={() =>
                                            handleCellClick(
                                                column,
                                                value
                                            )
                                        }

                                        title="Click to view full value"

                                        sx={{
                                            width:
                                                "100%",

                                            overflow:
                                                "hidden",

                                            textOverflow:
                                                "ellipsis",

                                            whiteSpace:
                                                "nowrap",

                                            cursor:
                                                "pointer",

                                            borderRadius:
                                                "4px",

                                            px:
                                                0.5,

                                            py:
                                                0.25,

                                            "&:hover":
                                            {
                                                backgroundColor:
                                                    "#EFF6FF",

                                                color:
                                                    "#1D4ED8"
                                            }
                                        }}

                                    >

                                        {
                                            String(
                                                value
                                            )
                                        }

                                    </Box>

                                );

                            }

                    };

                }
            );

        }, [
            safeColumns,
            imageMap
        ]);


    /*
    =========================================================
    DATAGRID ROWS
    =========================================================
    */

    const rows =
        useMemo(() => {

            return filteredRows.map(
                (
                    row,
                    index
                ) => ({

                    id:
                        row.__smartFilterRowId ??
                        index,

                    ...row

                })
            );

        }, [
            filteredRows
        ]);


    /*
    =========================================================
    ACTIVE FILTERS
    =========================================================
    */

    const hasActiveFilters =
        Boolean(
            globalSearch
        ) ||
        Boolean(
            selectedColumn
        ) ||
        Boolean(
            columnSearch
        ) ||
        advancedFilters.length > 0;


    /*
    =========================================================
    CLEAR FILTERS
    =========================================================
    */

    const handleClearFilters =
        () => {

            setGlobalSearch("");

            setSelectedColumn("");

            setColumnSearch("");

            setAdvancedFilters([]);

        };


    /*
    =========================================================
    NO DATA
    =========================================================
    */

    if (
        !data ||
        !safeRows.length
    ) {

        return (

            <Box
                sx={{
                    py: 6,

                    textAlign:
                        "center"
                }}
            >

                <Typography
                    variant="h6"
                    color="text.secondary"
                >

                    No data found in the
                    uploaded file.

                </Typography>

            </Box>

        );

    }


    /*
    =========================================================
    MAIN UI
    =========================================================
    */

    return (

        <Box
            sx={{
                width:
                    "100%"
            }}
        >

            {/* ================================================= */}
            {/* SMART FILTER */}
            {/* ================================================= */}

            <SmartFilter

                data={
                    data
                }

                globalSearch={
                    globalSearch
                }

                setGlobalSearch={
                    setGlobalSearch
                }

                selectedColumn={
                    selectedColumn
                }

                setSelectedColumn={
                    setSelectedColumn
                }

                columnSearch={
                    columnSearch
                }

                setColumnSearch={
                    setColumnSearch
                }

                advancedFilters={
                    advancedFilters
                }

                setAdvancedFilters={
                    setAdvancedFilters
                }

            />


            {/* ================================================= */}
            {/* SEARCH RESULTS HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    alignItems:
                        "center",

                    flexWrap:
                        "wrap",

                    gap:
                        2,

                    mt:
                        4,

                    mb:
                        2
                }}
            >

                <Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                700,

                            color:
                                "#0F172A"
                        }}
                    >

                        Search Results

                    </Typography>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >

                        Showing{" "}

                        <strong>
                            {
                                rows.length
                            }
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {
                                safeRows.length
                            }
                        </strong>

                        {" "}rows

                    </Typography>

                </Box>


                <Button

                    variant="outlined"

                    color="error"

                    size="small"

                    startIcon={
                        <ClearIcon />
                    }

                    disabled={
                        !hasActiveFilters
                    }

                    onClick={
                        handleClearFilters
                    }

                >

                    Clear Filters

                </Button>

            </Box>


            {/* ================================================= */}
            {/* DATA GRID */}
            {/* ================================================= */}

            <Box
                sx={{
                    width:
                        "100%",

                    height:
                        620,

                    overflow:
                        "hidden",

                    "& .MuiDataGrid-root":
                    {
                        border:
                            "1px solid #E2E8F0",

                        borderRadius:
                            2,

                        backgroundColor:
                            "#FFFFFF"
                    },

                    /*
                    HEADER
                    */

                    "& .MuiDataGrid-columnHeaders":
                    {
                        backgroundColor:
                            "#F8FAFC",

                        minHeight:
                            "76px !important",

                        maxHeight:
                            "110px !important"
                    },

                    "& .MuiDataGrid-columnHeader":
                    {
                        overflow:
                            "visible",

                        whiteSpace:
                            "normal",

                        padding:
                            "8px 12px"
                    },

                    "& .MuiDataGrid-columnHeaderTitleContainer":
                    {
                        overflow:
                            "visible",

                        whiteSpace:
                            "normal"
                    },

                    "& .MuiDataGrid-columnHeaderTitle":
                    {
                        overflow:
                            "visible",

                        textOverflow:
                            "clip",

                        whiteSpace:
                            "normal",

                        lineHeight:
                            1.2,

                        fontWeight:
                            700,

                        color:
                            "#334155"
                    },

                    /*
                    CELLS
                    */

                    "& .MuiDataGrid-cell":
                    {
                        borderColor:
                            "#F1F5F9"
                    },

                    "& .MuiDataGrid-row:hover":
                    {
                        backgroundColor:
                            "#F8FAFC"
                    },

                    /*
                    FOOTER
                    */

                    "& .MuiDataGrid-footerContainer":
                    {
                        borderTop:
                            "1px solid #E2E8F0"
                    }

                }}
            >

                <DataGrid

                    rows={
                        rows
                    }

                    columns={
                        columns
                    }

                    disableRowSelectionOnClick

                    rowHeight={
                        72
                    }

                    columnHeaderHeight={
                        82
                    }

                    pageSizeOptions={[
                        10,
                        25,
                        50,
                        100
                    ]}

                    initialState={{
                        pagination:
                        {
                            paginationModel:
                            {
                                pageSize:
                                    25,

                                page:
                                    0
                            }
                        }
                    }}

                />

            </Box>


            {/* ================================================= */}
            {/* FULL CELL / COLUMN NAME DIALOG */}
            {/* ================================================= */}

            <Dialog

                open={
                    Boolean(
                        selectedCell
                    )
                }

                onClose={
                    handleCloseCell
                }

                maxWidth="md"

                fullWidth

            >

                <DialogTitle
                    sx={{
                        p:
                            2.5,

                        display:
                            "flex",

                        alignItems:
                            "flex-start",

                        justifyContent:
                            "space-between",

                        borderBottom:
                            "1px solid #E2E8F0"
                    }}
                >

                    <Box>

                        <Typography
                            sx={{
                                fontSize:
                                    12,

                                fontWeight:
                                    700,

                                color:
                                    "#64748B",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.06em",

                                mb:
                                    0.5
                            }}
                        >

                            {
                                selectedCell?.column ===
                                "Column Name"
                                    ? "Column Name"
                                    : "Cell Value"
                            }

                        </Typography>


                        <Typography
                            sx={{
                                fontSize:
                                    18,

                                fontWeight:
                                    700,

                                color:
                                    "#0F172A",

                                wordBreak:
                                    "break-word"
                            }}
                        >

                            {
                                selectedCell?.column
                            }

                        </Typography>

                    </Box>


                    <IconButton
                        onClick={
                            handleCloseCell
                        }

                        sx={{
                            ml:
                                2
                        }}
                    >

                        <CloseIcon />

                    </IconButton>

                </DialogTitle>


                <DialogContent
                    sx={{
                        backgroundColor:
                            "#F8FAFC",

                        p:
                            3
                    }}
                >

                    <Box
                        sx={{
                            backgroundColor:
                                "#FFFFFF",

                            border:
                                "1px solid #E2E8F0",

                            borderRadius:
                                2,

                            p:
                                3,

                            mt:
                                1
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize:
                                    13,

                                fontWeight:
                                    700,

                                color:
                                    "#64748B",

                                mb:
                                    1
                            }}
                        >

                            Full Value

                        </Typography>


                        <Divider
                            sx={{
                                mb:
                                    2
                            }}
                        />


                        <Typography
                            sx={{
                                fontSize:
                                    17,

                                fontWeight:
                                    500,

                                lineHeight:
                                    1.7,

                                color:
                                    "#0F172A",

                                whiteSpace:
                                    "pre-wrap",

                                overflowWrap:
                                    "anywhere",

                                wordBreak:
                                    "break-word"
                            }}
                        >

                            {
                                selectedCell?.value
                            }

                        </Typography>

                    </Box>

                </DialogContent>

            </Dialog>


            {/* ================================================= */}
            {/* IMAGE PREVIEW */}
            {/* ================================================= */}

            <Dialog

                open={
                    Boolean(
                        selectedImage
                    )
                }

                onClose={() =>
                    setSelectedImage(
                        null
                    )
                }

                maxWidth="md"

                fullWidth

            >

                <DialogTitle
                    sx={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "space-between",

                        fontWeight:
                            700,

                        color:
                            "#0F172A",

                        borderBottom:
                            "1px solid #E2E8F0"
                    }}
                >

                    Part Pictorial


                    <IconButton

                        onClick={() =>
                            setSelectedImage(
                                null
                            )
                        }

                    >

                        <CloseIcon />

                    </IconButton>

                </DialogTitle>


                <DialogContent
                    sx={{
                        minHeight:
                            400,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        backgroundColor:
                            "#F8FAFC",

                        p:
                            3
                    }}
                >

                    {
                        selectedImage && (

                            <Box

                                component="img"

                                src={
                                    selectedImage
                                }

                                alt="Part pictorial"

                                sx={{
                                    maxWidth:
                                        "100%",

                                    maxHeight:
                                        "70vh",

                                    objectFit:
                                        "contain",

                                    border:
                                        "1px solid #E2E8F0",

                                    borderRadius:
                                        2,

                                    backgroundColor:
                                        "#FFFFFF"
                                }}

                            />

                        )
                    }

                </DialogContent>

            </Dialog>

        </Box>

    );

}


export default DataTable;