import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Stack,
} from '@chakra-ui/react'

type ConfirmationModalProps = {
  isOpen: boolean,
  onClose: () => void,
  body: string,
  confirmFunction: () => void,
  title?: string,
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{props.title?? "Are you sure?"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{props.body}</ModalBody>

        <ModalFooter>
          <Stack direction="row" spacing="1rem"> 
            <Button colorScheme="red" onClick={() => {props.onClose(); props.confirmFunction()}}>Confirm</Button>
            <Button variant="ghost" onClick={props.onClose}>Cancel</Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
