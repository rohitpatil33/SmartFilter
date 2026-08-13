import { useState } from "react";

import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    IconButton,
    Divider
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TuneIcon from "@mui/icons-material/Tune";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";


function SmartFilter({
    data,

    globalSearch,
    setGlobalSearch,

    selectedColumn,
    setSelectedColumn,

    columnSearch,
    setColumnSearch,

    advancedFilters,
    setAdvancedFilters
}) {

    const [activeFilter, setActiveFilter] =
        useState("global");


    /*
     * =====================================================
     * ADD ADVANCED FILTER
     * =====================================================
     */

    const handleAddFilter = () => {

        if (
            !data ||
            !data.columns ||
            data.columns.length === 0
        ) {
            return;
        }

        setAdvancedFilters((previous) => [

            ...previous,

            {
                id: Date.now(),

                column: data.columns[0],

                operator: "contains",

                value: "",

                from: "",

                to: ""
            }

        ]);
    };


    /*
     * =====================================================
     * REMOVE ADVANCED FILTER
     * =====================================================
     */

    const handleRemoveFilter = (id) => {

        setAdvancedFilters(
            (previous) =>
                previous.filter(
                    (filter) =>
                        filter.id !== id
                )
        );
    };


    /*
     * =====================================================
     * UPDATE ADVANCED FILTER
     * =====================================================
     */

    const handleUpdateFilter = (
        id,
        changes
    ) => {

        setAdvancedFilters(
            (previous) =>
                previous.map(
                    (filter) => {

                        if (
                            filter.id !== id
                        ) {
                            return filter;
                        }

                        return {
                            ...filter,
                            ...changes
                        };

                    }
                )
        );
    };


    /*
     * =====================================================
     * GET UNIQUE VALUES FOR CATEGORY
     * =====================================================
     */

    const getUniqueValues = (column) => {

        if (!data?.rows) {
            return [];
        }

        const values = data.rows
            .map(
                (row) =>
                    row[column]
            )
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            )
            .map(
                (value) =>
                    String(value)
            );

        return [
            ...new Set(values)
        ];
    };


    /*
     * =====================================================
     * TEXT FILTER
     * =====================================================
     */

    const renderTextFilter = (
        filter
    ) => {

        return (

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    width: "100%",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    }
                }}
            >

                <FormControl
                    sx={{
                        minWidth: {
                            xs: "100%",
                            md: 170
                        }
                    }}
                >

                    <InputLabel>
                        Condition
                    </InputLabel>

                    <Select
                        value={
                            filter.operator ||
                            "contains"
                        }
                        label="Condition"
                        onChange={(event) =>
                            handleUpdateFilter(
                                filter.id,
                                {
                                    operator:
                                        event.target.value
                                }
                            )
                        }
                    >

                        <MenuItem value="contains">
                            Contains
                        </MenuItem>

                        <MenuItem value="equals">
                            Equals
                        </MenuItem>

                        <MenuItem value="startsWith">
                            Starts With
                        </MenuItem>

                        <MenuItem value="endsWith">
                            Ends With
                        </MenuItem>

                    </Select>

                </FormControl>


                <TextField
                    fullWidth
                    label="Search Value"
                    placeholder="Enter value..."
                    value={
                        filter.value || ""
                    }
                    onChange={(event) =>
                        handleUpdateFilter(
                            filter.id,
                            {
                                value:
                                    event.target.value
                            }
                        )
                    }
                />

            </Box>
        );
    };


    /*
     * =====================================================
     * NUMBER FILTER
     * =====================================================
     */

    const renderNumberFilter = (
        filter
    ) => {

        return (

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    width: "100%",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    }
                }}
            >

                <FormControl
                    sx={{
                        minWidth: {
                            xs: "100%",
                            md: 180
                        }
                    }}
                >

                    <InputLabel>
                        Condition
                    </InputLabel>

                    <Select
                        value={
                            filter.operator ||
                            "equals"
                        }
                        label="Condition"
                        onChange={(event) =>
                            handleUpdateFilter(
                                filter.id,
                                {
                                    operator:
                                        event.target.value
                                }
                            )
                        }
                    >

                        <MenuItem value="equals">
                            Equals (=)
                        </MenuItem>

                        <MenuItem value="greaterThan">
                            Greater Than (&gt;)
                        </MenuItem>

                        <MenuItem value="greaterThanOrEqual">
                            Greater Than or Equal (&gt;=)
                        </MenuItem>

                        <MenuItem value="lessThan">
                            Less Than (&lt;)
                        </MenuItem>

                        <MenuItem value="lessThanOrEqual">
                            Less Than or Equal (&lt;=)
                        </MenuItem>

                    </Select>

                </FormControl>


                <TextField
                    fullWidth
                    type="number"
                    label="Value"
                    placeholder="Enter number..."
                    value={
                        filter.value ?? ""
                    }
                    onChange={(event) =>
                        handleUpdateFilter(
                            filter.id,
                            {
                                value:
                                    event.target.value
                            }
                        )
                    }
                />

            </Box>
        );
    };


    /*
     * =====================================================
     * CATEGORY FILTER
     * =====================================================
     */

    const renderCategoryFilter = (
        filter
    ) => {

        const values =
            getUniqueValues(
                filter.column
            );

        return (

            <FormControl
                fullWidth
            >

                <InputLabel>
                    Value
                </InputLabel>

                <Select
                    value={
                        filter.value || ""
                    }
                    label="Value"
                    onChange={(event) =>
                        handleUpdateFilter(
                            filter.id,
                            {
                                operator:
                                    "equals",

                                value:
                                    event.target.value
                            }
                        )
                    }
                >

                    <MenuItem value="">
                        All
                    </MenuItem>

                    {values.map(
                        (value) => (

                            <MenuItem
                                key={value}
                                value={value}
                            >
                                {value}
                            </MenuItem>

                        )
                    )}

                </Select>

            </FormControl>
        );
    };


    /*
     * =====================================================
     * DATE FILTER
     * =====================================================
     */

    const renderDateFilter = (
        filter
    ) => {

        return (

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    width: "100%",
                    flexDirection: {
                        xs: "column",
                        md: "row"
                    }
                }}
            >

                <TextField
                    fullWidth
                    type="date"
                    label="From Date"
                    InputLabelProps={{
                        shrink: true
                    }}
                    value={
                        filter.from || ""
                    }
                    onChange={(event) =>
                        handleUpdateFilter(
                            filter.id,
                            {
                                from:
                                    event.target.value
                            }
                        )
                    }
                />

                <TextField
                    fullWidth
                    type="date"
                    label="To Date"
                    InputLabelProps={{
                        shrink: true
                    }}
                    value={
                        filter.to || ""
                    }
                    onChange={(event) =>
                        handleUpdateFilter(
                            filter.id,
                            {
                                to:
                                    event.target.value
                            }
                        )
                    }
                />

            </Box>
        );
    };


    /*
     * =====================================================
     * DETECT FILTER TYPE
     * =====================================================
     */

    const getColumnType = (
        column
    ) => {

        if (
            !data?.rows ||
            !column
        ) {
            return "text";
        }

        const values =
            data.rows
                .map(
                    (row) =>
                        row[column]
                )
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                );

        if (values.length === 0) {
            return "text";
        }


        /*
         * NUMBER
         */

        const allNumbers =
            values.every(
                (value) =>
                    !Number.isNaN(
                        Number(value)
                    )
            );

        if (allNumbers) {
            return "number";
        }


        /*
         * DATE
         */

        const allDates =
            values.every(
                (value) => {

                    const date =
                        new Date(value);

                    return !Number.isNaN(
                        date.getTime()
                    );
                }
            );

        if (allDates) {
            return "date";
        }


        /*
         * CATEGORY
         */

        const uniqueValues =
            new Set(
                values.map(
                    (value) =>
                        String(value)
                            .toLowerCase()
                            .trim()
                )
            );

        if (
            uniqueValues.size <= 20 &&
            uniqueValues.size <
                values.length * 0.5
        ) {
            return "category";
        }


        return "text";
    };


    /*
     * =====================================================
     * ADVANCED FILTER CONTROL
     * =====================================================
     */

    const renderFilterControl = (
        filter
    ) => {

        const type =
            getColumnType(
                filter.column
            );


        if (type === "number") {
            return renderNumberFilter(
                filter
            );
        }


        if (type === "category") {
            return renderCategoryFilter(
                filter
            );
        }


        if (type === "date") {
            return renderDateFilter(
                filter
            );
        }


        return renderTextFilter(
            filter
        );
    };


    return (

        <Box>

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <Box sx={{ mb: 2.5 }}>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: "#0f172a"
                    }}
                >
                    Search & Filter
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Choose how you want to search
                    your uploaded dataset.
                </Typography>

            </Box>


            {/* ================================================= */}
            {/* FILTER BUTTONS */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap"
                }}
            >

                <Button
                    variant={
                        activeFilter === "global"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={
                        <SearchIcon />
                    }
                    onClick={() =>
                        setActiveFilter(
                            "global"
                        )
                    }
                >
                    Search All
                </Button>


                <Button
                    variant={
                        activeFilter === "column"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={
                        <FilterAltIcon />
                    }
                    onClick={() =>
                        setActiveFilter(
                            "column"
                        )
                    }
                >
                    Column Filter
                </Button>


                <Button
                    variant={
                        activeFilter === "advanced"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={
                        <TuneIcon />
                    }
                    onClick={() =>
                        setActiveFilter(
                            "advanced"
                        )
                    }
                >
                    Advanced Filter
                </Button>

            </Box>


            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    mt: 3,
                    p: {
                        xs: 2,
                        md: 3
                    },
                    border:
                        "1px solid #e2e8f0",
                    borderRadius: 2.5
                }}
            >

                {/* ================================================= */}
                {/* GLOBAL SEARCH */}
                {/* ================================================= */}

                {activeFilter === "global" && (

                    <Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                mb: 1.5
                            }}
                        >
                            Search Entire File
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="Search anything across all columns..."
                            value={
                                globalSearch
                            }
                            onChange={(event) =>
                                setGlobalSearch(
                                    event.target.value
                                )
                            }
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon
                                        sx={{
                                            mr: 1,
                                            color:
                                                "#64748b"
                                        }}
                                    />
                                )
                            }}
                        />

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: "block",
                                mt: 1
                            }}
                        >
                            Searches every column
                            in the uploaded file.
                        </Typography>

                    </Box>

                )}


                {/* ================================================= */}
                {/* COLUMN SEARCH */}
                {/* ================================================= */}

                {activeFilter === "column" && (

                    <Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                mb: 2
                            }}
                        >
                            Search By Column
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexDirection: {
                                    xs: "column",
                                    md: "row"
                                }
                            }}
                        >

                            <FormControl
                                sx={{
                                    minWidth: {
                                        xs: "100%",
                                        md: 250
                                    }
                                }}
                            >

                                <InputLabel>
                                    Select Column
                                </InputLabel>

                                <Select
                                    value={
                                        selectedColumn
                                    }
                                    label="Select Column"
                                    onChange={(event) =>
                                        setSelectedColumn(
                                            event.target.value
                                        )
                                    }
                                >

                                    <MenuItem value="">
                                        Select Column
                                    </MenuItem>

                                    {data.columns.map(
                                        (column) => (

                                            <MenuItem
                                                key={
                                                    column
                                                }
                                                value={
                                                    column
                                                }
                                            >
                                                {column}
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>


                            <TextField
                                fullWidth
                                label="Search Value"
                                placeholder="Enter value to search..."
                                disabled={
                                    !selectedColumn
                                }
                                value={
                                    columnSearch
                                }
                                onChange={(event) =>
                                    setColumnSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </Box>

                    </Box>

                )}


                {/* ================================================= */}
                {/* ADVANCED FILTER */}
                {/* ================================================= */}

                {activeFilter === "advanced" && (

                    <Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                gap: 2,
                                mb: 2,
                                flexWrap:
                                    "wrap"
                            }}
                        >

                            <Box>

                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    Advanced Filters
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Combine multiple
                                    conditions to find
                                    exactly what you need.
                                </Typography>

                            </Box>


                            <Button
                                variant="contained"
                                startIcon={
                                    <AddIcon />
                                }
                                onClick={
                                    handleAddFilter
                                }
                            >
                                Add Filter
                            </Button>

                        </Box>


                        {/* NO FILTERS */}

                        {advancedFilters.length === 0 && (

                            <Box
                                sx={{
                                    py: 5,
                                    textAlign:
                                        "center",
                                    border:
                                        "1px dashed #cbd5e1",
                                    borderRadius: 2,
                                    backgroundColor:
                                        "#f8fafc"
                                }}
                            >

                                <TuneIcon
                                    sx={{
                                        fontSize: 42,
                                        color:
                                            "#94a3b8",
                                        mb: 1
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    No filters added
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Click Add Filter
                                    to create your
                                    first condition.
                                </Typography>

                            </Box>

                        )}


                        {/* FILTERS */}

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: 1.5
                            }}
                        >

                            {advancedFilters.map(
                                (
                                    filter,
                                    index
                                ) => (

                                    <Paper
                                        key={
                                            filter.id
                                        }
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border:
                                                "1px solid #e2e8f0",
                                            borderRadius: 2
                                        }}
                                    >

                                        <Box
                                            sx={{
                                                display:
                                                    "flex",
                                                gap: 1.5,
                                                alignItems:
                                                    "center",
                                                flexDirection: {
                                                    xs:
                                                        "column",
                                                    md:
                                                        "row"
                                                }
                                            }}
                                        >

                                            {/* FILTER NUMBER */}

                                            <Box
                                                sx={{
                                                    minWidth: 30,
                                                    height: 30,
                                                    borderRadius:
                                                        "50%",
                                                    backgroundColor:
                                                        "#eff6ff",
                                                    color:
                                                        "#2563eb",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    fontWeight:
                                                        600
                                                }}
                                            >
                                                {index + 1}
                                            </Box>


                                            {/* COLUMN */}

                                            <FormControl
                                                sx={{
                                                    minWidth: {
                                                        xs:
                                                            "100%",
                                                        md:
                                                            220
                                                    }
                                                }}
                                            >

                                                <InputLabel>
                                                    Column
                                                </InputLabel>

                                                <Select
                                                    value={
                                                        filter.column
                                                    }
                                                    label="Column"
                                                    onChange={(event) =>
                                                        handleUpdateFilter(
                                                            filter.id,
                                                            {
                                                                column:
                                                                    event.target.value,

                                                                operator:
                                                                    "contains",

                                                                value:
                                                                    "",

                                                                from:
                                                                    "",

                                                                to:
                                                                    ""
                                                            }
                                                        )
                                                    }
                                                >

                                                    {data.columns.map(
                                                        (column) => (

                                                            <MenuItem
                                                                key={
                                                                    column
                                                                }
                                                                value={
                                                                    column
                                                                }
                                                            >
                                                                {
                                                                    column
                                                                }
                                                            </MenuItem>

                                                        )
                                                    )}

                                                </Select>

                                            </FormControl>


                                            {/* CONDITION */}

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    width:
                                                        "100%"
                                                }}
                                            >

                                                {renderFilterControl(
                                                    filter
                                                )}

                                            </Box>


                                            {/* DELETE */}

                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleRemoveFilter(
                                                        filter.id
                                                    )
                                                }
                                            >

                                                <DeleteOutlineIcon />

                                            </IconButton>

                                        </Box>

                                    </Paper>

                                )
                            )}

                        </Box>


                        {advancedFilters.length > 1 && (

                            <>

                                <Divider
                                    sx={{
                                        my: 2
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    All conditions are
                                    applied together
                                    using AND logic.
                                </Typography>

                            </>

                        )}

                    </Box>

                )}

            </Paper>

        </Box>
    );
}


export default SmartFilter;