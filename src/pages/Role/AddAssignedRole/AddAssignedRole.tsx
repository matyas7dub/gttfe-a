import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import DataPicker, { dataType } from "../../../components/DataPicker/DataPicker";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import UserPicker from "../../../components/UserPicker/UserPicker";
import { backendUrl } from "../../../config/config";

export default function AddAssignedRole() {
  const [roleId, setRoleId] = useState(0);
  const [userId, setUserId] = useState("");

  const toast = useToast();

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <UserPicker callback={id => setUserId(id)} toast={toast} />

        <DataPicker dataType={dataType.assignedRoles} changeHandler={event => setRoleId(Number(event.target.value))} />

        <ConfirmationButton isDisabled={userId === "" || roleId === 0} onClick={addRole}>Add role</ConfirmationButton> 
      </EndpointForm>
    </div>
  );

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