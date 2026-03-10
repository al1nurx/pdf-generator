import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textIndent: {
      toggleIndent: () => ReturnType;
    };
  }
}
