import { Link as ChakraLink } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkIcon } from "@chakra-ui/icons";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs"
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function School() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>School</GroupHeading>
      <SchoolContent />
    </div>
  )
}

export function SchoolContent() {
  const location = useLocation();
  const url = location.pathname === '/school' ? '' : '/school/';
  return (
    <div>
      <div className={'LinkList'}>
        <ChakraLink as={RouterLink} to={`${url}create`}>Create a school<LinkIcon /></ChakraLink>
      </div>
    </div>
  )
}
