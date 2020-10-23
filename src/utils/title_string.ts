const getTitleString = function(contents: string): string {
  const str = contents
    .split("\n")[0]
    .replace(/\#/g, "")
    .replace(/\`/g, "")
    .trim();

  const result = str.length > 45 ? str.slice(0, 45) + "..." : str;

  return result;
};

export { getTitleString };
