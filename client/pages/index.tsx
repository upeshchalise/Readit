import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import Head from "next/head";
import dayjs from "dayjs"; //for time
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import PostCard from "@/components/PostCard";

import { Post, Sub } from "@/types";
dayjs.extend(relativeTime);

import { Fragment, useEffect, useState } from "react";
import { useAuthState } from "@/context/auth";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {
  //   Axios.get("/posts")
  //     .then((res) => setPosts(res.data))
  //     .catch((err) => console.log(err));
  // }, []);

  //fetch more post on scrolling -- infinite scrolling
  const [observedPost, setObservedPost] = useState("");

  // const { data: posts } = useSWR<Post[]>("/posts");
  const { data: topSubs } = useSWR<Sub[]>("/misc/top-subs");

  const title = `readit: the front page of the internet`;
  const description = `Reddit is the network of communities based on the poeple's interests. Find communities you're interested in, and become part of an online community.`;

  const { authenticated } = useAuthState();

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?pages=${index}`);

  const isInitialLoading = !data && !error;
  const posts: Post[] = data ? [].concat(...data) : [];

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const id = posts[posts.length - 1].identifier;

    if (id !== observedPost) {
      setObservedPost(id);
      observedElement(document.getElementById(id));
    }
  }, [posts]);

  const observedElement = (element: HTMLElement) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log(`reached the bottom of the post`);
          observer.unobserve(element);
          setPage(page + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  return (
    <>
      <Fragment>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="twitter:description" content={description} />
          <meta property="twitter:title" content={title} />
        </Head>

        <div className="container pt-4 flex">
          {/* postfeeds */}
          <div className="w-full px-4 md:p-0 md:w-160">
            {isInitialLoading && (
              <p className="text-lg text-center">Loading...</p>
            )}
            {posts?.map((post) => {
              return (
                <PostCard
                  post={post}
                  key={post.identifier}
                  revalidate={revalidate}
                />
              );
            })}
            {isValidating && posts.length > 0 && (
              <p className="text-lg text-center">Loading More...</p>
            )}
          </div>

          {/* sidebar */}

          <div className=" hidden ml-6 md:block w-80">
            <div className="bg-white rounded">
              <div className="p-4 border-b-2">
                <p className="text-lg font-semibold text-center">
                  Top Communities
                </p>
              </div>
              <div>
                {topSubs?.map((sub) => (
                  <div
                    key={sub.name}
                    className="flex items-center px-4 py-2 text-xs border-b"
                  >
                    <div className="mr-2 overflow-hidden rounded-full cursor-pointer">
                      <Link href={`/r/${sub.name}`}>
                        <Image
                          src={sub.imageUrl}
                          alt="Sub"
                          width={(6 * 16) / 4}
                          height={(6 * 16) / 4}
                        />
                      </Link>
                    </div>
                    <Link href={`/r/${sub.name}`} legacyBehavior>
                      <a className="font-bold hover:cursor-pointer">
                        /r/{sub.name}
                      </a>
                    </Link>
                    <p className="ml-auto font-med">{sub.postCount}</p>
                  </div>
                ))}
              </div>

              {authenticated && (
                <div className="p-4 border-t-2 text-center">
                  <Link href={"/subs/create"} legacyBehavior>
                    <a className="w-full button bg-blue-500 px-2 py-1 rounded">
                      Create Subs
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Fragment>
    </>
  );
}
