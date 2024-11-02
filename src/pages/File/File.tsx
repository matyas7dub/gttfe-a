import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Link as ChakraLink } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";
import GroupHeading from "../../components/GroupHeading/GroupHeading";

export default function File() {
  return (
    <div>
      <Breadcrumbs />

      <GroupHeading>File</GroupHeading>
      <FileContent />
    </div>
  )
}

export function FileContent() {
  const location = useLocation();
  const url = location.pathname === '/file' ? '' : '/file/';
  return (
    <div className={"LinkList"}>
      <ChakraLink as={RouterLink} to={`${url}upload`}>Upload file<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}list`}>List files<LinkIcon /></ChakraLink>
    </div>
  )
}
