import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import "@/styles/icons.css";
import { AuthProvider } from "@/context/auth";
import { SWRConfig } from "swr";


Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL +  "/api";
Axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
  try {
    const res = await Axios.get(url);
    return res.data;
  } catch (err: any) {
    throw err.response.data;
  }
};

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10000,
      }}
    >
      <AuthProvider>
        {!authRoute && <Navbar />}
        <div className={authRoute ? "" : "pt-10"}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  );
}
