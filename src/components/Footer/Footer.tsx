import { Center, Tooltip } from "@chakra-ui/react";

export default function Footer() {
  const color = "#C8C8C8";
  const commitHash = String(process.env.REACT_APP_COMMIT_HASH?? "").substring(0, 7);
  return (
    <Center borderTop={`2px solid ${color}`} color={color} gap="2rem" padding="1em" marginTop="20vh" marginBottom="5vh">
      <Tooltip label={`Built from commit ${commitHash === "" ? "Development" : commitHash}`}>Hover me for build!</Tooltip> </Center>
  )
}
