import { Center, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"

export default function LoginScript() {
  let searchParams = useSearchParams();
  const navigate = useNavigate();
  let code = searchParams[0].get('code');
  let state = searchParams[0].get('state');
  let HttpBody = {
    "code": code,
    "state": state,
    "redirect_uri": process.env.REACT_APP_AUTH_REDIRECT,
  };
  const toast = useToast();

  useEffect(() => {
    let jsonHeader = new Headers();
    jsonHeader.append("Content-Type", "application/json")
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/discord/token'),
    {
      method: "POST",
      headers: jsonHeader,
      body: JSON.stringify(HttpBody),
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("jws", data.jws);
        localStorage.setItem("jwsTtl", String(Date.now() + Number(process.env.REACT_APP_JWS_TTL ?? 0) * 1000));
        localStorage.setItem("userObject", JSON.stringify(data.userObject));
      } else {
        console.error("Couldn't get jws from API:", data.msg);
        toast({
          title: "Couldn't get jws from API",
          description: data.msg?? data.message?? "Unknown error",
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
      navigate('/');
    })
    .catch(error => console.error('Error:', error));

    if (localStorage.getItem("requestCache") != null) {
      const cache = JSON.parse(localStorage.getItem("requestCache")?? "this will intentionally crash the parser and it shouldnt ever get here");
      const request = {
        method: cache.request.method,
        headers: new Headers(cache.request.headers),
        body: cache.request.body
      };

      fetch(cache.url, request)
      .then(async response => {
        if (response.ok) {
          toast({
            title: cache.successMessage,
            status: 'success',
            duration: 5000,
            isClosable: true
          })
        } else {
          const data = await response.json();
          toast({
            title: 'Error',
            description: data.msg?? 'Unknown error.',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      localStorage.removeItem("requestCache");
    }
  }, []);
  return (
      <Center w="100%" h="80vh">
        <Spinner size='xl' />
      </Center>
  )
}

export function cacheRequestAndRelog(url: string, method: string, body: string, headers: string[][], successMessage?: string) {
  const cache = {
    url: url,
    successMessage: successMessage ?? "Success",
    request: {
      method: method,
      headers: headers,
      body: body
    },
  };
  localStorage.setItem("requestCache", JSON.stringify(cache));

  fetch(
  ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + '/backend/discord/auth')
  )
  .then(response => response.json())
  .then(authUrl => window.location.href = authUrl.redirect_url + `&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`)
  .catch(error => console.error('Error:', error));
      
}
