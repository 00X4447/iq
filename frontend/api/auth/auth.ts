"use server";

import { APP_API_ENDPOINT_URL } from "../api_endpoint";
import axios from "axios";

export const AuthLogin = async ({
  email = "",
  password = "",
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      `${APP_API_ENDPOINT_URL}/api/v1/admin/auth/login`,
      {
        email,
        password,
      }
    );
    if (response.status === 200) {
      return response.data;
    }
    return;
  } catch (error) {
    throw error;
  }
};
