import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import satori from "satori";
import type { SatoriOptions } from "satori";
import sharp from "sharp";

export const prerender = false;

export async function GET({ params }: APIContext) {
  const { slug } = params;

  const docs = await getCollection("docs");
  const doc = docs.find((d: CollectionEntry<"docs">) => d.slug === slug);

  const title = doc?.data.title ?? "phoneng Documentation";
  const description =
    doc?.data.description ?? "Nigerian phone number parsing library";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node: any = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        backgroundColor: "#0d0d0f",
        fontFamily: "system-ui",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          backgroundColor: "#0071e3",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                        },
                        children: "P",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          color: "#f5f5f7",
                          fontSize: "24px",
                          fontWeight: "600",
                        },
                        children: "phoneng",
                      },
                    },
                  ],
                },
              },
              {
                type: "h1",
                props: {
                  style: {
                    color: "#f5f5f7",
                    fontSize: title.length > 30 ? "48px" : "56px",
                    fontWeight: "700",
                    lineHeight: "1.1",
                    margin: "0",
                    letterSpacing: "-0.02em",
                  },
                  children: title,
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    color: "#98989d",
                    fontSize: "24px",
                    lineHeight: "1.4",
                    margin: "0",
                    maxWidth: "800px",
                  },
                  children: description,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    color: "#636366",
                    fontSize: "20px",
                  },
                  children: "phoneng.vercel.app",
                },
              },
              {
                type: "span",
                props: {
                  style: {
                    color: "#64d2ff",
                    fontSize: "18px",
                    fontFamily: "monospace",
                  },
                  children: "npm install phoneng",
                },
              },
            ],
          },
        },
      ],
    },
  };
  const options: SatoriOptions = {
    width: 1200,
    height: 630,
    fonts: [],
  };

  const svg = await satori(node, options);

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
