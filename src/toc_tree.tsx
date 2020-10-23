// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { Widget } from "@lumino/widgets";
import { IHeading } from "./utils/headings";
import { TableOfContentsRegistry as Registry } from "./registry";
import { TOCItem } from "./toc_item";
import { VideoResponse } from "./toc";

/**
 * Interface describing component properties.
 *
 * @private
 */
interface IProperties {
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
   * Text of the current active cell
   */
  activeCell: string;

  /**
   * List of trigger cells
   */
  triggerCells: VideoResponse[];

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
  protected triggerCellIds(triggerCells: VideoResponse[]) {
    return triggerCells.map((t: VideoResponse) => t.cellMetadataId);
  }

  /**
   * Renders a table of contents tree.
   */
  render() {
    let videoUrl;
    const Toolbar = this.props.toolbar;
    // const metadata = this.props.metadata;
    const activeCell = this.props.activeCell;
    const triggerCells = this.props.triggerCells;

    // Map the heading objects onto a list of JSX elements...
    let i = 0;
    let list: JSX.Element[] = this.props.toc.map(el => {
      return (
        <TOCItem
          heading={el}
          itemRenderer={this.props.itemRenderer}
          key={`${el.text}-${el.level}-${i++}`}
          triggerCells={triggerCells}
        />
      );
    });

    let height = 300;

    if (document && document.querySelector(".jp-TableOfContents")) {
      const elWidth = (document!.querySelector(
        ".jp-TableOfContents"
      )! as HTMLElement).offsetWidth;
      height = (elWidth / 16) * 9;
    }

    console.log("TOCTree render", this.props);

    if (activeCell in this.triggerCellIds(triggerCells)) {
      videoUrl = triggerCells.filter(a => a.cellMetadataId === activeCell);
    }

    return (
      <div className="jp-TableOfContents">
        <header>{this.props.title}</header>
        {activeCell && videoUrl && (
          <iframe
            width="100%"
            height={height}
            src={
              videoUrl +
              "?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&theme=light&color=white&controls=0"
            }
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
