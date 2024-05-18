import ColorModeButton from "../../../components/ColorModeButton/ColorModeButton";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "@chakra-ui/react";
import Login from "../../../components/Login/Login";
import GamePicker from "../../../components/GamePicker/GamePicker";
import { ChangeEvent } from "react";

export default function Update() {
  return (
    <div>
      <Breadcrumbs />
      <Stack direction="row" className={"topRight"}>
        <Login />
        <ColorModeButton />
      </Stack>
      <Stack direction="column" spacing="3rem" className="Form">
        <GamePicker isInvalid={false} changeHandler={(event: ChangeEvent) => console.log(event)}/>
      </Stack>
    </div>
  );
}
