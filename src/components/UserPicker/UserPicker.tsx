import { Avatar, Card, CreateToastFnReturn, FormControl, FormLabel, Input, Stack, Text } from "@chakra-ui/react";
import { SetStateAction, useState } from "react";
import { backendUrl } from "../../config/config";
import { fetchGracefully } from "../Navbar/Login/LoginScript";

type UserPickerProps = {
  callback: (userId: string | SetStateAction<string>) => void
  toast: CreateToastFnReturn
}

export default function UserPicker(props: UserPickerProps) {
  const [pfpUrl, setPfpUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");

  return (
    <Stack direction="column">
      <FormControl>
        <FormLabel>User ID</FormLabel>
        <Input type="number" onChange={(event) => selectUser(event.target.value)}/>
      </FormControl>

      <Card width="fit-content" minWidth="30%">
        <Stack direction="row" align="center" padding="1rem">
          <Avatar name={userName} src={pfpUrl} marginRight="1rem" />
          <Text>{userUsername}</Text>
        </Stack>
      </Card>
    </Stack>
  )

  function selectUser(id: string) {
    const minimumIdLength = 17;
    if (id.length <= minimumIdLength) {
      props.callback("");
      return;
    }

    fetchGracefully(backendUrl + `/backend/user/${id}/`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jws")}`
      }
    }, null, props.toast)
    .then(async response => {
      if (response.ok) {
        const user = await response.json();
        setUserName(`${user.name} ${user.surname}`)
        if (user.discord_user_object) {
          setUserUsername(user.discord_user_object.username);
          setPfpUrl(`https://cdn.discordapp.com/avatars/${user.discord_user_object.id}/${user.discord_user_object.avatar}`);
        }
        props.callback(id);
        return;
      }
      props.callback("");
      setUserUsername("");
      setPfpUrl("");
    })
    .catch(error => console.error("Error: ", error));
  }
}
