import Sidebar from "@/components/Sidebar";
import { Post, Sub } from "@/types";
import Axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import useSWR from "swr";

export default function Submit() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const router = useRouter();

  const { sub: subName } = router.query;

  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);
  if (error) router.push("/");

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();

    if (title.trim() === "") return;

    try {
      const { data: post } = await Axios.post<Post>("/posts", {
        title: title.trim(),
        body,
        sub: sub?.name,
      });

      router.push(`/r/${sub?.name}/${post.identifier}/${post.slug}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container flex pt-5">
      <Head>
        <title>Submit to readit</title>
      </Head>
      <div className="w-160">
        <div className="p-4 bg-white rounded">
          <h1 className="mb-3 text-lg">Submit post to /r/{subName}</h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                placeholder="title"
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div
                className="absolute mb-2 text-sm text-gray-500 select-none focus:border-gray-600"
                style={{ top: 12, right: 10 }}
              >
                {title.trim().length}/300
              </div>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:outline-none 
            focus:border-gray-600"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="text(optional)"
              rows={4}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="button bg-blue-600 rounded px-3 py-1"
                type="submit"
                disabled={title.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {sub && <Sidebar sub={sub} />}
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   try {
//     const cookie = req.headers.cookie;
//     if (!cookie) throw new Error("Missing auth token choice");

//     await Axios.get("/auth/me", { headers: { cookie } });
// return { props: {} };
//   } catch (err) {
//     res.writeHead(307, { location: "/login" }).end();
//   }
// };

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
