import { Badge, CreateToastFnReturn, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import UserPicker from "../../../components/UserPicker/UserPicker";
import { backendUrl } from "../../../config/config";

export default function ShowUser() {
  const [user, setUser] = useState<JSX.Element[]>();
  const toast = useToast();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <UserPicker callback={id => selectUser(id.toString())} toast={toast} />
        <Stack direction="column">
          {user}
        </Stack>
      </EndpointForm>
    </div>
  )

  function selectUser(id: string) {
    if (id === "") {
      return;
    }

    console.debug(id);

    fetchGracefully(backendUrl + `/backend/user/${id}/`, {}, null, toast)
    .then(response => response.json())
    .then(async userData => {
      console.debug(userData);
      const tempUser: JSX.Element[] = [];
      const school = getSchool(userData.schoolId);
      const team = getTeam(id, toast);
      const assignedRoles = getAssignedRoles(id, toast);
      const generatedRoles = getGeneratedRoles(id, toast);

      await Promise.all([school, team, generatedRoles, assignedRoles])
      .then(response => {
        tempUser.push(<p>Name: {parseName(userData)}</p>);
        tempUser.push(<p>Adult: {boolToBadge(userData.adult as boolean)}</p>);
        tempUser.push(<p>Camera: {boolToBadge(userData.camera as boolean)}</p>);
        tempUser.push(<p>School: {response[0]}</p>);
        tempUser.push(<p>Team: {response[1]}</p>);
        tempUser.push(<p>Team roles: {response[2]}</p>);
        tempUser.push(<p>Tournament roles: {response[3]}</p>);
      })
      setUser(tempUser);
    })
  }
}

function parseName(userData: any) {
  const name = `${userData.name} ${userData.surname}`;
  if (name === " ") {
    return "None";
  }
  return name;
}

async function getSchool(schoolId: number) {
  if (!schoolId) {
    return "None";
  }

  let schoolName = "None";

  await fetch(backendUrl + "/backend/school/listAll/")
  .then(response => response.json())
  .then(schools => {
    for (let school of schools) {
      if (school.schoolId === schoolId) {
        schoolName = school.name;
        break;
      }
    }
  })
  .catch(error => console.error("Error: ", error));

  return schoolName;
}

async function getTeam(userId: String, toast: CreateToastFnReturn) {
  let teamName = "None";

  await fetchGracefully(backendUrl + `/backend/user/${userId}/teams/`, {}, null, toast)
  .then(response => response.json())
  .then(teams => {
    for (let i = 0; i < teams.length; i++) {
      if (i === 0) {
        teamName = teams[i].name;
      } else {
        teamName += `, ${teams[i].name}`;
      }
    }
  })
  .catch(error => console.error("Error: ", error));

  return teamName;
}

async function getAssignedRoles(userId: String, toast: CreateToastFnReturn) {
  let roles: JSX.Element[] = [];

  await fetchGracefully(backendUrl + `/backend/user/${userId}/assignedRoles/`, {}, null, toast)
  .then(response => response.json())
  .then(data => {
    for (let role of data) {
      roles.push(<Badge marginRight="0.5em">{role.roleName}</Badge>);
    }
  })
  .catch(error => console.error("Error: ", error));

  if (roles.length === 0) {
    return "None";
  }

  return roles;
}

async function getGeneratedRoles(userId: String, toast: CreateToastFnReturn) {
  let roles: JSX.Element[] = [];

  await fetchGracefully(backendUrl + `/backend/user/${userId}/generatedRoles/`, {}, null, toast)
  .then(response => response.json())
  .then(data => {
    for (let role of data) {
      roles.push(<Badge marginRight="0.5em">{role.roleName}</Badge>)
    }
  })
  .catch(error => console.error("Error: ", error));

  if (roles.length === 0) {
    return "None";
  }

  return roles;
}

function boolToBadge(bool: boolean) {
  if (bool) {
    return <Badge colorScheme="green">true</Badge>;
  } else {
    return <Badge colorScheme="red">false</Badge>;
  }
}
