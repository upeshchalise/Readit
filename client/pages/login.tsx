import Head from "next/head";
import React, { FormEvent, useState } from "react";
import Link from "next/link";
import Axios from "axios";
import { useRouter } from "next/router";
import { useAuthDispatch, useAuthState } from "../context/auth";

import InputGroup from "../components/InputGroup";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  const dispatch: any = useAuthDispatch();
  const { authenticated } = useAuthState();

  const router = useRouter();
  if (authenticated) router.push("/");

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post("/auth/login", {
        username,
        password,
      });

      // !!dispatch && dispatch({ type: "LOGIN", payload: res.data });
      dispatch("LOGIN", res.data);

      router.back();
    } catch (err: any) {
      setErrors(err.response.data);
    }
  };

  return (
    <>
      <div className="flex bg-white">
        <Head>
          <title>Login</title>
        </Head>

        <div
          className="w-36 h-screen bg-center bg-cover"
          style={{ backgroundImage: "url('./image/bricks.jpg')" }}
        ></div>

        <div className="flex flex-col justify-center pl-6">
          <div className="w-70">
            <h1 className="text-lg mb-2 font-medium">Login</h1>
            <p className="text-xs mb-10">
              By continuing, you agree to our User Agreement and Privacy Policy
            </p>
          </div>

          <form onSubmit={submitForm}>
            <InputGroup
              className="mb-2"
              type="text"
              value={username}
              setValue={setUsername}
              placeholder="USERNAME"
              error={errors.username}
            />

            <InputGroup
              className="mb-4"
              type="password"
              value={password}
              setValue={setPassword}
              placeholder="PASSWORD"
              error={errors.password}
            />

            <button className="bg-blue-600 rounded transition duration-200 text-white w-full uppercase py-3 mb-4 font-bold border border-blue-600">
              Login
            </button>

            <small>
              New to Readit?
              <Link href="/register" legacyBehavior>
                <a className="ml-1 text-blue-500 uppercase">Sign up</a>
              </Link>
            </small>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
