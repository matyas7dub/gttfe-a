import { Center, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"

export default function Account() {
  let searchParams = useSearchParams();
  const navigate = useNavigate();
  let code = searchParams[0].get('code');
  let state = searchParams[0].get('state');
  let HttpBody = {
    "code": code,
    "state": state,
    "redirect_uri": process.env.REACT_APP_AUTH_REDIRECT,
  };

  useEffect(() => {
    let jsonHeader = new Headers();
    jsonHeader.append("Content-Type", "application/json")
    fetch(process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz/backend/discord/token' : '/backend/discord/token',
    {
      method: "POST",
      headers: jsonHeader,
      body: JSON.stringify(HttpBody),
    })
    .then(response => response.json())
    .then(data => {
      console.debug(data);
      localStorage.setItem("jws", data.jws);
      localStorage.setItem("avatarUrl", `https://cdn.discordapp.com/avatars/${data.userObject.id}/${data.userObject.avatar}.png`)
      setUserName(data.userObject.id)
      navigate('/');
    })
    .catch(error => console.error('Error:', error));

    function setUserName(id: string) {
      let bearerHeader = new Headers();
      bearerHeader.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
      fetch(process.env.REACT_APP_PROD === 'yes' ? `https://gttournament.cz/backend/user/${id}/` : `/backend/user/${id}/`,
      {
        headers: bearerHeader,
      })
      .then(response => response.json())
      .then(data => localStorage.setItem("userName", `${data.name} ${data.surname}`))
      .catch(error => console.error('Error:', error));
    }
  });
  return (
      <Center w="100%" h="80vh">
        <Spinner size='xl' />
      </Center>
  )
}
