"use client";

import { useSession } from "@/context/session";
import { useTransitionRouter } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { Button } from "../shared/buttons/button";
import { getApiBase } from "../util";

export type FormData = {
  user: string;
  apiKey: string;
};

export const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();
  const router = useTransitionRouter();
  const session = useSession();

  async function onLogin(data: FormData) {
    try {
      const result = await fetch(`${getApiBase()}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-API-KEY": `${data.apiKey}:${data.user}`,
        },
      });
      const response = await result.json();
      if (response.token) {
        session?.login({ token: response.token, user: data.user });
        router.push("/dashboard");
      }
    } catch (e) {
      console.log("Error:", e);
    }
  }

  return (
    <form onSubmit={handleSubmit(onLogin)}>
      <div className="mb-5">
        <label htmlFor="user">Username</label>
        <input
          type="user"
          placeholder="Username"
          className="login_text_input"
          {...register("user", { required: true })}
        />
      </div>
      <div className="mb-10">
        <label htmlFor="name">Password</label>
        <input
          type="password"
          placeholder="Api Key"
          className="login_text_input"
          {...register("apiKey", { required: true })}
        />
      </div>
      <Button
        label="Login"
        loading={isSubmitting}
        display={{ type: "primary", size: "lg", className: "w-full" }}
        onClick={handleSubmit(onLogin)}
      />
    </form>
  );
};

export default SignInForm;
