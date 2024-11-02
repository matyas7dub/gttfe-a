import { Divider } from "@chakra-ui/react";

type FormDividerProps = {
  orientation?: "horizontal" | "vertical"
}
export default function FormDivider(props: FormDividerProps){
  return <Divider orientation={props.orientation} marginTop="0.5rem" marginBottom="0.5rem" />
}
