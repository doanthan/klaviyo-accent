/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-sync-scripts */
import "../styles/globals.css";
import Head from "next/head";
import "../styles/_user.scss";
import "antd/dist/antd.css";
import '../react-data-table-component-extensions/dist/index.css';

function MyApp({ Component, pageProps }) {


  return (
    <>
      <Head>
        {" "}
        <title>Accent Klaviyo Portal</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
