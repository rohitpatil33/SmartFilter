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
    Paper
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TuneIcon from "@mui/icons-material/Tune";

function FilterPanel({
    data,
    globalSearch,
    setGlobalSearch,
    selectedColumn,
    setSelectedColumn,
    columnSearch,
    setColumnSearch
}) {

    const [activeFilter, setActiveFilter] = useState("global");

    return (
        <Box sx={{ mt: 3 }}>

            {/* ============================= */}
            {/* FILTER BUTTONS */}
            {/* ============================= */}

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#1e293b"
                }}
            >
                Search & Filter
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap"
                }}
            >

                {/* SEARCH ALL */}

                <Button
                    variant={
                        activeFilter === "global"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={<SearchIcon />}
                    onClick={() =>
                        setActiveFilter("global")
                    }
                >
                    Search All
                </Button>


                {/* COLUMN FILTER */}

                <Button
                    variant={
                        activeFilter === "column"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={<FilterAltIcon />}
                    onClick={() =>
                        setActiveFilter("column")
                    }
                >
                    Column Filter
                </Button>


                {/* ADVANCED FILTER */}

                <Button
                    variant={
                        activeFilter === "advanced"
                            ? "contained"
                            : "outlined"
                    }
                    startIcon={<TuneIcon />}
                    onClick={() =>
                        setActiveFilter("advanced")
                    }
                >
                    Advanced Filter
                </Button>

            </Box>


            {/* ============================= */}
            {/* FILTER CONTENT */}
            {/* ============================= */}

            <Paper
                elevation={0}
                sx={{
                    mt: 3,
                    p: 3,
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    backgroundColor: "#ffffff"
                }}
            >

                {/* ========================= */}
                {/* SEARCH ALL */}
                {/* ========================= */}

                {activeFilter === "global" && (

                    <Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            Search Entire File
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="Search anything across all columns..."
                            value={globalSearch}
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
                                                "text.secondary"
                                        }}
                                    />
                                )
                            }}
                        />

                    </Box>

                )}


                {/* ========================= */}
                {/* COLUMN FILTER */}
                {/* ========================= */}

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
                                    minWidth: 240
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
                                                key={column}
                                                value={column}
                                            >
                                                {column}
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>


                            <TextField
                                fullWidth
                                label="Search value"
                                placeholder="Enter value..."
                                disabled={
                                    !selectedColumn
                                }
                                value={columnSearch}
                                onChange={(event) =>
                                    setColumnSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </Box>

                    </Box>

                )}


                {/* ========================= */}
                {/* ADVANCED FILTER */}
                {/* ========================= */}

                {activeFilter === "advanced" && (

                    <Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            Advanced Filter
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Advanced filter builder will
                            be added in the next step.
                        </Typography>

                    </Box>

                )}

            </Paper>

        </Box>
    );
}

export default FilterPanel;