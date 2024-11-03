import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Link as ChakraLink } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Role() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Role</GroupHeading>
      <RoleContent />
    </div>
  )
}

export function RoleContent() {
  const location = useLocation();
  const url = location.pathname === '/role' ? '' : '/role/';
  return (
    <div className={"LinkList"}>
      <ChakraLink as={RouterLink} to={`${url}add-to-user`}>Add role to a user<LinkIcon /></ChakraLink>
      { /* <ChakraLink as={RouterLink} to={`${url}remove-from-user`}>Remove role from a user<LinkIcon /></ChakraLink> */ }
    </div>
  )
}
