import { getOptions } from "loader-utils";
import { loader } from "webpack";
import { parseFrontmatter, extractHeaders } from "../util";

export default function MarkdownLoader(
  this: loader.LoaderContext,
  source: string
) {
  const { markdown } = getOptions(this);
  const frontmatter = parseFrontmatter(source);

  const headers = extractHeaders(frontmatter.content, markdown.lexer);
  const html = markdown(frontmatter.content);
  // TODO: rewrite
  const res = [
    `import * as React from 'react';`,
    `import Layout from 'components/Layout';`,
    `import Toc from 'components/Toc';`,
    `const Article = () => <div className='markdown-body section' dangerouslySetInnerHTML={{ __html: ${JSON.stringify(
      html
    )} }}></div>;`,
    `export default () => (
      <Layout
        Side={ <Toc headings={${JSON.stringify(headers)}} /> }
        Content={ <Article /> }
      />
     )`
  ].join("\n");

  return res;
}
