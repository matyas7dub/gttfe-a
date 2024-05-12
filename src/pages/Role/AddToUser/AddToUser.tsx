import ColorModeButton from "../../../components/ColorModeButton/ColorModeButton";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { HStack } from "@chakra-ui/react";
import Login from "../../../components/Login/Login";

export default function AddToUser() {
  return (
    <div>
      <Breadcrumbs />
      <HStack className={"topRight"}>
        <Login />
        <ColorModeButton />
      </HStack>
    </div>
  );
}
