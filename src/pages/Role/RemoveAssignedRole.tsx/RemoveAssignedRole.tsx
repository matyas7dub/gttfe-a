import { Checkbox, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import UserPicker from "../../../components/UserPicker/UserPicker";
import { backendUrl } from "../../../config/config";

export default function RemoveAssignedRole() {
  const [userId, setUserId] = useState("");
  const [roles, setRoles] = useState<Map<number, boolean>>(new Map());
  const [roleElems, setRoleElems] = useState<JSX.Element[]>();

  const toast =useToast();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <UserPicker callback={id => selectUser(id.toString())} toast={toast} />

        <Stack direction="column">
          {roleElems}
        </Stack>

        <ConfirmationButton isDisabled={userId === ""} onClick={deleteRoles}>Remove role</ConfirmationButton>
      </EndpointForm>
    </div>
  )

  function selectUser(newId: string) {
    setUserId(newId);

    fetchGracefully(backendUrl + `/backend/user/${newId}/assignedRoles`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jws")}`
      }
    }, null, toast)
    .then(response => response.json())
    .then(rolesData => {
      const tempRoleElems: JSX.Element[] = [];
      const tempRoles: Map<number, boolean> = new Map();

      for (let role of rolesData) {
        tempRoles.set(role.assignedRoleId, false);
        tempRoleElems.push(<Stack direction="row">
          <Checkbox onChange={event => {
            tempRoles.set(role.assignedRoleId, event.target.checked)
            setRoles(tempRoles);
          }} />
          <p>{role.roleName}</p>
        </Stack>)
      }
      setRoles(tempRoles);
      setRoleElems(tempRoleElems);
    })
    .catch(error => console.error("Error: ", error));
  }

  function deleteRoles() {
    console.debug(roles);
    console.error("Not implemented");
    return;
    /*
    roles.forEach((shouldDelete: boolean, id: number) => {
      // I CAN'T GET THE USER ROLE ID
    })
    */
  }
}
