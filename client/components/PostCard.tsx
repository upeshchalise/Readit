import Link from "next/link";
import { Fragment } from "react";
import Axios from "axios";
import dayjs from "dayjs";
import Image from "next/image";
import { Post } from "../types";
import classNames from "classnames";
import ActionButton from "./ActionButton";

import relativeTime from "dayjs/plugin/relativeTime";
import { useAuthState } from "@/context/auth";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  revalidate?: Function;
}

export default function PostCard({
  post: {
    identifier,
    slug,
    title,
    body,
    subName,
    createdAt,
    voteScore,
    userVote,
    commentCount,
    url,
    username,
    sub,
  },
  revalidate,
}: PostCardProps) {
  const { authenticated } = useAuthState();

  const router = useRouter();

  const isInSubPage = router.pathname === "/r/[sub]"; //  /r/[sub]

  const vote = async (value: number) => {
    if (!authenticated) router.push("/login");

    if (value === userVote) value = 0;

    try {
      const res = await Axios.post("/misc/vote", {
        identifier,
        slug,
        value,
      });

      if (revalidate) revalidate();

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      key={identifier}
      className="flex mb-4 bg-white rounded"
      id={identifier}
    >
      {/* vote section */}
      <div className="w-10 bg-gray-200 rounded-l text-center py-3">
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          <i
            className={classNames("icon-arrow-up", {
              "text-red-500": Number(userVote) === 1,
            })}
          ></i>
        </div>
        <p className="text-xs font-bold">{voteScore}</p>
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
          onClick={() => vote(-1)}
        >
          <i
            className={classNames("icon-arrow-down", {
              "text-blue-600": Number(userVote) === -1,
            })}
          ></i>
        </div>
      </div>

      {/* post data section */}
      <div className="w-full p-2">
        <div className="flex items-center">
          {!isInSubPage && (
            <>
              <Link href={`/r/${subName}`} legacyBehavior>
                <Image
                  src={sub?.imageUrl}
                  alt="picture for subname"
                  width={22}
                  height={22}
                  className="mr-1 rounded-full"
                />
              </Link>
              <Link href={`/r/${subName}`} legacyBehavior>
                <a className="text-xs font-bold hover:underline">
                  /r/{subName}
                </a>
              </Link>
              <span className="mx-1 text-xs text-gray-500">•</span>
            </>
          )}

          {/* <Link href={`/r/${subName}`}></Link> */}
          <p className="text-xs text-gray-500">
            Posted by
            <Link href={`/u/${username}`} legacyBehavior>
              <a className="mx-1 hover:underline">/u/{username}</a>
            </Link>
            <Link href={url} legacyBehavior>
              <a className="mx-1 hover:underline ">
                {dayjs(createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <Link href={url} legacyBehavior>
          <a className="my-1 text-lg font-medium">{title}</a>
        </Link>
        {body && <p className="text-sm my-1">{body}</p>}

        <div className="flex">
          {/* comments */}
          <Link href={url} legacyBehavior>
            <a>
              <ActionButton>
                <i className="fas fa-comment-alt fa-xs mr-1"></i>
                <span className="font-bold">{commentCount} Comments</span>
              </ActionButton>
            </a>
          </Link>
          {/* share */}
          <ActionButton>
            <i className="fas fa-share fa-xs mr-1"></i>
            <span className="font-bold">Share</span>
          </ActionButton>
          {/* save */}
          <ActionButton>
            <i className="fas fa-bookmark fa-xs mr-1"></i>
            <span className="font-bold">Save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
