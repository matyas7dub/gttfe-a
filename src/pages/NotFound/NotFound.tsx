import { Center, Heading, Stack } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

export default function NotFound() {
  return (
    <Center width="100%" height="60vh">
      <Stack direction="column">
        <Heading size="4xl">404 Not found</Heading>
        <Center>
          <ChakraLink as={RouterLink} to="/" fontSize="2rem">Return to homepage</ChakraLink>
        </Center>
      </Stack>
    </Center>
  )
}
