import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordTextField = ({
    id,
    label,
    value,
    onChange,
    showPassword,
    handleClickShowPassword,
    handleMouseDownPassword,
    ...props
}) => {
    return (
        <TextField
            id={id}
            label={label}
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            required
            value={value}
            onChange={onChange}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...props}
        />
    );
};

export default PasswordTextField;
