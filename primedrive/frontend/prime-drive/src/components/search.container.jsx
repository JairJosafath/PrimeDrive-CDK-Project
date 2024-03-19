import React, { useState, useEffect } from "react";
export default function SearchContainer({ token, search, setSearch }) {
    const { thumbs, photo, setPhoto, loading, error } = useThumber(token, search);

    return(
        <div className="m-6 bg-neutral-900 p-4">
         <div className="flex justify-between">
            <h1>Search results for {search}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer" onClick={()=>setSearch("")}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

        </div>
        <main className="grid grid-cols-4 gap-1 auto-rows-max p-2">
        {thumbs?.slice(0, 10).map(({ title, url }, index) => (
          <div key={index}>
            <label className="truncate w-2">{title.slice(0, 10)}</label>
            <img
              src={url}
              alt={title}
              className="h-[128px] w-[128px] p-1 hover:li cursor-pointer hover:brightness-125 active:scale-95"
              onClick={()=>setPhoto(()=>{return{title}})}
            />
          </div>
        ))}
      </main>
      {photo?.url && (
        <div className="w-screen h-screen fixed bg-black/90 top-0 left-0 flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 fixed top-0 right-0 m-8 scale-125 cursor-pointer"
            onClick={() => setPhoto(undefined)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>

          <img src={photo?.url} alt={photo?.title} className="" />

          <div className="flex gap-4 p-2 bg-neutral-900 cursor-pointer active:scale-95 rounded m-6">
            <label className=" cursor-pointer" onClick={(e)=>{
              e.stopPropagation();
              // download photo
              window.open(photo.url, "_blank")

              console.log("download")}}>Download</label>
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </div>
        </div>
      )}
        </div>
       
    )
}


const baseUrl =
  "https://1tkzycmfi8.execute-api.eu-central-1.amazonaws.com/prod/";

function useThumber(token, search) {
  const [thumbs, setThumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [keys, setKeys] = useState([]);
  const [photo, setPhoto] = useState({ title: "", url: "" });

  async function getKeys() {
    const res = await fetch(`${baseUrl}query?index=${search}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const tmpKeys = [];

    data.Items.forEach((item) => {
      item?.keys.L.forEach((key) => {
        tmpKeys.push(key.M.key.S)
      })
    });

    setKeys([...tmpKeys]);
    console.log({keys})
  }

  useEffect(() => {
    async function fetchThumbs() {
        if (!keys.length) return;
      const thumbsTmp = [];
      keys.forEach(async (key) => {
        const t = key?.split("/").splice(0, 2).join("/");
        const title = key?.replace(t + "/", "");
        const res = await fetch(`${baseUrl}/object/${title}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        thumbsTmp.push({ title, url });
        setThumbs([...thumbsTmp]);
        setKeys([]);
      });

      setLoading(false);
    }
    fetchThumbs();
  }, [keys.length]);

  useEffect(() => {
    getKeys();
  }, [token, search]);

  useEffect(()=>{
    if(!photo?.title) return
    async function getPresignedUrl(){
      const res = await fetch(`${baseUrl}/presigned?action=get&key=${photo.title}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      const url = JSON.parse(data.body).url;
      setPhoto({...photo, url})
    }
    getPresignedUrl();
  },[photo?.title,token])

  return { thumbs, loading, error, photo, setPhoto};
}
