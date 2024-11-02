import { Heading } from "@chakra-ui/react";

export default function GroupHeading({ children }: { children: String}) {
  return (
    <Heading marginBottom="-0.2rem">{children}</Heading>
  )
}
