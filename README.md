# Acrobat Export Highlights Script

This script is designed to export annotations (highlights, underlines, squiggly, strikeout, and redact) from a PDF document. It processes each annotation, extracts the relevant content, and generates a report.

## Usage

To use this script in Adobe Acrobat Pro, follow these steps:

1. Open your PDF document in Adobe Acrobat Pro.
2. Go to `Action Wizard` or `Use guided actions` and creating a new `Custom Command` and selecting `Execute Javascript`
3. Paste the content of `script.js` into the `Command Options` editor
4. Save and close the editor.
5. Run the custom command from the Custom Commands menu

## Script Details

The script performs the following actions:

1. **Initialization**:
   - Displays the console and clears any previous messages.
   - Initializes variables and arrays to store annotation data.

2. **Annotation Processing**:
   - Scans the document for annotations.
   - Filters annotations by type (Highlight, Underline, Squiggly, StrikeOut, Redact).
   - Extracts page numbers, quads, and contents of each annotation.
   - Sorts and processes the annotations to extract the highlighted text.

3. **Generating Report**:
   - Compiles the extracted text into a formatted report.
   - Saves the report as a `Comments of 'DATE TIME'.txt` file attachment to the document attachments.
   - Displays the process duration and final message in the console.
   - Alerts the user with the number of comments detailed and attaches the report file.
