import { Center, CreateToastFnReturn, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"
import * as jose from 'jose';
import { backendUrl, loginPath } from "../../../config/config";

export default function LoginScript() {
  let searchParams = useSearchParams();
  let code = searchParams[0].get('code');
  let state = searchParams[0].get('state');
  let httpBody = {
    "code": code,
    "state": state,
    "redirectUri": window.location.origin + loginPath,
  };

  useEffect(() => {
    let jsonHeader = new Headers();
    jsonHeader.append("Content-Type", "application/json")
    fetch(backendUrl + '/backend/discord/token',
    {
      method: "POST",
      headers: jsonHeader,
      body: JSON.stringify(httpBody),
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("loginResult", "success");
        localStorage.setItem("jws", data.jws);
        localStorage.setItem("userObject", JSON.stringify(data.userObject));
      } else {
        const error = data.msg?? data.message?? "Unknown error";
        localStorage.setItem("loginResult", error);
        console.error("Couldn't get jws from API:", error);
      }
      window.close();
    })
    .catch(error => console.error("Error", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <Center w="100%" h="80vh">
        <Spinner size='xl' />
      </Center>
  )
}

export async function fetchGracefully(url: string, init: RequestInit, successMessage: string | null, toast: CreateToastFnReturn): Promise<Response> {
  if (successMessage !== null) {
    successMessage = successMessage?? "Success";
  }

  await new Promise((resolve, reject) => {
    if (!localStorage.getItem("jws") || (jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000 < Date.now()) {
      fetch(backendUrl + '/backend/discord/auth')
      .then(response => response.json())
      .then(authUrl => window.open(authUrl.redirectUrl + `&redirect_uri=${window.location.origin + loginPath}`, "_blank"))
      .then(() => {
        const oldJws = localStorage.getItem("jws");
        const interval = setInterval(() => {
          if (oldJws !== localStorage.getItem("jws")) {
            clearInterval(interval); resolve("Successfully logged in.");
          }
        }, 1000);
      })
      .catch(error => {
        console.error('Error:', error);
        reject("Error logging in.");
      });
    } else {
      resolve("Already logged in.");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    toast({
      title: 'Error',
      description: error,
      status: 'error',
      duration: 5000,
      isClosable: true
    })
  })

  const newHeaders = new Headers(init.headers);
  newHeaders.set("Authorization", `Bearer ${localStorage.getItem("jws")}`);
  init.headers = newHeaders;

  return fetchWithToast(url, init, successMessage, toast);
}

async function fetchWithToast(url: string, init: RequestInit, successMessage: string | null, toast: CreateToastFnReturn): Promise<Response> {
  return new Promise((resolve) => {
    fetch(url, init)
    .then(async response => {
      if (response.ok) {
        if (successMessage !== null) {
          toast({
            title: successMessage,
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        }
      } else {
        const data = await response.json();
        const error = data.msg?? data.message?? 'Unknown error.';
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
      resolve(response);
    })
    .catch(error => console.error("Error:", error));
  })
}
