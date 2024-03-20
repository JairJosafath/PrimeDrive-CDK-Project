import { useState, useEffect } from "react";


export default function useAuth(){
  
    const [auth,setAuth] = useState({ authenticated: false });
  
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
  
    return {auth, setAuth};
  }