import { useState } from "react";

import {
    Box,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { uploadFile } from "../services/api";


function FileUpload({ onUpload }) {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleFileChange =
        async (event) => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            setError("");

            setLoading(true);


            try {

                const result =
                    await uploadFile(
                        file
                    );

                onUpload(result);

            } catch (error) {

                console.error(
                    error
                );

                setError(
                    error?.response?.data
                        ?.message ||
                    "Unable to process the file."
                );

            } finally {

                setLoading(false);

                event.target.value = "";

            }
        };


    return (

        <Box>

            <Button
                component="label"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={
                    !loading && (
                        <CloudUploadIcon />
                    )
                }
                sx={{
                    px: 3,
                    py: 1.3
                }}
            >

                {loading ? (
                    <>
                        <CircularProgress
                            size={20}
                            sx={{
                                color:
                                    "#ffffff",
                                mr: 1
                            }}
                        />

                        Processing File...
                    </>
                ) : (
                    "Choose CSV / Excel File"
                )}


                <input
                    hidden
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={
                        handleFileChange
                    }
                />

            </Button>


            {error && (

                <Typography
                    color="error"
                    variant="body2"
                    sx={{
                        mt: 2
                    }}
                >
                    {error}
                </Typography>

            )}

        </Box>
    );
}


export default FileUpload;