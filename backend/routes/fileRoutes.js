const express = require("express");
const multer = require("multer");

const {
    parseFile
} = require("../services/fileParser");


const router =
    express.Router();


/*
=========================================================
MULTER
=========================================================
*/

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            /*
            Maximum file size:
            100 MB
            */

            fileSize:
                100 * 1024 * 1024

        }

    });


/*
=========================================================
UPLOAD FILE
=========================================================
*/

router.post(
    "/upload",
    upload.single("file"),

    async (
        req,
        res
    ) => {

        try {

            /*
            =================================================
            VALIDATE FILE
            =================================================
            */

            if (!req.file) {

                return res
                    .status(400)
                    .json({

                        message:
                            "No file uploaded"

                    });

            }


            /*
            =================================================
            EXTENSION
            =================================================
            */

            const extension =
                req.file.originalname
                    .split(".")
                    .pop()
                    .toLowerCase();


            const allowedExtensions = [
                "csv",
                "xlsx",
                "xls",
                "jpg",
                "jpeg",
                "png",
                "webp"
            ];


            if (
                !allowedExtensions.includes(
                    extension
                )
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Unsupported file format. Please upload CSV, XLSX, XLS, JPG, JPEG, PNG or WEBP."

                    });

            }


            /*
            =================================================
            PARSE FILE
            =================================================
            */

            const result =
                await parseFile(
                    req.file
                );


            const rows =
                result?.rows || [];


            const images =
                result?.images || [];


            /*
            =================================================
            COLUMNS
            =================================================

            IMPORTANT:

            The updated fileParser.js already determines
            the real visible Excel columns.

            Therefore use result.columns first.

            We only fall back to Object.keys(rows[0])
            for compatibility with older parsers.
            =================================================
            */

            const columns =
                Array.isArray(
                    result?.columns
                )

                    ? result.columns

                    : (
                        rows.length > 0

                            ? Object.keys(
                                rows[0]
                            ).filter(
                                (column) =>
                                    !String(
                                        column
                                    ).startsWith(
                                        "__"
                                    )
                            )

                            : []
                    );


            /*
            =================================================
            MERGED CELLS
            =================================================

            XLSX parser returns merged cell information.

            CSV/XLS may return [].
            =================================================
            */

            const mergedCells =
                result?.mergedCells || [];


            /*
            =================================================
            RESPONSE
            =================================================
            */

            return res.json({

                filename:
                    req.file.originalname,

                fileType:
                    extension,

                totalRows:
                    rows.length,

                columns,

                rows,

                images,

                mergedCells

            });

        } catch (error) {

            console.error(
                "File upload error:",
                error
            );


            return res
                .status(500)
                .json({

                    message:
                        error.message ||
                        "Unable to process file"

                });

        }

    }
);


module.exports = router;