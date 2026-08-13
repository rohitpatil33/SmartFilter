require("dotenv").config();

const express = require("express");
const cors = require("cors");

const fileRoutes =
    require("./routes/fileRoutes");


const app =
    express();


/*
=========================================================
CONFIGURATION
=========================================================
*/

const PORT =
    process.env.PORT || 5000;


const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";


/*
=========================================================
CORS
=========================================================
*/

app.use(
    cors({
        origin: FRONTEND_URL,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/*
=========================================================
JSON
=========================================================
*/

app.use(
    express.json({
        limit: "10mb"
    })
);


/*
=========================================================
HEALTH CHECK
=========================================================
*/

app.get(
    "/",
    (req, res) => {

        res.json({

            status:
                "ok",

            application:
                "SmartFilter",

            message:
                "Enterprise Data Search & Analysis Platform",

            timestamp:
                new Date().toISOString()

        });

    }
);


/*
=========================================================
API ROUTES
=========================================================
*/

app.use(
    "/api/files",
    fileRoutes
);


/*
=========================================================
404
=========================================================
*/

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                "API endpoint not found"

        });

    }
);


/*
=========================================================
GLOBAL ERROR HANDLER
=========================================================
*/

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Internal server error"

        });

    }
);


/*
=========================================================
START SERVER
=========================================================
*/

app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "SmartFilter Backend"
        );

        console.log(
            "Enterprise Data Search & Analysis Platform"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Frontend allowed: ${FRONTEND_URL}`
        );

        console.log(
            "========================================"
        );

    }
);