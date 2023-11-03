import type { TinaField } from "tinacms";
export function blogpost_exampleFields() {
  return [
    {
      type: "datetime",
      name: "date",
      label: "date",
    },
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "string",
      name: "tags",
      label: "tags",
      list: true,
    },
    {
      type: "string",
      name: "aliases",
      label: "aliases",
      list: true,
    },
  ] as TinaField[];
}
