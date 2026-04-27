import { ToggleDetails } from "@instructure/ui";

function DateFilterPageToggleGroup({ expanded, setExpanded, children }) {
  return (
    <ToggleDetails
      summary="Apply Filters"
      themeOverride={{ borderColor: "transparent", borderWidth: "0" }}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      {children}
    </ToggleDetails>
  );
}

export default DateFilterPageToggleGroup;
