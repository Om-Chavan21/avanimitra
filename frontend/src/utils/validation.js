export const validateFullName = (name) => {
    if (!name) {
        return "Full name is required";
    }
    if (name.length < 4) {
        return "Full name must be at least 4 characters";
    }
    if (name.split(" ").length < 2) {
        return "Please enter your full name (first and last name)";
    }
    return "";
};

export const validateWhatsAppNumber = (number) => {
    if (!number) {
        return "WhatsApp number is required";
    }
    if (number.length !== 10) {
        return "Please enter a valid 10-digit number";
    }
    return "";
};

export const validateAddress = (address) => {
    if (!address) {
        return "Address is required";
    }
    return "";
};

export const validateAreaOfResidence = (area) => {
    if (!area) {
        return "Area of residence is required";
    }
    return "";
};
