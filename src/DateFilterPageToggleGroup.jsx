import { ToggleGroup } from "@instructure/ui-toggle-details";

function DateFilterPageToggleGroup({ expanded, setExpanded, children }) {
  return (
    <ToggleGroup
      toggleLabel="Show or hide filter controls"
      summary="Apply Filters"
      background="default"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      {children}
    </ToggleGroup>
  );
}

export default DateFilterPageToggleGroup;
