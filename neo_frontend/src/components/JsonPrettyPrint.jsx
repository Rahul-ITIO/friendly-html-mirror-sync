import React from 'react';

export const JsonPrettyPrint = ({ json }) => {
    if (!json) return "N/A";

    let parsedJson;
    try {
      parsedJson =
        typeof json === "string" ? JSON.parse(json) : json;
    } catch (e) {
      return <pre style={{ color: "red" }}>Invalid JSON</pre>;
    }

    return (
      <pre
        style={{
          background: "#282c34",
          color: "#abb2bf",
          padding: "10px",
          borderRadius: "5px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(parsedJson, null, 2)
            .replace(/"(.*?)":/g, '<span style="color: #e06c75">"$1"</span>:')
            .replace(/: "(.*?)"/g, ': <span style="color: #98c379">"$1"</span>')
            .replace(/: (\d+)/g, ': <span style="color: #d19a66">$1</span>'),
        }}
      />
    );
  };
