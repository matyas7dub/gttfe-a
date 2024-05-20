import { Avatar, Button, Card, FormControl, FormLabel, Input, Radio, RadioGroup, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import GamePicker from "../../../components/GamePicker/GamePicker";

export default function AddToUser() {
  const [pfpUrl, setPfpUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [role, setRole] = useState("Admin");
  const [userId, setUserId] = useState("");
  const [gameId, setGameId] = useState(0);

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <FormControl>
          <FormLabel>User ID</FormLabel>
          <Input type="number" onChange={(event) => updateUser(event.target.value)}/>
        </FormControl>

        <Card width="fit-content" minWidth="30%" marginTop="-2rem">
          <Stack direction="row" align="center" padding="1rem">
            <Avatar name={userName} src={pfpUrl} marginRight="1rem" />
            <Text>{userUsername}</Text>
          </Stack>
        </Card>

        <FormControl>
          <FormLabel>Role</FormLabel>
          <RadioGroup value={role} onChange={setRole}>
            <Stack direction="row">
              <Radio value="admin">Admin</Radio>
              <Radio value="gameOrganizer">Game organizer</Radio>
              <Radio value="gameStreamer">Game streamer</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <GamePicker changeHandler={event => setGameId(Number(event.target.value))} default="Null" />

        <Button onClick={addRole} fontSize="2rem" colorScheme="blue" width="fit-content" padding="1em">Add role</Button>
        
      </Stack>
    </div>
  );

  function updateUser(id: string) {
    if (id.length <= 17 || id.length >= 19) {
      return;
    }
    setUserId(id);

    const header = new Headers();
    header.append("Authorization", `Bearer ${localStorage.getItem("jws")}`)
    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/user/${id}/`),
      {
        method: "GET",
        headers: header,
      }
    )
    .then(async response => {
      if (response.ok) {
        const data = await response.json();
        setUserName(`${data.name} ${data.surname}`)
        setUserUsername(data.discord_user_object.username);
        setPfpUrl(`https://cdn.discordapp.com/avatars/${data.discord_user_object.id}/${data.discord_user_object.avatar}`);
      }
    });
  }

  function addRole() {
    const header = new Headers();
    header.append("Authorization", `Bearer ${localStorage.getItem("jws")}`);
    header.append("Content-Type", "application/json");

    const body = {
      game_id: gameId,
      user_id: userId,
      role: role,
    }

    fetch(
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : '') + `/backend/role/add`),
      {
        method: "POST",
        headers: header,
        body: JSON.stringify(body),
      }
    )
    .then(async response => {
      if (response.ok) {
        toast({
          title: 'Role added successfulyl',
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
    .catch(error => console.error("Error:", error));
  }
}
