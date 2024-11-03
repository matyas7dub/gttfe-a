import { Alert, AlertDescription, AlertIcon, AlertTitle, FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ConfirmationButton from "../../../components/ConfirmationButton/ConfirmationButton";
import EndpointForm from "../../../components/EndpointForm/EndpointForm";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

export default function Upload() {
  const [fileNames, setFileNames] = useState<Map<string, string>>(new Map());
  const [fileRenameElems, setFileRenameElems] = useState<JSX.Element[]>();
  const [files, setFiles] = useState<FileList | null>();

  const toast = useToast();

  function uploadFiles() {
    if (files === null) {
      return;
    }

    for (let file = 0; file < (files ? files?.length : 0); file++) {
      const fileName = fileNames.get(files ? (files.item(file) as File).name : "");
      if (fileName === "" || fileName === undefined) {
        // shouldn't happen (I think)
        console.error("Couldn't get original file name");
        toast({
          title: "Couldn't upload a file",
          status: 'error',
          duration: 5000,
          isClosable: true
        })
        continue;
      }

      fetchGracefully(backendUrl + `/backend/file/${fileName}`,
      {
        method: "PUT",
        body: (files as FileList)[file],
        headers: [
          ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
          ['Content-Type', (files as FileList)[file].type,]
        ]
      },
      `${fileName} uploaded successfully`, toast);
    }
  }

  function selectFiles(newFiles: FileList) {
    setFiles(newFiles);

    const tempFileNames: Map<string, string> = new Map();
    const renameElems: JSX.Element[] = [];
    for (let file = 0; file < newFiles.length; file++) {
      const name = (newFiles.item(file) as File).name;
      tempFileNames.set(name, name);
      renameElems.push(<FormControl>
        <FormLabel>Rename {name}</FormLabel>
        <Input type="text" placeholder={name} onChange={event => {
          let newName = event.target.value;
          if (newName !== "") {
            tempFileNames.set(name, newName)
          } else {
            tempFileNames.set(name, name);
          }
          setFileNames(tempFileNames);
        }} />
      </FormControl>)
    }
    setFileNames(tempFileNames);
    setFileRenameElems(renameElems);
  }

  return (
    <div>
      <Breadcrumbs />

      <EndpointForm>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Tip</AlertTitle>
          <AlertDescription>You can upload multiple files</AlertDescription>
        </Alert>

        <FormControl>
          <FormLabel>File</FormLabel>
          <Input type="file" multiple={true} onChange={(event) => selectFiles(event.target.files ? event.target.files : new FileList())}/>
        </FormControl>

        {fileRenameElems}

        <ConfirmationButton isDisabled={files ? files.length === 0 : true} onClick={uploadFiles}>Upload file{files && files.length > 1 ? "s" : ""}</ConfirmationButton>
      </EndpointForm>
    </div>
  );

}
