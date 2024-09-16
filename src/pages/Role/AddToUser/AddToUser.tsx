import { Avatar, Button, Card, FormControl, FormLabel, Input, Radio, RadioGroup, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";

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

        <DataPicker dataType={dataType.game} changeHandler={event => setGameId(Number(event.target.value))} placeholder="Null" />

        <Button onClick={addRole} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">Add role</Button>
        
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
    ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + `/backend/user/${id}/`),
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
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {
      game_id: gameId,
      user_id: userId,
      role: role,
    }

    fetchGracefully(((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + `/backend/role/add`),
    "POST", JSON.stringify(body), headers, "Role added successfully", toast);
  }
}
