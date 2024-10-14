import { Button, Card, Link as ChakraLink, Flex, Stack, useToast } from "@chakra-ui/react";
import { DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { fetchGracefully } from "../../../components/Navbar/Login/LoginScript";
import { backendUrl } from "../../../config/config";

interface ListAPI {
  fileName: string,
  address: string
}

export default function List() {
  const [files, setFiles] = useState<JSX.Element[]>([<div></div>]);

  const toast = useToast();

  async function deleteFile (fileName: string){
    await fetchGracefully(
      backendUrl + `/backend/file/${fileName}`,
      'DELETE',
      null,
      [
        ["Authorization", `Bearer ${localStorage.getItem("jws")}`]
      ],
      "Files deleted successfully", toast);
    listFiles()
  }

  async function listFiles() {
    let result = await fetchGracefully(
      backendUrl + "/backend/file/list",
      'GET',
      null,
      [
        ["Authorization", `Bearer ${localStorage.getItem("jws")}`]
      ],
      "Files listed successfully", toast);
    if (typeof result === "undefined") {
      return
    }
    let parsed: ListAPI[] = await result?.json();
    let tmpFiles = [];
    console.log(parsed);
    for (let file of parsed) {
      tmpFiles.push(<div>
        <Card width="fit-content" minWidth="30%" marginTop="-2rem">
          <Flex justifyContent="space-between" alignItems="center"padding="1rem">
            <ChakraLink href={file.address}>{file.fileName}</ChakraLink>
            <Button onClick={() => { deleteFile(file.fileName) }}><DeleteIcon></DeleteIcon></Button>
          </Flex>
        </Card>
      </div>)
    }
    setFiles(tmpFiles);
  }
  useEffect(() => {
    listFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  return (
    <div>
      <Breadcrumbs />

      <Stack direction="column" spacing="3rem" className="Form">
        {files}  
      </Stack>
    </div>
  );

}
