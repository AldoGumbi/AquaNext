// Local Imports
import { Page } from "components/shared/Page";
import { Statistics } from "./Statistics";

// ----------------------------------------------------------------------

export default function Sales() {
  return (
    <Page title="Sales Dashboard">
      <div className="transition-content overflow-hidden px-(--margin-x) pb-8">
        <Statistics />
      </div>
    </Page>
  );
}
