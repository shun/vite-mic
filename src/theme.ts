import { extendTheme } from "@chakra-ui/react";

// Chakra UI のテーマを拡張
const theme = extendTheme({
  styles: {
    global: {
      h1: {
        fontSize: "1.7em",
      },
      h2: {
        fontSize: "1.5em",
      },
      h3: {
        fontSize: "1.3em",
      },
      h4: {
        fontSize: "1.1em",
      },
      h5: {
        fontSize: "1.0em",
      },
      h6: {
        fontSize: "0.85em",
      },
      "h1, h2, h3, h4, h5, h6": {
        marginTop: "1.5rem",
        marginBottom: "1rem",
        fontWeight: "bold",
      },
      p: {
        marginBottom: "1rem",
      },
      ul: {
        marginBottom: "1rem",
        paddingLeft: "1.5rem",
      },
      ol: {
        marginBottom: "1rem",
        paddingLeft: "1.5rem",
      },
      code: {
        backgroundColor: "gray.100",
        padding: "0.2rem 0.4rem",
        borderRadius: "0.2rem",
      },
      pre: {
        backgroundColor: "gray.100",
        padding: "1rem",
        borderRadius: "0.5rem",
        overflowX: "auto",
      },
    },
  },
});

export default theme;
