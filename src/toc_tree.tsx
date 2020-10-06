// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { Widget } from "@lumino/widgets";
import { IHeading } from "./utils/headings";
import { TableOfContentsRegistry as Registry } from "./registry";
import { TOCItem } from "./toc_item";

let videoUrl = "https://www.youtube.com/embed/0vScpMg-HLY";

const triggerCells: any = {
  "# Core Statistics for Data Science":
    "https://www.youtube.com/embed/0vScpMg-HLY",
  "## Measures of Central Tendencies":
    "https://www.youtube.com/embed/zoZfzFsXunQ",
  "### Measures of Dispersion": "https://www.youtube.com/embed/tK7zw1A2Z7c",
  "### Distribution Functions": "https://www.youtube.com/embed/7M9a9P13MOY"
};

/**
 * Interface describing component properties.
 *
 * @private
 */
interface IProperties extends React.Props<TOCTree> {
  /**
   * Display title.
   */
  title: string;

  /**
   * List of headings to render.
   */
  toc: IHeading[];

  /**
   * Toolbar.
   */
  toolbar: any;

  /**
   * Table of contents generator.
   */
  generator: Registry.IGenerator<Widget> | null;

  /**
   * Notebook metadata to load video content
   */
  metadata: any;

  /**
   * Text of the current active cell
   */
  activeCell: string;

  /**
   * Renders a heading item.
   *
   * @param item - heading
   * @returns rendered heading
   */
  itemRenderer: (item: IHeading) => JSX.Element | null;
}

/**
 * Interface describing component state.
 *
 * @private
 */
interface IState {}

/**
 * React component for a table of contents tree.
 *
 * @private
 */
class TOCTree extends React.Component<IProperties, IState> {
  /**
   * Renders a table of contents tree.
   */
  render() {
    const Toolbar = this.props.toolbar;
    // const metadata = this.props.metadata;
    const activeCell = this.props.activeCell;

    // Map the heading objects onto a list of JSX elements...
    let i = 0;
    let list: JSX.Element[] = this.props.toc.map(el => {
      return (
        <TOCItem
          heading={el}
          itemRenderer={this.props.itemRenderer}
          key={`${el.text}-${el.level}-${i++}`}
        />
      );
    });

    console.log("TOCTree render", this.props);

    if (activeCell in triggerCells) {
      videoUrl = triggerCells[activeCell];
    }

    return (
      <div className="jp-TableOfContents">
        <header>{this.props.title}</header>
        {activeCell && (
          <iframe
            width="100%"
            height="200"
            src={videoUrl}
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
          ></iframe>
        )}
        {Toolbar && <Toolbar />}
        <ul className="jp-TableOfContents-content">{list}</ul>
      </div>
    );
  }
}

/**
 * Exports.
 */
export { TOCTree };
