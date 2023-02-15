import { CacheProvider, EmotionCache } from '@emotion/react';
import { createTheme, PaletteMode, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import ColorModeContext from '@src/contexts/colorModeContext';
import { parseCookies } from '@src/helpers';
import createEmotionCache from '@src/lib/createEmotionCache';
import GetDesignTokens from '@src/styles/theme';
import { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useRef } from 'react';
import { Cookies, CookiesProvider, useCookies } from 'react-cookie';
import { NextPageWithLayout } from './page';

const clientSideEmotionCache = createEmotionCache();
interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
  themeSetting: PaletteMode;
}

const App = (props: AppPropsWithLayout) => {
  const [mode, setMode] = React.useState<PaletteMode>(
    props.themeSetting || 'light'
  );
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === 'light' ? 'dark' : 'light'
        );
      },
    }),
    []
  );
  const [cookies, setCookie] = useCookies(['cookieColorMode']);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isBrowser = typeof window !== 'undefined';

  const addDays = (date: Date, days: number) => {
    const copy = new Date(Number(date));
    copy.setDate(date.getDate() + days);
    return copy;
  };

  useEffect(() => {
    if (prefersDarkMode && !!cookies.cookieColorMode !== true) {
      setMode('dark');
    }
  }, [prefersDarkMode, cookies.cookieColorMode]);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    const date = new Date();
    const expires = addDays(date, 365);
    setCookie('cookieColorMode', mode, { path: '/', expires, secure: true });
  }, [mode, setCookie]);

  useEffect(() => {
    const colorSetting = cookies.cookieColorMode;
    if (colorSetting) setMode(colorSetting as PaletteMode);
  }, [cookies.cookieColorMode]);

  const theme = React.useMemo(() => createTheme(GetDesignTokens(mode)), [mode]);

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout || ((page) => page);
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Home</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta charSet="utf-8" />
        {/* <link rel="icon" type="image/png" href="/logo.jpeg" />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />
        <meta name="author" content="Author" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Description" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="URL of a representative image for the website"
        />
        <meta property="og:description" content="Description" /> */}
      </Head>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CookiesProvider
            cookies={isBrowser ? undefined : new Cookies(cookies)}
          >
            {getLayout(<Component {...pageProps} />)}
          </CookiesProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </CacheProvider>
  );
};

export default App;

App.getInitialProps = async ({ ctx }: AppContext) => {
  let themeSetting;
  if (ctx.req && ctx.req.headers.cookie) {
    themeSetting = parseCookies(ctx).cookieColorMode;
  }
  return {
    themeSetting,
  };
};
