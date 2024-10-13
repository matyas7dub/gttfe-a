import { Center, CreateToastFnReturn, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"
import * as jose from 'jose';
import { loginPath } from "../../../config/config";

export default function LoginScript() {
  let searchParams = useSearchParams();
  let code = searchParams[0].get('code');
  let state = searchParams[0].get('state');
  let httpBody = {
    "code": code,
    "state": state,
    "redirectUri": window.location.origin + loginPath,
  };

  const toast = useToast();

  useEffect(() => {
    let jsonHeader = new Headers();
    jsonHeader.append("Content-Type", "application/json")
    fetch(process.env.REACT_APP_BACKEND_URL + '/backend/discord/token',
    {
      method: "POST",
      headers: jsonHeader,
      body: JSON.stringify(httpBody),
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("jws", data.jws);
        localStorage.setItem("userObject", JSON.stringify(data.userObject));
      } else {
        const error = data.msg?? data.message?? "Unknown error";
        console.error("Couldn't get jws from API:", error);
        toast({
          title: "Couldn't get jws from API",
          description: error,
          status: 'error',
          duration: 5000,
          isClosable: true
        })
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

export function fetchGracefully(url: string, method: string, body: string | null | any, headers: [string, string][], successMessage: string, toast: CreateToastFnReturn) {
  // The headers have to be [string, string][] otherwise they get lost at some point
  successMessage = successMessage?? "Success";

  if (!localStorage.getItem("jws") || (jose.decodeJwt(localStorage.getItem("jws")?? "").exp?? 0) * 1000 < Date.now()) {

    fetch(process.env.REACT_APP_BACKEND_URL + '/backend/discord/auth')
    .then(response => response.json())
    .then(authUrl => window.open(authUrl.redirectUrl + `&redirect_uri=${window.location.origin + loginPath}`, "_blank"))
    .then(() => {
      const currentJws = localStorage.getItem("jws");
      const interval = setInterval(() => {
        if (currentJws !== localStorage.getItem("jws")) {
          clearInterval(interval);
          const newHeaders: [string, string][] = headers;
          const authIndex = newHeaders.findIndex(value => value[0] === "Authorization");
          newHeaders[authIndex] = ["Authorization", `Bearer ${localStorage.getItem("jws")}`] as [string, string];
          fetchWithToast(url, method, newHeaders, body, successMessage, toast);
        }
      }, 1000);
    })
    .catch(error => console.error('Error:', error));
  } else {
    return fetchWithToast(url, method, headers, body, successMessage, toast);
  }
}

async function fetchWithToast(url: string, method: string, headers: [string, string][], body: string | null | any, successMessage: string, toast: CreateToastFnReturn) {
  return fetch(url,
    {
      method: method,
      headers: new Headers(headers),
      body: body?? undefined
    })
  .then(async response => {
    if (response.ok) {
      toast({
        title: successMessage,
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      localStorage.removeItem("requestCache");
    } else {
      const data = await response.clone().json();
      toast({
        title: 'Error',
        description: data.msg?? data.message?? 'Unknown error.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
    return response
  })
  .catch(error => console.error("Error:", error));
}
