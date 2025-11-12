import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function CreateSchool() {
  const [schoolName, setSchoolName] = useState("");

  const toast = useToast();
  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <FormControl>
          <FormLabel>School name</FormLabel>
          <Input type="text" onChange={event => setSchoolName(event.target.value)} />
        </FormControl>

        <ConfirmationButton isDisabled={schoolName === ""} onClick={createSchool}>Update school</ConfirmationButton> 

      </EndpointForm>
    </div>
  )

  function createSchool() {
    fetchGracefully(backendUrl + "/backend/school/",
    {
      method: "POST",
      body: JSON.stringify({
        name: schoolName,
      }),
      headers: {"Content-Type": "application/json"}
    },
    "School created successfully", toast);
  }
}
