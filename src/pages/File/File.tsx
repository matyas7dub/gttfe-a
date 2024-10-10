import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Link as ChakraLink, Heading } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function File() {
  return (
    <div>
      <Breadcrumbs />

      <Heading className={"Heading"}>File</Heading>
      <FileContent />
    </div>
  )
}

export function FileContent() {
  const location = useLocation();
  const url = location.pathname === '/file' ? '' : '/file/';
  return (
    <div className={"LinkList"}>
      <ChakraLink as={RouterLink} to={`${url}upload`}>upload file<LinkIcon /></ChakraLink>
      <ChakraLink as={RouterLink} to={`${url}list`}>list files<LinkIcon /></ChakraLink>
    </div>
  )
}
