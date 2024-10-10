import { Button } from "@chakra-ui/react";
import { MouseEventHandler, PropsWithChildren } from "react";

type ConfirmationButtonProps = {
  isDisabled?: boolean,
  onClick: MouseEventHandler
}
export default function ConfirmationButton(props: PropsWithChildren<ConfirmationButtonProps>) {
  return (
    <Button isDisabled={props.isDisabled} onClick={props.onClick}
      fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">
      {props.children}
    </Button>
  )
}
