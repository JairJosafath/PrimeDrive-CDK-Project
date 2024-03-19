import { get } from "http";
import { useEffect, useState } from "react";

export default function PhotosContainer({ token }) {
  const { thumbs, photo, setPhoto, loading, error, setReload } = useThumber(token);

  return (
    <div>
      <div className="flex gap-8 items-center">
        <h1 className="m-3 text-3xl font-bold">Photos</h1>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:scale-110 cursor-pointer active:rotate-180 duration-300 active:scale-90"
        onClick={()=>{
          setReload(true)
        }}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
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
            <label className=" cursor-pointer">Download</label>
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
  );
}

const baseUrl =
  "https://1tkzycmfi8.execute-api.eu-central-1.amazonaws.com/prod/";

function useThumber(token) {
  const [thumbs, setThumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [keys, setKeys] = useState([]);
  const [photo, setPhoto] = useState({ title: "", url: "" });
  const [reload, setReload] = useState(false);

  async function getKeys() {
    const res = await fetch(`${baseUrl}/files`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const tmpKeys = [];

    data.Items.forEach((item) => {
      tmpKeys.push(item.key.S);
    });

    setKeys([...tmpKeys]);
    setReload(false);
  }

  useEffect(() => {
    async function fetchThumbs() {
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
      });

      setLoading(false);
    }
    fetchThumbs();
  }, [keys.length]);

  useEffect(() => {
    getKeys();
  }, [token]);

  useEffect(()=>{
    if(reload)
    getKeys();
  }, [reload, token])

  return { thumbs, loading, error, photo, setPhoto, setReload};
}
