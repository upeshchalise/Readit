import PostCard from "@/components/PostCard";
import Head from "next/head";

import { useRouter } from "next/router";
import { ChangeEvent, Fragment, createRef, useEffect, useState } from "react";
import useSWR from "swr";
import { Sub } from "@/types";
import Image from "next/image";
import classNames from "classnames";

import { useAuthState } from "@/context/auth";

import Axios from "axios";
import Sidebar from "@/components/Sidebar";

export default function SubPage() {
  // local state
  const [ownSub, setOwnSub] = useState(false);

  // global state
  const { authenticated, user } = useAuthState();

  // Utils

  const router = useRouter();
  const fileInputRef = createRef<HTMLInputElement>();

  const subName = router.query.sub;

  const {
    data: sub,
    error,
    revalidate,
  } = useSWR<Sub>(subName ? `/subs/${subName}` : null);

  useEffect(() => {
    if (!sub) return;
    setOwnSub(authenticated && user?.username === sub.username);
  }, [sub]);

  const openFileInput = (type: string) => {
    if (!ownSub) return;
    fileInputRef.current.name = type;
    fileInputRef.current?.click();
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileInputRef.current.name);

    try {
      await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  if (error) router.push("/");

  let postMarkup;
  if (!sub) {
    postMarkup = <p className="text-center text-lg">Loading...</p>;
  } else if (sub.posts.length === 0) {
    postMarkup = <p className="text-lg text-center">No Posts submitted yet</p>;
  } else {
    postMarkup = sub.posts.map((post) => (
      <PostCard key={post.identifier} post={post} revalidate={revalidate} />
    ));
  }

  return (
    <div>
      <Head>
        <title>{sub?.title}</title>
      </Head>
      {sub && (
        <Fragment>
          <input
            type="file"
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />

          {/* sub info and images */}
          <div>
            {/* banner image */}
            <div
              className={classNames("bg-blue-500", {
                "cursor-pointer": ownSub,
              })}
              onClick={() => openFileInput("banner")}
            >
              {sub.bannerUrl ? (
                <div
                  className="h-56 bg-blue-500"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              ) : (
                <div className="h-20 bg-blue-500"></div>
              )}
            </div>

            {/* Sub meta data */}
            <div className="h-20 bg-white">
              <div className="container flex relative">
                <div className="absolute" style={{ top: -15 }}>
                  <Image
                    src={sub.imageUrl}
                    alt="sub"
                    className={classNames("rounded-full", {
                      "cursor-pointer": ownSub,
                    })}
                    onClick={() => openFileInput("image")}
                    height={70}
                    width={70}
                  />
                </div>
                <div className="pt-1 pl-24">
                  <div className="flex item-center">
                    <h1 className="mb-1 text-2xl font-bold">{sub.title}</h1>
                  </div>
                  <p className="text-sn font-bold text-gray-500">
                    /r/{sub.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* posts and sidebar */}

          <div className="container flex pt-5">
            <div className="w-160">{postMarkup}</div>
            <Sidebar sub={sub} />
          </div>
        </Fragment>
      )}
    </div>
  );
}
