const getTitleString = function(contents: string): string {
  return contents
    .split("\n")[0]
    .replace(/\#/g, "")
    .trim();
};

export { getTitleString };
