import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@chakra-ui/icons';

export default function Breadcrumbs() {
  const location = useLocation();
  const { pathname }  = location;
  const segments = pathname.split('/');

  let url = '';
  let returnValue = [];


  $top: for (let i = 0; i < segments.length; i++) {
    url += `${segments[i]}/`;
    const name = segments[i].split('-');
    let capitalisedName = '';
    for (let word of name) {
      if (word === '') {
        if (i > 0) {
          break $top;
        }
        capitalisedName = 'Home';
      } else {
        let capitalised = word.toUpperCase();
        capitalisedName += capitalised.at(0) + word.slice(1) + ' ';
      }
    }
    capitalisedName.trim();

    if (i === segments.length - 1) {
      returnValue.push(
        <BreadcrumbItem key={capitalisedName} isCurrentPage>
          <BreadcrumbLink as={Link}>
            {capitalisedName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      )
    } else {
        returnValue.push(
        <BreadcrumbItem key={url}>
          <BreadcrumbLink as={Link} to={url}>
            {capitalisedName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      )
    }
  }

  return (
    <div style={{marginBottom: "1rem"}}>
      <Breadcrumb separator={<ChevronRightIcon/>}>
        {returnValue}
      </Breadcrumb>
    </div>
  );
}
