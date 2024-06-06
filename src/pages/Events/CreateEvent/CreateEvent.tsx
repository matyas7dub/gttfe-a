import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { EventPicker } from "../Events";

export default function CreateEvent() {
  return (
    <div>
      <Breadcrumbs />
      <div className="Form">
        <EventPicker changeHandler={() => {}} />
      </div>
    </div>
  )
}
