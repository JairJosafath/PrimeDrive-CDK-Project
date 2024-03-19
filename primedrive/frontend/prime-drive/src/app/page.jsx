"use client";
import Auth from "@/components/auth";
import PhotosContainer from "@/components/photos.container";
import SearchContainer from "@/components/search.container";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [auth,setAuth] = useState({ authenticated: false });
  const input = useRef(null);
  const {file, setFile, loading, hotreload, setHotReload} = useUploader(auth?.idToken);
  const [search, setSearch] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    // check expiration
    const exp = JSON.parse(auth)?.exp;
    if (exp < Date.now()) {
      setAuth(() => ({ authenticated: false }));
      localStorage.removeItem("auth");
    }
    else if (auth) {
      setAuth(() => JSON.parse(auth));
    }
  },[])

  useEffect(() => {
    if(!search&&searchInput?.current?.value)
    searchInput.current.value = "";
  },[search])

  return (
    <main>
      {auth.authenticated
        ?<>
        <header className="flex justify-between px-8 py-3">
        <div className="flex justify-around w-1/2 items-center">
          <label className="text-xl">PrimeDrive:demo</label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-96 rounded bg-neutral-800 p-2"
              ref={searchInput}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 hover:text-primary-500 cursor-pointer hover:bg-white hover:text-black hover:h-10 hover:py-2 w-8 rounded-r-md active:scale-95 active:bg-neutral-200"
              onClick={() => {
                setSearch(searchInput.current.value);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>
        <div className="flex gap-14 items-center">
          <div className="flex gap-4 hover:text-black hover:bg-white p-2 rounded cursor-pointer active:scale-95 active:bg-neutral-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>

            <label className="cursor-pointer" onClick={()=>{
              input.current.click()
            }}>Upload</label>
            <input type="file" className="hidden" ref={input} 
            onChange={(e)=>{
               setFile(()=>e.target.files[0]);
               input.current.value = null;
            }}
            />
          </div>
            <label className="rounded-full bg-pink-300 w-8 h-8 justify-center flex items-center" >{auth?.username[0].toUpperCase() }</label>
        </div>
      </header>
      {!search?<PhotosContainer token={auth?.idToken} hotreload={hotreload} setHotReload={setHotReload}/>:<SearchContainer token={auth?.idToken} search={search} setSearch={setSearch}/>}
      </>
      :
      <Auth setAuth={setAuth}/>
      }
    </main>
  );
}
const baseUrl =
  "https://1tkzycmfi8.execute-api.eu-central-1.amazonaws.com/prod/";
function useUploader(token){
  const [hotreload, setHotReload] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getPresignedUrl(key){
    if (!key) return;
    const response = await fetch(`${baseUrl}presigned?action=put&key=${key}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    const result = await response.json();
    const url = JSON.parse(result.body).url;
    console.log({url})
    return url;
  }
    

  async function uploadFile(){
    if (!file) return;
    const title = file.name;
    const presignedUrl = await getPresignedUrl(title);
    if (!presignedUrl) return;
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers:{
        "Content-Type": file.type
      }
    });

    if (response.status === 200) {
      console.log("success");
      setHotReload(true);
    } else {
      console.log("error");
    }

    setLoading(false);
    setFile(null);

  }

  useEffect(() => {
    uploadFile();
  }, [file, token]);


  return {
    file, setFile, error, loading, hotreload, setHotReload
  }
}