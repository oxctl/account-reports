import { List } from "@instructure/ui-list";
import { Text } from "@instructure/ui-text";
import { Link } from "@instructure/ui-link";
import { ToggleDetails } from "@instructure/ui-toggle-details";

export function SisImportListItem({ sisImport }) {
  function AttachmentsList({ attachments }) {
    if (!Array.isArray(attachments)) return null;

    return (
      <List>
        {attachments.map((attachment, index) => (
          <List.Item key={index}>
            <Link
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {attachment.filename}
            </Link>
          </List.Item>
        ))}
      </List>
    );
  }

  function WarningsList({ warnings }) {
    if (!Array.isArray(warnings)) return null;

    return (
      <List>
        {warnings.map(([filename, message], index) => (
          <List.Item key={index}>
            <Text>{filename}:</Text> {message}
          </List.Item>
        ))}
      </List>
    );
  }

  function CountsList({ counts }) {
    if (!counts || Object.keys(counts).length === 0) {
      return <Text>No data available.</Text>;
    }

    return (
      <List>
        {Object.entries(counts).map(([key, value]) => (
          <List.Item key={key}>
            <Text as="span">{key}:</Text> {value}
          </List.Item>
        ))}
      </List>
    );
  }

  return (
    <List.Item key={sisImport.id} margin="small 0">
      <Text as="span">
        SIS Import ID: {sisImport.id}{" "}
        {sisImport.user.name ? sisImport.user.name : "Unknown user"} (
        {sisImport.ended_at
          ? new Date(sisImport.ended_at).toLocaleString()
          : "N/A"}
        )
      </Text>
      <List>
        <List.Item>
          <ToggleDetails summary="Summary of changes">
            <CountsList
              counts={sisImport.data.counts ? sisImport.data.counts : 0}
            />
          </ToggleDetails>
        </List.Item>
        <List.Item>
          <Text>Attachments:</Text>
          <AttachmentsList attachments={sisImport.csv_attachments} />
        </List.Item>

        {sisImport.errors_attachment && sisImport.errors_attachment.url && (
          <List.Item>
            <Text>Errors:&nbsp;</Text>
            <Link
              href={sisImport.errors_attachment.url}
              rel="noopener noreferrer"
            >
              <Text as="span">
                {sisImport.errors_attachment.url
                  ? sisImport.errors_attachment.url
                  : "No errors"}
              </Text>
            </Link>
          </List.Item>
        )}

        {sisImport.processing_warnings && (
          <List.Item>
            <Text>Warning messages: </Text>
            <WarningsList warnings={sisImport.processing_warnings} />
          </List.Item>
        )}
      </List>
    </List.Item>
  );
}

export default SisImportListItem;
