import { ToggleDetails } from "@instructure/ui-toggle-details";

function DateFilterPageToggleGroup({ expanded, setExpanded, children }) {
  return (
    <ToggleDetails
      summary="Apply Filters"
      background="transparent"
      themeOverride={{ borderColor: "transparent", borderWidth: "0" }}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      {children}
    </ToggleDetails>
  );
}

export default DateFilterPageToggleGroup;
