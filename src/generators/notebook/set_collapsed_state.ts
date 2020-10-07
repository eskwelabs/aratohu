// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Cell, CodeCell, CodeCellModel } from "@jupyterlab/cells";
import { INotebookTracker } from "@jupyterlab/notebook";
import { Panel } from "@lumino/widgets";
import { parseHeading } from "../../utils/parse_heading";
import { isMarkdown } from "../../utils/is_markdown";
import { isDOM } from "../../utils/is_dom";

/**
 * Collapses or expands ("un-collapses") a notebook cell by either hiding or displaying its section-defined sub-cells (i.e., cells which have lower precedence).
 *
 * @private
 * @param tracker - notebook tracker
 * @param cell - notebook cell
 * @param state - collapsed state (`true` if collapse; `false` if expand)
 */
function setCollapsedState(
  tracker: INotebookTracker,
  cell: Cell,
  state: boolean
): void {
  // Ensure a widget is currently focused...
  if (tracker.currentWidget === null) {
    return;
  }
  // Guard against attempting to collapse already hidden cells...
  if (state) {
    if (cell.isHidden) {
      return;
    }
  }
  // Guard against attempting to expand cells which we did not collapse or are already expanded...
  else if (
    cell.model.metadata.has("toc-nb-collapsed") === false ||
    cell.model.metadata.get("toc-nb-collapsed") === false
  ) {
    // FIXME: we can end up here when attempting to expand a section generated by a code cell
    return;
  }
  if (cell.model.type !== "markdown") {
    // FIXME: if we're here, it's because the user is attempting to collapse/expand a section generated by a code cell
    return;
  }
  const heading = parseHeading(cell.model.value.text);

  // Guard against attempting to (un-)collapse cells which are not "collapsible" (i.e., do not define sections)...
  if (heading === null) {
    return;
  }
  const level = heading.level;

  const widgets = tracker.currentWidget.content.widgets;
  const len = widgets.length;
  const idx = widgets.indexOf(cell);

  // Guard against an unrecognized "cell" argument...
  if (idx === -1) {
    return;
  }
  // Search for notebook cells which are semantically defined as sub-cells...
  for (let i = idx + 1; i < len; i++) {
    const w = widgets[i];

    // Cells which are neither Markdown nor code cells can be readily collapsed/expanded...
    if (w.model.type !== "markdown" && w.model.type !== "code") {
      w.setHidden(state);
      continue;
    }
    // Markdown cells are relatively straightforward, as we can determine whether to collapse/expand based on the level of the **first** encountered heading...
    if (w.model.type === "markdown") {
      const h = parseHeading(w.model.value.text);

      // Check if a widget is at the same or higher level...
      if (h && h.level >= 0 && h.level <= level) {
        // We've reached the end of the section...
        break;
      }
      // Collapse/expand a sub-cell by setting the its `hidden` state:
      w.setHidden(state);
      continue;
    }
    // Code cells are more involved, as we need to analyze the outputs to check for generated Markdown/HTML...
    const c = w as CodeCell;
    const model = w.model as CodeCellModel;
    const outputs = model.outputs;

    // First, we do an initial pass to check for generated Markdown/HTML. If we don't find Markdown/HTML, then the entire cell can be collapsed/expanded (both inputs and outputs)...
    let FLG = false;
    let dtypes: string[] = [];
    for (let j = 0; j < outputs.length; j++) {
      // Retrieve the cell output model:
      const m = outputs.get(j);

      // Check the cell output MIME types:
      dtypes = Object.keys(m.data);
      for (let k = 0; k < dtypes.length; k++) {
        const t = dtypes[k];
        if (isMarkdown(t) || isDOM(t) || t === "text/plain") {
          // FIXME: apparent Jupyter bug where additional Markdown displays have a `text/plain` MIME type
          FLG = true;
        } else {
          dtypes[k] = "";
        }
      }
    }
    // If we did not find Markdown/HTML, collapse/expand the entire cell...
    if (FLG === false) {
      w.setHidden(state);
      continue;
    }
    // Now, we perform a second pass to determine whether the output areas containing generated Markdown/HTML contain headings at the same or higher level...
    let idx = -1;
    for (let j = 0; j < outputs.length; j++) {
      if (dtypes[j] === "") {
        continue;
      }
      // Retrieve the output area widget:
      const ow = c.outputArea.widgets[j] as Panel;

      // Determine the heading level from the rendered HTML of the output area result:
      const h = parseHeading(ow.widgets[1].node.innerHTML);

      // Check if an output widget contains a heading at the same or higher level...
      if (h && h.level >= 0 && h.level <= level) {
        // We've reached the end of the section...
        idx = j;
        break;
      }
    }
    // If we did not encounter a new section, we can safely collapse/expand the entire widget...
    if (idx === -1) {
      w.setHidden(state);
      continue;
    }
    // Finally, we perform a third pass to collapse/expand individual output area widgets...
    for (let j = 0; j < idx; j++) {
      const ow = c.outputArea.widgets[j] as Panel;
      ow.setHidden(state);
    }
    // Collapse/expand a sub-cell's input area by setting the its `hidden` state (NOTE: a collapsed input area will still appear collapsed!!! Only when a user clicks on the collapsed cell ellipses will the input area display (or, rather, not display!) as being fully hidden. If we want an input area to always be present, e.g., to always allow a user the ability to edit an expanded section, whether or not generated sections are collapsed or expanded, we could remove the following line.):
    // w.inputArea.setHidden(state); // NOTE: intentionally commented out in order to preserve the above disclaimer and to preserve the option of alternative rendering
  }
  if (state) {
    // Set a meta-data flag to indicate that we've collapsed notebook sections:
    cell.model.metadata.set("toc-nb-collapsed", true);
  } else {
    // Remove the meta-data flag indicating that we'd collapsed notebook sections:
    cell.model.metadata.delete("toc-nb-collapsed");
  }
}

/**
 * Exports.
 */
export { setCollapsedState };