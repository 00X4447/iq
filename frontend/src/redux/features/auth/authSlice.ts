import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface authenticationState {
  token: string;
  email: string;
  name: string;
}

export const initialState: authenticationState = {
  token: "",
  email: "",
  name: "",
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    authenticate: (
      state,
      action: PayloadAction<{ token: string; email: string; name: string }>
    ) => {
      const { token, email, name } = action.payload;
      state.token = token;
      state.email = email;
      state.name = name;
    },
    logout: (state) => {
      state.token = "";
      state.email = "";
      state.name = "";
    },
  },
});

export const { authenticate, logout } = authenticationSlice.actions;
export default authenticationSlice.reducer;
