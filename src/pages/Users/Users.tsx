import { LinkIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function Users() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>Users</GroupHeading>
      <UsersContent />
    </div>
  )
}

export function UsersContent() {
  const location = useLocation();
  const url = location.pathname === '/users' ? '' : '/users/';
  return (
    <div className="LinkList">
      <ChakraLink as={RouterLink} to={`${url}show`}>Show user<LinkIcon /></ChakraLink>
    </div>
  )
}
