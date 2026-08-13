import React from "react";
import ReactDOM from "react-dom/client";

import {
    createTheme,
    ThemeProvider
} from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";

import "./index.css";


/*
 * =========================================================
 * SMARTFILTER THEME
 * =========================================================
 */

const theme = createTheme({

    palette: {

        mode: "light",

        primary: {
            main: "#2563EB",
            dark: "#1D4ED8",
            light: "#60A5FA",
            contrastText: "#FFFFFF"
        },

        secondary: {
            main: "#64748B",
            dark: "#475569",
            light: "#94A3B8"
        },

        success: {
            main: "#16A34A"
        },

        warning: {
            main: "#D97706"
        },

        error: {
            main: "#DC2626"
        },

        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF"
        },

        text: {
            primary: "#0F172A",
            secondary: "#64748B"
        },

        divider: "#E2E8F0"
    },


    /*
     * =====================================================
     * TYPOGRAPHY
     * =====================================================
     */

    typography: {

        fontFamily:
            '"Roboto", "Helvetica", "Arial", sans-serif',

        h4: {
            fontWeight: 800,
            letterSpacing: "-0.5px"
        },

        h5: {
            fontWeight: 700,
            letterSpacing: "-0.3px"
        },

        h6: {
            fontWeight: 700
        },

        subtitle1: {
            fontWeight: 600
        },

        button: {
            textTransform: "none",
            fontWeight: 600
        }
    },


    /*
     * =====================================================
     * SHAPE
     * =====================================================
     */

    shape: {
        borderRadius: 10
    },


    /*
     * =====================================================
     * COMPONENT CUSTOMIZATION
     * =====================================================
     */

    components: {

        /*
         * BUTTON
         */

        MuiButton: {

            defaultProps: {
                disableElevation: true
            },

            styleOverrides: {

                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600
                }
            }
        },


        /*
         * PAPER
         */

        MuiPaper: {

            styleOverrides: {

                root: {
                    backgroundImage: "none"
                }
            }
        },


        /*
         * TEXT FIELD
         */

        MuiTextField: {

            defaultProps: {
                variant: "outlined"
            }
        },


        /*
         * OUTLINED INPUT
         */

        MuiOutlinedInput: {

            styleOverrides: {

                root: {

                    borderRadius: 8,

                    "&:hover .MuiOutlinedInput-notchedOutline":
                    {
                        borderColor:
                            "#94A3B8"
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                        borderColor:
                            "#2563EB"
                    }
                },

                notchedOutline: {
                    borderColor: "#CBD5E1"
                }
            }
        },


        /*
         * SELECT
         */

        MuiSelect: {

            styleOverrides: {

                root: {
                    borderRadius: 8
                }
            }
        },


        /*
         * CHIP
         */

        MuiChip: {

            styleOverrides: {

                root: {
                    borderRadius: 7,
                    fontWeight: 600
                }
            }
        },


        /*
         * DIALOG
         */

        MuiDialog: {

            styleOverrides: {

                paper: {
                    borderRadius: 14,
                    backgroundImage: "none"
                }
            }
        }
    }
});


/*
 * =========================================================
 * APPLICATION
 * =========================================================
 */

ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <React.StrictMode>

        <ThemeProvider
            theme={theme}
        >

            <CssBaseline />

            <App />

        </ThemeProvider>

    </React.StrictMode>
);