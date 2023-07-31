import Head from "next/head";
import React, { FormEvent, useState } from "react";
import Link from "next/link";
import Axios from "axios";
import { useRouter } from "next/router";

import InputGroup from "../components/InputGroup";
import { useAuthState } from "../context/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();

  const router = useRouter();
  if (authenticated) router.push("/");

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();

    if (!agreement) {
      setErrors({ ...errors, agreement: `You must agree T&C's` });
      return;
    }

    try {
      await Axios.post("/auth/register", {
        email,
        username,
        password,
      });
      router.push("/login");
    } catch (err: any) {
      setErrors(err.response.data);
    }
  };

  return (
    <>
      <div className="flex bg-white">
        <Head>
          <title>Register</title>
        </Head>

        <div
          className="w-36 h-screen bg-center bg-cover"
          style={{ backgroundImage: "url('./image/bricks.jpg')" }}
        ></div>

        <div className="flex flex-col justify-center pl-6">
          <div className="w-70">
            <h1 className="text-lg mb-2 font-medium"> Sign Up</h1>
            <p className="text-xs mb-10">
              By continuing, you agree to our User Agreement and Privacy Policy
            </p>
          </div>

          <form onSubmit={submitForm}>
            <div className="mb-6">
              <input
                type="checkbox"
                id="agreement"
                className="mr-1 cursor-pointer"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-xs cursor-pointer">
                I agree to get emails about cool stuffs on Readit
              </label>
              <p className="text-red-600 text-sm">{errors.agreement}</p>
            </div>

            <InputGroup
              className="mb-2"
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="EMAIL"
              error={errors.email}
            />

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
              sign up
            </button>

            <small>
              Already a readitor?
              <Link href="/login" legacyBehavior>
                <a className="ml-1 text-blue-500 uppercase">Log in</a>
              </Link>
            </small>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
