import { Button, FormControl, FormLabel, Input, Stack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";

export default function Upload() {
  const [fileName, setFileName] = useState<String>("");
  const [file, setFile] = useState<File|null>(null);

  const toast = useToast();

  async function uploadFile() {
    if (file === null) {
      return;
    }
    await fetchGracefully(
      ((process.env.REACT_APP_PROD === 'yes' ? 'https://gttournament.cz' : process.env.REACT_APP_BACKEND_URL) + "/backend/file/" + fileName),
      'PUT',
      file,
      [
        ["Authorization", `Bearer ${localStorage.getItem("jws")}`],
        ['Content-Type', file.type,]
      ],
      "File uploaded successfully", toast);
  }

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        <FormControl>
          <FormLabel>File</FormLabel>
          <Input type="text" onChange={(event) => setFileName(event.target.value)}/>
          <Input type="file" onChange={(event) => setFile(event.target.files !== null?event.target.files[0]: null)}/>
        </FormControl>

        <Button onClick={uploadFile} fontSize="2rem" colorScheme="GttOrange" width="fit-content" padding="1em">upload file</Button>
        
      </Stack>
    </div>
  );

}