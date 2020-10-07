// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { IHeading } from "./utils/headings";
import { getTitleString } from "./utils/title_string";

/**
 * Interface describing component properties.
 *
 * @private
 */
interface IProperties extends React.Props<TOCItem> {
  /**
   * Heading to render.
   */
  heading: IHeading;

  /**
   * Renders a heading.
   *
   * @param item - heading
   * @returns rendered heading
   */
  itemRenderer: (item: IHeading) => JSX.Element | null;

  triggerCells: any;
}

/**
 * Interface describing component state.
 *
 * @private
 */
interface IState {}

/**
 * React component for a table of contents entry.
 *
 * @private
 */
class TOCItem extends React.Component<IProperties, IState> {
  /**
   * Renders a table of contents entry.
   *
   * @returns rendered entry
   */
  render() {
    const { heading, triggerCells } = this.props;

    // Create an onClick handler for the TOC item
    // that scrolls the anchor into view.
    const onClick = (event: React.SyntheticEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      heading.onClick();
    };

    let content = this.props.itemRenderer(heading);

    const titleString = getTitleString(heading.text);

    if (titleString in triggerCells) {
      return content && <li onClick={onClick}>{content} 🎥</li>;
    }

    return content && <li onClick={onClick}>{content}</li>;
  }
}

/**
 * Exports.
 */
export { TOCItem };
