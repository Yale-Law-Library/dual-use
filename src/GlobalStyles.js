import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Bennett Text';
    src: url('./BennettTextFour.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  body {
    font-family: 'Bennett Text', Georgia, serif;
    margin: 0;
    padding: 0;
    background: white;
    color: #333;
  }

  .y-axis path.domain,
  .x-axis path.domain {
    stroke: transparent;
  }
`;
