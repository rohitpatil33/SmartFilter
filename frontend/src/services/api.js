import axios from "axios";


const API_URL =
    "http://localhost:5000/api";


export const uploadFile =
    async (file) => {

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );


        const response =
            await axios.post(
                `${API_URL}/files/upload`,
                formData
            );


        return response.data;
    };