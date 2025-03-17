export const prefixed = (prefix: string, ...strs: any) => {
  return strs.map((str: any) => {
    if (typeof str === "string") {
      return `${prefix} ${str}`;
    } else {
      return str;
    }
  });
};

export const parseProperty = (props: string, propName: string): string => {
  const match = props.match(new RegExp(`\\[${propName}\\]:\\s*\\[(.+?)\\]`));
  return match ? match[1] : "";
};
