import axios from "axios";

const API_URL = "http://localhost:8000"; // Update with your backend URL

const login = async (phoneNumber, password) => {
    const response = await axios.post(`${API_URL}/token`, {
        username: phoneNumber,
        password: password,
    });
    if (response.data.access_token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

export default {
    login,
    logout,
    getCurrentUser,
};
