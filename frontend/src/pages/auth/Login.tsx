"use client ";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { APP_LOGO } from "@/lib/constants";
import CustomInput from "@/components/CustomInput";
import { Loading03Icon } from "hugeicons-react";
import React from "react";
import { AuthLogin } from "../../../api/auth/auth";
import { useCookies } from "react-cookie";
import { useAppDispatch } from "@/redux/hooks";
import { authenticate } from "@/redux/features/auth/authSlice";

const authLoginSchema = z.object({
  email: z.string().min(2, {
    message: "Email is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [_, setCookie] = useCookies(["token"]);
  const authDispatch = useAppDispatch();

  const authLoginForm = useForm<z.infer<typeof authLoginSchema>>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data: z.infer<typeof authLoginSchema>) => {
    setIsLoading(!isLoading);
    const response = AuthLogin({
      email: data.email,
      password: data.password,
    }).then((res) => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      if (res) {
        setCookie("token", res.token, { path: "/" });
        console.log(res);
        authDispatch(
          authenticate({
            token: res.token,
            email: res.email,
            name: res.name,
          })
        );

        window.location.href = "/";
      }
    });
    if (!response) {
      return;
    }
  };

  return (
    <div className="w-screen h-screen grid place-items-center bg-background p-2">
      <div className="grid place-items-center">
        <img src={APP_LOGO} alt="" className="w-16 h-16" />
        <div className="">
          <h1 className="mb-4 text-2xl font-bold">Administrator</h1>
          <Form {...authLoginForm}>
            <form
              onSubmit={authLoginForm.handleSubmit(onLogin)}
              className="w-full space-y-2"
            >
              <FormField
                control={authLoginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <CustomInput
                        {...field}
                        type="email"
                        className="w-[300px]"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={authLoginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <CustomInput
                        {...field}
                        type="password"
                        className="w-[300px]"
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loading03Icon
                    className={`h-4 w-4 ${isLoading && "animate-spin"}`}
                  />
                ) : (
                  "Log In"
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div></div>
      </div>
    </div>
  );
}
