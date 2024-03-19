import React, { Ref } from "react";

const url = "https://1tkzycmfi8.execute-api.eu-central-1.amazonaws.com/prod/"
export default function Auth({ setAuth }) {
  const username = React.useRef(null);
    const password = React.useRef(null);
  const [error, setError] = React.useState(null);
  async function signIn (){
    console.log({username,password})
    if (!username || !password) return;
    const user = username?.current?.value
    const pass = password?.current?.value

    const response = await fetch(url+"/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user, password: pass }),
    })

    const result = await response.json();
    const token = result.AuthenticationResult.IdToken;
    // store auth in local storage
    localStorage.setItem("auth", JSON.stringify({ username: user, authenticated: true, idToken: token, exp: Date.now() + 60 * 60 * 1000}));


    if (token) {
      setAuth(() => {
        return { username: user, authenticated: true, idToken: token ,  exp: Date.now() + 60 * 60 * 1000};
      });
    } else {
      console.log("error");
    }
  };
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="flex flex-col gap-2">
        <label>Username</label>
        <input ref={username} type="text" className="p-2 rounded text-black" />
        <label>Password</label>
        <input ref={password} type="password" className="p-2 rounded text-black" />
        <button className="bg-primary-500 text-white p-2 rounded" onClick={()=>signIn()}>
          Sign In
        </button>
      </div>
    </div>
  );
}


// const TOKEN = 

// `
// eyJraWQiOiJGck53MXFOdGQyd1FpQ1JUYTRlS1c2dVN2cG9pdHFTemRYbThYalVBQ2tNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2Zjg2MmJmZS00ZjczLTQ3NTAtYTNkYi0zMzRjMTg1ODEzNmIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfaDZjTnl2dGRhIiwiY3VzdG9tOnN1YnNjcmlwdGlvbiI6ImZyZWUiLCJjb2duaXRvOnVzZXJuYW1lIjoiamFpcjk4Iiwib3JpZ2luX2p0aSI6ImMwMTIyOWIwLWY0ZTktNDIzMy05NmI1LTFkOTM5ZDIxYzU2YiIsImF1ZCI6IjF1aWNodm1ibG05cGpsOGNsdjFjcmk0YzJoIiwiZXZlbnRfaWQiOiJjYTE0ZjM0Mi04MDhhLTQwNzAtODNkMS04YzdlYjg5NzZlNjQiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTcxMDYyMDg1NSwiZXhwIjoxNzEwNjI0NDU1LCJpYXQiOjE3MTA2MjA4NTUsImp0aSI6ImM4NGJhZWM4LWUxNjgtNGZjYS04MDBkLTM5N2ZlNzVkZDlmNCIsImVtYWlsIjoiamFpcmpvc2FmYXRoQGdtYWlsLmNvbSJ9.fDZga4R654xjYF_gETVaA2aYltqzrilvJOeF6vjdWcQL7o1mNkDJrg_yIzOEJNsihjLhiogTDnHvUwu63h2vOAvYV5ZG5NHPB-JmqjxU8f4fNPJ42DIr0QkcNp-_0oLlSepOZZ327TzWKtrV4wontsymQcaY2KYmkXQ26TL5syaCkfj7bX_yDgmpjrNrRkNoGy__pD8bWRjavZaSHEsbVhLDrmszN4imLfFBA_0jjUWfrZARlQTAIHBHZu3P5XYaH-RMptVjqNutInYOtyBdTkNXT68uguIGL5UfhxhJ_kneu3B60Uhc8km5bBsNwSqjio6vrA1YBAkJNKazu_YkDw
// `