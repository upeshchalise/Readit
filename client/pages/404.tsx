import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-center text-5xl text-gray-700">404 Page Not Found</h1>

      <button className="bold bg-blue-700 border-none my-10">
        <Link href="/" legacyBehavior>
          <a> Back To Main page</a>
        </Link>
      </button>
    </div>
  );
};

export default NotFound;
