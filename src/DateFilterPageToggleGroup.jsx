import { ToggleDetails } from "@instructure/ui-toggle-details";

function DateFilterPageToggleGroup({ expanded, setExpanded, children }) {
  return (
    <ToggleDetails
      toggleLabel="Show or hide filter controls"
      summary="Apply Filters"
      background="transparent"
      transition="true"
      themeOverride={{ borderColor: "transparent", borderWidth: "0" }}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      {children}
    </ToggleDetails>
  );
}

export default DateFilterPageToggleGroup;
