import { Button } from "@chakra-ui/react";
import { PropsWithChildren, useState } from "react";

type ConfirmationButtonProps = {
  isDisabled?: boolean,
  onClick: () => void
}
export default function ConfirmationButton(props: PropsWithChildren<ConfirmationButtonProps>) {
  const [wasPushed, setWasPushed] = useState(false);
  return (
    <Button isDisabled={props.isDisabled || wasPushed} onClick={click}
      fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">
      {props.children}
    </Button>
  )

  function click() {
    setWasPushed(true);
    props.onClick();
    setTimeout(() => {
      setWasPushed(false);
    }, 1500);
  }
}
