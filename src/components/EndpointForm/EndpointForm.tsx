import { Stack } from "@chakra-ui/react";

export default function EnpointForm({ children }: { children: React.ReactNode}) {
  return (<Stack direction="column" spacing="2rem" marginTop="5rem" minWidth="60%" width="fit-content">
    {children}
  </Stack>)
}
