import Axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { FormEvent, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/router";

export default function Create() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState<Partial<any>>({});

  const router = useRouter();

  const submitSubs = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post("/subs", {
        name,
        title,
        description,
      });

      router.push(`/r/${res.data.name}`);
    } catch (err) {
      console.log(err);
      setError(err.response.data);
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>Create a community</title>
      </Head>

      <div
        className="w-36 h-screen bg-center bg-cover"
        style={{ backgroundImage: "url('../image/bricks.jpg')" }}
      ></div>
      <div className="flex flex-col justify-center pl-6">
        <div className="w-96">
          <h1 className="mb-2 text-lg font-medium"> Create a Community</h1>

          <hr />
          <form onSubmit={submitSubs}>
            <div className="my-6">
              <p className="font-medium">Name</p>
              <p className="text-xs text-gray-500 mb-2">
                Community names including Capitalization cannot be changed.
              </p>
              <input
                type="text"
                className={classNames(
                  "p-2 w-full border border-gray-200 rounded hover:border-gray-500",
                  { "border-red-600": error.name }
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-red-600 font-medium">{error.name}</p>
            </div>
            <div className="my-6">
              <p className="font-medium">Title</p>
              <p className="text-xs text-gray-500 mb-2">
                Community names represents the topic and you can change it
                anytime.
              </p>
              <input
                type="text"
                className={classNames(
                  "p-2 w-full border border-gray-200 rounded hover:border-gray-500",
                  { "border-red-600": error.title }
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-red-600 font-medium">{error.title}</p>
            </div>
            <div className="my-6">
              <p className="font-medium">Description</p>
              <p className="text-xs text-gray-500 mb-2">
                This is how new members come to understand your community
              </p>
              <textarea
                className={classNames(
                  "p-2 w-full border border-gray-200 rounded hover:border-gray-500",
                  { "border-red-600": error.description }
                )}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-red-600 font-medium">{error.description}</p>
            </div>
            <div className="flex justify-end">
              <button className="button rounded capitalize bg-blue-500 text-white font-semibold px-4 py-1">
                Create community
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      // If the auth token cookie is missing, perform a redirect to the login page
      return {
        redirect: {
          destination: "/login",
          permanent: false, // Set this to true if the redirect should be considered permanent
        },
      };
    }

    // Check if the auth token is valid by making a request to "/auth/me"
    await Axios.get("/auth/me", { headers: { cookie } });

    // If the auth token is valid, return an empty object as props
    return { props: {} };
  } catch (err) {
    // If there's an error, perform a redirect to the login page
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
