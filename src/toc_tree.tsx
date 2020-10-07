// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from "react";
import { Widget } from "@lumino/widgets";
import { IHeading } from "./utils/headings";
import { TableOfContentsRegistry as Registry } from "./registry";
import { TOCItem } from "./toc_item";

let videoUrl: string | null = null;

const getTitleString = function(contents: string): string {
  return contents
    .split("\n")[0]
    .replace(/\#/g, "")
    .trim();
};

const notebookDetails: any = {
  "01_Introduction_to_Python_and_Jupyter_Notebook.ipynb": {
    "Introduction to Python & Jupyter Notebook":
      "https://www.youtube.com/embed/_WUcjbxi2Q0",
    "2.1 Arithmetic": "https://www.youtube.com/embed/YtiGih7wIzk",
    "2.1.2 Other operations": "https://www.youtube.com/embed/RBAKopg9BWk",
    "2.2. Variables": "https://www.youtube.com/embed/9jsFK0FtMX0",
    "2.3. Boolean type and Boolean operations":
      "https://www.youtube.com/embed/6is5wzfAW4g",
    "2.4. Built-in and User-defined Functions":
      "https://www.youtube.com/embed/6is5wzfAW4g",
    "Test What You've Learned!": "https://www.youtube.com/embed/JTrz9TicM00"
  },
  "02_Python_Strings_Lists.ipynb": {
    "Python Strings and Lists": "https://www.youtube.com/embed/A-1ELIacEIk",
    "1. Strings and String Methods":
      "https://www.youtube.com/embed/dCNjaBZm1jc",
    "1.3 String methods": "https://www.youtube.com/embed/cW4VBXPJWgk",
    "1.4 String formatting using print()":
      "https://www.youtube.com/embed/NJW2-NmhlM8",
    "2. Lists": "https://www.youtube.com/embed/bgCVpetiioY",
    "2.5 List slicing": "https://www.youtube.com/embed/vs--0Gvwlak",
    "3. String and Lists": "https://www.youtube.com/embed/Nv_whWWnb-A",
    "4. Test What You've Learned": "https://www.youtube.com/embed/JTrz9TicM00"
  },
  "03_Python_Control_Structures.ipynb": {
    "Python Control Structures": "https://www.youtube.com/embed/prorMnPk3cw",
    "1. Selection by conditionals": "https://www.youtube.com/embed/WlrzzsA4U14",
    "2. Repetition": "https://www.youtube.com/embed/NgUu0dQ6z5I",
    "2.2 While loop": "https://www.youtube.com/embed/1-RGTst7Gr8",
    "3. Exceptions": "https://www.youtube.com/embed/aSSrxHFvj_Q",
    "4. List Comprehension": "https://www.youtube.com/embed/qLDWIM3j7Ug",
    "Test What You've Learned": "https://www.youtube.com/embed/JTrz9TicM00"
  },
  "04_Intro_to_Linear_Algebra.ipynb": {
    "Linear Algebra": "https://www.youtube.com/embed/MJ-jHvE0v0o",
    "1. Systems of Linear Equations":
      "https://www.youtube.com/embed/MITcpUVoI8s",
    "2. Matrix Arithmetic": "https://www.youtube.com/embed/74gIS4UIL7w",
    "2.3 Matrix-Scalar Multiplication":
      "https://www.youtube.com/embed/03Or9R2noU4",
    "3. Types of Matrices": "https://www.youtube.com/embed/kEIPWkuQlaE",
    "Test What You've Learned": "https://www.youtube.com/embed/JTrz9TicM00"
  }
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
    const activeCell = getTitleString(this.props.activeCell);
    const triggerCells: any = notebookDetails[this.props.title] || {};

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

    // console.log("TOCTree render", this.props);

    if (activeCell in triggerCells) {
      videoUrl = triggerCells[activeCell];
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
