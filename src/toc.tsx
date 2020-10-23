// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import * as ReactDOM from "react-dom";
import { ActivityMonitor, PathExt } from "@jupyterlab/coreutils";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { IRenderMimeRegistry } from "@jupyterlab/rendermime";
import { Message } from "@lumino/messaging";
import { Widget } from "@lumino/widgets";
import { IHeading } from "./utils/headings";
import { TableOfContentsRegistry as Registry } from "./registry";
import { TOCTree } from "./toc_tree";

function debounce(callback: Function, wait: number, immediate = false) {
  let timeout: number | undefined;

  return function() {
    const callNow = immediate && !timeout;
    const next = () => callback.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(next, wait);

    if (callNow) {
      next();
    }
  };
}

/**
 * Timeout for throttling ToC rendering.
 *
 * @private
 */
const RENDER_TIMEOUT = 1000;

export type VideoResponse = {
  _id: string;
  cellMetadataId: string;
  cellTitle: string;
  videoUrl: string;
};

/**
 * Widget for hosting a notebook table of contents.
 */
export class TableOfContents extends Widget {
  triggerCells: VideoResponse[];
  aratohuId: string | null;
  /**
   * Returns a new table of contents.
   *
   * @param options - options
   * @returns widget
   */
  constructor(options: TableOfContents.IOptions) {
    super();
    this._docmanager = options.docmanager;
    this._rendermime = options.rendermime;
  }

  /**
   * Current widget-generator tuple for the ToC.
   */
  get current(): TableOfContents.ICurrentWidget | null {
    return this._current;
  }
  set current(value: TableOfContents.ICurrentWidget | null) {
    // If they are the same as previously, do nothing...
    if (
      value &&
      this._current &&
      this._current.widget === value.widget &&
      this._current.generator === value.generator
    ) {
      return;
    }
    this._current = value;

    if (this.generator && this.generator.toolbarGenerator) {
      this._toolbar = this.generator.toolbarGenerator();
    }

    // Dispose an old activity monitor if one existed...
    if (this._monitor) {
      this._monitor.dispose();
      this._monitor = null;
    }
    // If we are wiping the ToC, update and return...
    if (!this._current) {
      this.update();
      return;
    }
    // Find the document model associated with the widget:
    const context = this._docmanager.contextForWidget(this._current.widget);
    if (!context || !context.model) {
      throw Error("Could not find a context for the Table of Contents");
    }
    // Throttle the rendering rate of the table of contents:
    this._monitor = new ActivityMonitor({
      signal: context.model.contentChanged,
      timeout: RENDER_TIMEOUT
    });

    this.onResize = debounce(
      function() {
        this.update();
      },
      300,
      true
    );

    this._monitor.activityStopped.connect(this.update, this);
    this.update();
  }

  /**
   * Current table of contents generator.
   *
   * @returns table of contents generator
   */
  get generator() {
    if (this._current) {
      return this._current.generator;
    }
    return null;
  }

  protected async fetchVideos(code: string): Promise<VideoResponse[]> {
    const response = await fetch(
      `https://api.eskwelabs.com/api/v2/notebook-videos/${code}`
    );
    const result = await response.json();
    return result.videos;
  }

  /**
   * Callback invoked upon an update request.
   *
   * @param msg - message
   */
  protected onUpdateRequest(msg: Message): void {
    let toc: IHeading[] = [];
    let title = "Table of Contents";

    if (this._current) {
      toc = this._current.generator.generate(this._current.widget);
      const context = this._docmanager.contextForWidget(this._current.widget);
      if (context) {
        title = PathExt.basename(context.localPath);
      }
    }

    let itemRenderer: (item: IHeading) => JSX.Element | null = (
      item: IHeading
    ) => {
      return <span>{item.text}</span>;
    };

    if (this._current && this._current.generator.itemRenderer) {
      itemRenderer = this._current.generator.itemRenderer!;
    }

    let jsx = (
      <div className="jp-TableOfContents">
        <header>{title}</header>
      </div>
    );

    if (this._current && this._current.generator) {
      const activeCellId = (this._current.generator!
        .tracker as any).activeCell.model.metadata.get("aratohu-id");

      const activeCellText = (this._current.generator.tracker as any).activeCell
        .model.value.text;

      const notebookId = (this._current
        .widget as any).context.model.metadata.get("aratohu-id");

      if (notebookId && this.aratohuId != notebookId) {
        this.aratohuId = notebookId;

        this.fetchVideos(this.aratohuId!).then(
          result => {
            this.triggerCells = result;
            this.update();
          },
          reason => console.error(reason)
        );
      }

      jsx = (
        <TOCTree
          title={title}
          toc={toc}
          generator={this.generator}
          itemRenderer={itemRenderer}
          toolbar={this._toolbar}
          activeCell={activeCellId}
          activeCellText={activeCellText}
          triggerCells={this.triggerCells}
        />
      );
    }
    ReactDOM.render(jsx, this.node, () => {
      if (
        this._current &&
        this._current.generator.usesLatex === true &&
        this._rendermime.latexTypesetter
      ) {
        this._rendermime.latexTypesetter.typeset(this.node);
      }
    });
  }

  /**
   * Callback invoked to re-render after showing a table of contents.
   *
   * @param msg - message
   */
  protected onAfterShow(msg: Message): void {
    this.update();
  }

  private _toolbar: any;
  private _rendermime: IRenderMimeRegistry;
  private _docmanager: IDocumentManager;
  private _current: TableOfContents.ICurrentWidget | null;
  private _monitor: ActivityMonitor<any, any> | null;
}

/**
 * A namespace for TableOfContents statics.
 */
export namespace TableOfContents {
  /**
   * Interface describing table of contents widget options.
   */
  export interface IOptions {
    /**
     * Application document manager.
     */
    docmanager: IDocumentManager;

    /**
     * Application rendered MIME type.
     */
    rendermime: IRenderMimeRegistry;
  }

  /**
   * Interface describing the current widget.
   */
  export interface ICurrentWidget<W extends Widget = Widget> {
    /**
     * Current widget.
     */
    widget: W;

    /**
     * Table of contents generator for the current widget.
     */
    generator: Registry.IGenerator<W>;
  }
}
