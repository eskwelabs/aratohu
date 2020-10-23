// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { Widget } from "@lumino/widgets";
import { IHeading } from "./utils/headings";
import { TableOfContentsRegistry as Registry } from "./registry";
import { TOCItem } from "./toc_item";
import { VideoResponse } from "./toc";
import { getTitleString } from "./utils/title_string";

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
   * Table of contents generator.
   */
  generator: Registry.IGenerator<Widget> | null;

  /**
   * Toolbar
   */
  toolbar: any;

  /**
   * Metadata ID of the current active cell
   */
  activeCell: string;

  /**
   * Text of the current active cell
   */
  activeCellText: string;

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
  protected triggerCellIds(triggerCells: VideoResponse[] | null) {
    if (!triggerCells) {
      return [];
    }
    return triggerCells.map((t: VideoResponse) => t.cellMetadataId);
  }

  /**
   * Renders a table of contents tree.
   */
  render() {
    let videoUrl;
    const Toolbar = this.props.toolbar;
    // const metadata = this.props.metadata;
    const { activeCell, activeCellText, triggerCells } = this.props;
    const triggerCellIds = this.triggerCellIds(triggerCells);

    // Map the heading objects onto a list of JSX elements...
    let i = 0;
    let list: JSX.Element[] = this.props.toc.map(el => {
      return (
        <TOCItem
          heading={el}
          itemRenderer={this.props.itemRenderer}
          key={`${el.text}-${el.level}-${i++}`}
          hasVideo={triggerCellIds.includes(
            (el as any).cellRef.model.metadata.get("aratohu-id")
          )}
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

    if (activeCell && triggerCellIds.includes(activeCell)) {
      const triggerCell = triggerCells.find(
        a => a.cellMetadataId === activeCell
      );
      if (triggerCell) {
        videoUrl = triggerCell.videoUrl;
      }
    }

    return (
      <div className="jp-TableOfContents">
        <header>{this.props.title}</header>
        {activeCell && videoUrl ? (
          <iframe
            width="100%"
            height={height}
            src={
              videoUrl +
              "?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&theme=light&color=white"
            }
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
            style={{ border: "none" }}
          ></iframe>
        ) : (
          <img
            src="https://d1igpor9ui96fr.cloudfront.net/aaplus/aaplus-logo.svg"
            width="100%"
            height={height}
          />
        )}
        {Toolbar && <Toolbar currentCell={getTitleString(activeCellText)} />}
        <ul className="jp-TableOfContents-content">{list}</ul>
      </div>
    );
  }
}

/**
 * Exports.
 */
export { TOCTree };
