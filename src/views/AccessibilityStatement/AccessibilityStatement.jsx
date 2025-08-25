import React from 'react';
import raw from 'raw.macro';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const markdown = raw('./accessibility-statement.md');

const EXTERNAL_LINKS = [
  'https://palautteet.hel.fi',
  'https://www.saavutettavuusvaatimukset.fi',
  'https://www.finlex.fi',
];

const markdownComponents = {
  a: ({ href, children }) => {
    // Handle external links
    if (href && (href.startsWith('http') || href.startsWith('mailto:'))) {
      return (
        <a
          href={href}
          target={!EXTERNAL_LINKS.some((link) => href.startsWith(link)) ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        >
          {children}
        </a>
      );
    }
    // Handle internal links
    return <a href={href}>{children}</a>;
  },
};

const AccessibilityStatement = () => {
  return (
    <div className='container-fluid'>
      <ReactMarkdown remarkPlugins={[gfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default AccessibilityStatement;
