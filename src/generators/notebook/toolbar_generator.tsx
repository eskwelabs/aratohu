// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { INotebookTracker } from "@jupyterlab/notebook";
import { OptionsManager } from "./options_manager";

/**
 * Interface describing toolbar properties.
 *
 * @private
 */
interface IProperties {
  currentCell: string;
}

/**
 * Interface describing toolbar state.
 *
 * @private
 */

/**
 * Returns a component for rendering a notebook table of contents toolbar.
 *
 * @private
 * @param options - generator options
 * @param tracker - notebook tracker
 * @returns toolbar component
 */
function toolbar(options: OptionsManager, tracker: INotebookTracker) {
  return class Toolbar extends React.Component<IProperties> {
    /**
     * Returns a component for rendering a notebook table of contents toolbar.
     *
     * @param props - toolbar properties
     * @returns toolbar component
     */
    constructor(props: IProperties) {
      super(props);

      if (tracker.currentWidget) {
        // Read saved user settings in notebook meta data:
        tracker.currentWidget.context.ready.then(() => {
          if (tracker.currentWidget) {
            tracker.currentWidget.content.activeCellChanged.connect(() => {
              options.updateWidget();
            });
          }
        });
      }
    }

    /**
     * Renders a toolbar.
     *
     * @returns rendered toolbar
     */
    render() {
      const currentCell = this.props.currentCell;

      return (
        <div>
          <div className={"toc-toolbar"}>
            <strong style={{ fontWeight: "bolder", marginRight: "15px" }}>
              Current cell:
            </strong>{" "}
            {currentCell}
          </div>
        </div>
      );
    }
  };
}

/**
 * Exports.
 */
export { toolbar };
