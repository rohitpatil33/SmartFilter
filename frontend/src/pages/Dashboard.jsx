import { useState } from "react";

import {
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Typography
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

import FileUpload from "../components/FileUpload";
import DataTable from "../components/DataTable";


function Dashboard() {

    /*
     * =====================================================
     * DATA
     * =====================================================
     */

    const [
        data,
        setData
    ] = useState(null);


    /*
     * =====================================================
     * NEW FILE
     * =====================================================
     */

    const handleNewFile = () => {

        setData(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F8FAFC"
            }}
        >

            {/* =====================================================
                TOP BRAND HEADER
                ===================================================== */}

            <Box
                sx={{
                    backgroundColor: "#FFFFFF",
                    borderBottom:
                        "1px solid #E2E8F0",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000
                }}
            >

                <Container
                    maxWidth="xl"
                    sx={{
                        py: 1.5
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: 2
                        }}
                    >

                        {/* =================================================
                            SMARTFILTER LOGO
                            ================================================= */}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                minWidth: 0
                            }}
                        >

                            {/* SF MARK */}

                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    flexShrink: 0,
                                    borderRadius: 1.5,
                                    background:
                                        "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent:
                                        "center",
                                    fontWeight: 800,
                                    fontSize: 17,
                                    letterSpacing:
                                        "-0.5px",
                                    boxShadow:
                                        "0 4px 10px rgba(37, 99, 235, 0.20)"
                                }}
                            >
                                SF
                            </Box>


                            {/* BRAND NAME */}

                            <Box
                                sx={{
                                    minWidth: 0
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: {
                                            xs: 19,
                                            sm: 22
                                        },
                                        lineHeight: 1,
                                        color:
                                            "#0F172A",
                                        letterSpacing:
                                            "-0.5px"
                                    }}
                                >
                                    SmartFilter
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color:
                                            "#64748B",
                                        display: {
                                            xs:
                                                "none",
                                            sm:
                                                "block"
                                        },
                                        mt: 0.4,
                                        fontWeight:
                                            500
                                    }}
                                >
                                    Enterprise Data Search
                                </Typography>

                            </Box>

                        </Box>


                        {/* =================================================
                            UPLOAD BUTTON
                            ================================================= */}

                        {data && (

                            <Button
                                variant="contained"
                                startIcon={
                                    <CloudUploadIcon />
                                }
                                onClick={
                                    handleNewFile
                                }
                                sx={{
                                    px: 2.2,
                                    py: 1.05,
                                    whiteSpace:
                                        "nowrap"
                                }}
                            >
                                Upload New File
                            </Button>

                        )}

                    </Box>

                </Container>

            </Box>


            {/* =====================================================
                MAIN CONTENT
                ===================================================== */}

            <Container
                maxWidth="xl"
                sx={{
                    py: {
                        xs: 3,
                        md: 4
                    }
                }}
            >

                {/* =================================================
                    WELCOME / PAGE HEADER
                    ================================================= */}

                <Box
                    sx={{
                        mb: 3
                    }}
                >

                    <Typography
                        variant="h4"
                        sx={{
                            color:
                                "#0F172A",
                            fontWeight:
                                800
                        }}
                    >
                        Data Workspace
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color:
                                "#64748B",
                            mt: 0.7,
                            maxWidth: 700
                        }}
                    >
                        Upload, search and analyze
                        your CSV and Excel datasets
                        using powerful filters.
                    </Typography>

                </Box>


                {/* =================================================
                    UPLOAD SCREEN
                    ================================================= */}

                {!data && (

                    <Paper
                        elevation={0}
                        sx={{
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: 3,
                            backgroundColor:
                                "#FFFFFF",
                            overflow:
                                "hidden"
                        }}
                    >

                        {/* TOP ACCENT */}

                        <Box
                            sx={{
                                height: 4,
                                background:
                                    "linear-gradient(90deg, #2563EB, #60A5FA)"
                            }}
                        />


                        <Box
                            sx={{
                                p: {
                                    xs: 3,
                                    sm: 5,
                                    md: 7
                                },
                                textAlign:
                                    "center"
                            }}
                        >

                            {/* UPLOAD ICON */}

                            <Box
                                sx={{
                                    width: 76,
                                    height: 76,
                                    mx: "auto",
                                    borderRadius:
                                        "50%",
                                    backgroundColor:
                                        "#EFF6FF",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    mb: 3
                                }}
                            >

                                <CloudUploadIcon
                                    sx={{
                                        fontSize: 38,
                                        color:
                                            "#2563EB"
                                    }}
                                />

                            </Box>


                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight:
                                        700,
                                    color:
                                        "#0F172A",
                                    mb: 1
                                }}
                            >
                                Upload your dataset
                            </Typography>


                            <Typography
                                variant="body1"
                                sx={{
                                    color:
                                        "#64748B",
                                    maxWidth:
                                        620,
                                    mx: "auto",
                                    lineHeight:
                                        1.7,
                                    mb: 4
                                }}
                            >
                                Upload a CSV or Excel
                                file to search,
                                filter and explore
                                your data.
                            </Typography>


                            {/* FILE UPLOAD */}

                            <FileUpload
                                onUpload={
                                    setData
                                }
                            />


                            {/* SUPPORTED FORMATS */}

                            <Box
                                sx={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "center",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                    flexWrap:
                                        "wrap",
                                    mt: 3
                                }}
                            >

                                <Chip
                                    label="CSV"
                                    size="small"
                                    variant="outlined"
                                />

                                <Chip
                                    label="XLS"
                                    size="small"
                                    variant="outlined"
                                />

                                <Chip
                                    label="XLSX"
                                    size="small"
                                    variant="outlined"
                                />

                            </Box>

                        </Box>

                    </Paper>

                )}


                {/* =================================================
                    FILE INFORMATION
                    ================================================= */}

                {data && (

                    <Paper
                        elevation={0}
                        sx={{
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: 3,
                            backgroundColor:
                                "#FFFFFF",
                            mb: 3,
                            overflow:
                                "hidden"
                        }}
                    >

                        {/* FILE CARD HEADER */}

                        <Box
                            sx={{
                                p: {
                                    xs: 2.5,
                                    md: 3
                                }
                            }}
                        >

                            <Box
                                sx={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    gap: 3,
                                    flexWrap:
                                        "wrap"
                                }}
                            >

                                {/* FILE NAME */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: 2,
                                        minWidth:
                                            0
                                    }}
                                >

                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            flexShrink: 0,
                                            borderRadius: 2,
                                            backgroundColor:
                                                "#EFF6FF",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center"
                                        }}
                                    >

                                        <DescriptionOutlinedIcon
                                            sx={{
                                                color:
                                                    "#2563EB",
                                                fontSize:
                                                    25
                                            }}
                                        />

                                    </Box>


                                    <Box
                                        sx={{
                                            minWidth:
                                                0
                                        }}
                                    >

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color:
                                                    "#64748B",
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            CURRENT DATASET
                                        </Typography>


                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight:
                                                    700,
                                                color:
                                                    "#0F172A",
                                                wordBreak:
                                                    "break-word"
                                            }}
                                        >
                                            {
                                                data.filename
                                            }
                                        </Typography>

                                    </Box>

                                </Box>


                                {/* DATASET STATS */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        gap: 1,
                                        flexWrap:
                                            "wrap"
                                    }}
                                >

                                    <Chip
                                        icon={
                                            <TableRowsOutlinedIcon />
                                        }
                                        label={`${data.totalRows} Rows`}
                                        color="primary"
                                        variant="outlined"
                                    />

                                    <Chip
                                        icon={
                                            <ViewColumnOutlinedIcon />
                                        }
                                        label={`${data.columns.length} Columns`}
                                        variant="outlined"
                                    />

                                </Box>

                            </Box>

                        </Box>

                    </Paper>

                )}


                {/* =================================================
                    DATA TABLE
                    ================================================= */}

                {data && (

                    <Paper
                        elevation={0}
                        sx={{
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: 3,
                            backgroundColor:
                                "#FFFFFF",
                            overflow:
                                "hidden"
                        }}
                    >

                        <Box
                            sx={{
                                p: {
                                    xs: 2,
                                    md: 3
                                }
                            }}
                        >

                            <DataTable
                                data={data}
                            />

                        </Box>

                    </Paper>

                )}

            </Container>


            {/* =====================================================
                FOOTER
                ===================================================== */}

            <Box
                sx={{
                    borderTop:
                        "1px solid #E2E8F0",
                    backgroundColor:
                        "#FFFFFF",
                    mt: 4
                }}
            >

                <Container
                    maxWidth="xl"
                    sx={{
                        py: 2
                    }}
                >

                    <Box
                        sx={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            gap: 2,
                            flexWrap:
                                "wrap"
                        }}
                    >

                        <Box
                            sx={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: 1
                            }}
                        >

                            <StorageOutlinedIcon
                                sx={{
                                    fontSize: 18,
                                    color:
                                        "#64748B"
                                }}
                            />

                            <Typography
                                variant="caption"
                                sx={{
                                    color:
                                        "#64748B"
                                }}
                            >
                                SmartFilter
                            </Typography>

                        </Box>


                        <Typography
                            variant="caption"
                            sx={{
                                color:
                                    "#94A3B8"
                            }}
                        >
                            Enterprise Data Search
                            & Analysis Platform
                        </Typography>

                    </Box>

                </Container>

            </Box>

        </Box>
    );
}


export default Dashboard;