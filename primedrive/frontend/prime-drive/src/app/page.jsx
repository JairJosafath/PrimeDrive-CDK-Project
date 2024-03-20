"use client";
import Auth from "@/components/auth";
import PhotosContainer from "@/components/photos.container";
import SearchContainer from "@/components/search.container";
import Topbar from "@/components/topbar";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import useUploader from "@/hooks/useUploader";
import useAuth from "@/hooks/useAuth";
const baseUrl = process.env.NEXT_PUBLIC_ENDPOINT||"";

export default function Home() {
  const [search, setSearch] = useState("");
  const searchInput = useRef(null);
  const {file, setFile, loading, hotreload, setHotReload, input} = useUploader(auth?.idToken);
  const {auth, setAuth} = useAuth();



  return (
    <main>
      {auth.authenticated
        ?<>
        <Topbar searchInput={searchInput} input={input} setFile={setFile} auth={auth} setSearch={setSearch}/>
      {!search?<PhotosContainer token={auth?.idToken} hotreload={hotreload} setHotReload={setHotReload}/>:<SearchContainer token={auth?.idToken} search={search} setSearch={setSearch}/>}
      </>
      :
      <Auth setAuth={setAuth}/>
      }
    </main>
  );
}
