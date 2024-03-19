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
              // onClick={()=>getPresignedUrl(title)}
            />
          </div>
        ))}
      </main>
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

  return { thumbs, loading, error, photo, setPhoto};
}
