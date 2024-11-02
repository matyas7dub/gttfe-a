import { Avatar, Card, FormControl, FormLabel, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function AddToUser() {
  const [pfpUrl, setPfpUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [roleId, setRoleId] = useState<number>();
  const [userId, setUserId] = useState("");

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <FormControl>
          <FormLabel>User ID</FormLabel>
          <Input type="number" onChange={(event) => selectUser(event.target.value)}/>
        </FormControl>

        <Card width="fit-content" minWidth="30%" marginTop="-2rem">
          <Stack direction="row" align="center" padding="1rem">
            <Avatar name={userName} src={pfpUrl} marginRight="1rem" />
            <Text>{userUsername}</Text>
          </Stack>
        </Card>

        <DataPicker dataType={dataType.assignedRoles} changeHandler={event => setRoleId(Number(event.target.value))} />

        <ConfirmationButton onClick={addRole}>Add role</ConfirmationButton> 
      </EndpointForm>
    </div>
  );

  function selectUser(id: string) {
    if (id.length <= 17) {
      return;
    }
    setUserId(id);

    fetch(backendUrl + `/backend/user/${id}/`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jws")}`
        }
      }
    )
    .then(async response => {
      if (response.ok) {
        const user = await response.json();
        setUserName(`${user.name} ${user.surname}`)
        if (user.discord_user_object !== null) {
          setUserUsername(user.discord_user_object.username);
          setPfpUrl(`https://cdn.discordapp.com/avatars/${user.discord_user_object.id}/${user.discord_user_object.avatar}`);
        } else {
          setUserUsername("");
          setPfpUrl("");
        }
      }
    });
  }

  function addRole() {
    const headers: [string, string][] = [
      ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
      ["Content-Type", "application/json"]
    ];

    const body = {
      assignedRoleId: roleId,
      userId: userId
    }

    fetchGracefully(backendUrl + `/backend/userRole/create`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers
    },
    "Role added successfully", toast);
  }
}
