import hljs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js';
import graphql from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/graphql.min.js';

hljs.registerLanguage('graphql', graphql);

document.querySelectorAll('div.code').forEach((div) => {
  hljs.highlightElement(div);
  console.log('highlighted', div);
});
