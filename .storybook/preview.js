import * as NextImage from 'next/image';
import '../src/styles/globals.css';

const BREAKPOINTS_INT = {
  xs: 375,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

const customViewports = Object.fromEntries(
  Object.entries(BREAKPOINTS_INT).map(([key, val], idx) => {
    console.log(val);
    return [
      key,
      {
        name: key,
        styles: {
          width: `${val}px`,
          height: `${(idx + 5) * 10}vh`,
        },
      },
    ];
  })
);

// Allow Storybook to handle Next's <Image> component
const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      // Array of plain string values or MenuItem shape (see below)
      items: ['light', 'dark'],
      // Property that specifies if the name of the item will be displayed
      showName: true,
    },
  },
};

import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import GetDesignTokens from '../src/styles/theme';

const withThemeProvider = (Story, context) => {
  const theme = createTheme(GetDesignTokens(context.globals.theme));
  // below the storybook background is set to the theme background
  document.body.style.backgroundColor = theme.palette.background.default;
  // set background on the storybook docs tab (this is done once the markup has been appended, I had to check for the occurance of this before changing the background, there maybe a better way )
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (document.getElementsByClassName('docs-story')[0]) {
          const docs = document.getElementsByClassName('docs-story')[0];
          docs.firstChild.style.backgroundColor =
            theme.palette.background.default;
        }
      }
    }
  };
  let observer;
  if (observer === undefined) {
    observer = new MutationObserver(callback);
    observer.observe(targetNode, config); // end of setting background on docs
  }

  return (
    <EmotionThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    </EmotionThemeProvider>
  );
};

export const decorators = [withThemeProvider];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: { viewports: customViewports },
};
