import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import { useAuthState, useAuthDispatch } from "../context/auth";
import Axios from "axios";
import { Sub } from "@/types";
import router from "next/router";

const Navbar = () => {
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const { authenticated, loading } = useAuthState();
  const dispatch = useAuthDispatch();

  const logout = () => {
    Axios.get("/auth/logout")
      .then(() => {
        dispatch({ type: "LOGOUT" });
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (name.trim() === "") {
      setSubs([]);
      return;
    }
    searchSubs();
  }, [name]);

  const searchSubs = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    setTimer(
      setTimeout(async () => {
        try {
          const { data } = await Axios.get(`/subs/search/${name}`);
          setSubs(data);
          console.log(data);
        } catch (err) {
          console.log(err);
        }
      }, 250)
    );
  };

  const goToSub = (subName: string) => {
    router.push(`/r/${subName}`);
    setName("");
  };

  return (
    <div className="flex h-10 bg-white fixed inset-x-0 top-0 z-10 items-center justify-between px-4">
      {/* Logo and title */}
      <div className="flex items-center">
        <Link href={"/"}>
          <Image
            src="../image/reddit.svg"
            alt="logo of reddit"
            width={32}
            height={32}
            className="mr-2"
          />
        </Link>
        <span className="text-2xl font-semibold hidden lg:block">
          <Link href={"/"}>readit</Link>
        </span>
      </div>

      {/* search input */}
      <div className="px-4 w-160 max-w-full">
        <div className="relative flex items-center bg-gray-100 border rounded hover:bg-white hover:border-blue-500">
          <i className="fa-solid fa-magnifying-glass text-gray-500 pl-4 pr-3"></i>
          <input
            type="text"
            className="py-1 pr-3 outline-none bg-transparent focus:outline-none w-160"
            placeholder="Search"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div
            className="absolute left-0 right-0 bg-white"
            style={{ top: "100%" }}
          >
            {subs?.map((sub) => (
              // eslint-disable-next-line react/jsx-key
              <div
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200 "
                onClick={() => goToSub(sub.name)}
              >
                <Image
                  src={sub.imageUrl}
                  className="rounded-full"
                  alt="Sub"
                  height={(8 * 16) / 4}
                  width={(8 * 16) / 4}
                />
                <div className="ml-4 text-sm">
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-gray-500">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* auth btns */}

      <div className="flex">
        {!loading &&
          (authenticated ? (
            // show Logout
            <button
              className="lg:w-32 w-20 bg-white text-blue-500 border rounded border-blue-500 uppercase leading-6 mr-3"
              onClick={logout}
            >
              LogOut
            </button>
          ) : (
            <>
              <Link href={"/login"}>
                <button className="lg:w-32 w-20 bg-white text-blue-500 border rounded border-blue-500 uppercase leading-6 mr-3">
                  Log In
                </button>
              </Link>
              <Link href={"/register"}>
                <button className="lg:w-32 w-20 bg-blue-500 text-white border rounded border-blue-500 uppercase leading-6 mr-2">
                  Register
                </button>
              </Link>
            </>
          ))}
      </div>
    </div>
  );
};

export default Navbar;
