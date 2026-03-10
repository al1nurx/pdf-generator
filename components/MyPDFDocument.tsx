import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import parse, { DOMNode, Element, Text as TextNode } from "html-react-parser";

Font.register({
  family: "Calibri",
  fonts: [
    { src: "/fonts/calibri.ttf", fontWeight: "normal" },
    { src: "/fonts/calibri_bold.ttf", fontWeight: "bold" },
  ],
});

const RED_BAR_WIDTH = 20;
const PAGE_PADDING_H = 40;
const PAGE_PADDING_TOP = 30;
const PAGE_PADDING_BOTTOM = 40;
const LOGO_HEIGHT = 40;
const LOGO_MARGIN_BOTTOM = 20;
const CONTENT_TOP_OFFSET = PAGE_PADDING_TOP + LOGO_HEIGHT + LOGO_MARGIN_BOTTOM;
const TEXT_INDENT = 20;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingLeft: RED_BAR_WIDTH + PAGE_PADDING_H,
    paddingRight: PAGE_PADDING_H,
    paddingTop: CONTENT_TOP_OFFSET,
    paddingBottom: PAGE_PADDING_BOTTOM,
  },
  redBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: RED_BAR_WIDTH,
    backgroundColor: "#D62E1F",
  },
  logo: {
    position: "absolute",
    top: PAGE_PADDING_TOP,
    left: RED_BAR_WIDTH + PAGE_PADDING_H,
    width: 94,
    height: LOGO_HEIGHT,
  },
  pageNumber: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 9,
    color: "#888888",
  },
  paragraph: {
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    color: "#111111",
    textAlign: "justify",
  },
  paragraphIndented: {
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    color: "#111111",
    textAlign: "justify",
    textIndent: TEXT_INDENT,
  },
  h1: {
    fontFamily: "Calibri",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
    color: "#D62E1F",
    textAlign: "center",
  },
  h2: {
    fontFamily: "Calibri",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 6,
    color: "#D62E1F",
    textAlign: "center",
  },
  h3: {
    fontFamily: "Calibri",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 4,
    color: "#111111",
  },
  bold: { fontFamily: "Calibri", fontWeight: "bold" },
  italic: { fontFamily: "Calibri", fontStyle: "italic" },
  underline: { textDecoration: "underline" },
  strike: { textDecoration: "line-through" },
  listItem: {
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
    color: "#111111",
    flexDirection: "row",
  },
  listBullet: {
    width: 16,
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 10,
  },
  listItemText: {
    flex: 1,
    fontFamily: "Calibri",
    fontWeight: "normal",
    fontSize: 10,
    lineHeight: 1.5,
  },
});

function getInlineStyles(node: Element): Style {
  const style: Record<string, unknown> = {};
  const styleAttr = node.attribs?.style ?? "";
  if (!styleAttr) return style as Style;

  styleAttr.split(";").forEach((rule) => {
    const colonIdx = rule.indexOf(":");
    if (colonIdx === -1) return;
    const prop = rule.slice(0, colonIdx).trim();
    const val = rule.slice(colonIdx + 1).trim();
    if (!val) return;
    if (prop === "color") style.color = val;
    if (prop === "text-align") style.textAlign = val;
  });

  return style as Style;
}

function renderInlineChildren(nodes: DOMNode[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return <React.Fragment key={i}>{(node as TextNode).data}</React.Fragment>;
    }
    if (node instanceof Element) {
      const s = getInlineStyles(node);
      const ch = renderInlineChildren(node.children as DOMNode[]);
      if (node.name === "strong" || node.name === "b")
        return (
          <Text key={i} style={[styles.bold, s]}>
            {ch}
          </Text>
        );
      if (node.name === "em" || node.name === "i")
        return (
          <Text key={i} style={[styles.italic, s]}>
            {ch}
          </Text>
        );
      if (node.name === "u")
        return (
          <Text key={i} style={[styles.underline, s]}>
            {ch}
          </Text>
        );
      if (node.name === "s" || node.name === "del")
        return (
          <Text key={i} style={[styles.strike, s]}>
            {ch}
          </Text>
        );
      if (node.name === "span")
        return (
          <Text key={i} style={s}>
            {ch}
          </Text>
        );
      return <React.Fragment key={i}>{ch}</React.Fragment>;
    }
    return null;
  });
}

function renderNode(node: DOMNode, index: number): React.ReactNode {
  if (!(node instanceof Element)) {
    if (node.type === "text") {
      const data = (node as TextNode).data;
      if (data?.trim())
        return (
          <Text key={index} style={styles.paragraph}>
            {data}
          </Text>
        );
    }
    return null;
  }

  const s = getInlineStyles(node);
  const ch = renderInlineChildren(node.children as DOMNode[]);

  if (node.name === "p") {
    // Check data-indent attribute set by our TipTap extension
    const hasIndent = node.attribs?.["data-indent"] === "true";
    const baseStyle = hasIndent ? styles.paragraphIndented : styles.paragraph;
    return (
      <Text key={index} style={[baseStyle, s]}>
        {ch}
      </Text>
    );
  }
  if (node.name === "h1")
    return (
      <Text key={index} style={[styles.h1, s]}>
        {ch}
      </Text>
    );
  if (node.name === "h2")
    return (
      <Text key={index} style={[styles.h2, s]}>
        {ch}
      </Text>
    );
  if (node.name === "h3")
    return (
      <Text key={index} style={[styles.h3, s]}>
        {ch}
      </Text>
    );

  if (node.name === "ul") {
    return (
      <View key={index}>
        {(node.children as DOMNode[])
          .filter((c) => c instanceof Element && (c as Element).name === "li")
          .map((li, liIdx) => (
            <View key={liIdx} style={styles.listItem}>
              <Text style={styles.listBullet}>{"• "}</Text>
              <Text style={styles.listItemText}>
                {renderInlineChildren((li as Element).children as DOMNode[])}
              </Text>
            </View>
          ))}
      </View>
    );
  }
  if (node.name === "ol") {
    return (
      <View key={index}>
        {(node.children as DOMNode[])
          .filter((c) => c instanceof Element && (c as Element).name === "li")
          .map((li, liIdx) => (
            <View key={liIdx} style={styles.listItem}>
              <Text style={styles.listBullet}>{`${liIdx + 1}. `}</Text>
              <Text style={styles.listItemText}>
                {renderInlineChildren((li as Element).children as DOMNode[])}
              </Text>
            </View>
          ))}
      </View>
    );
  }
  if (node.name === "br") return <Text key={index}>{"\n"}</Text>;

  return null;
}

function parseHTMLToNodes(html: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let index = 0;
  parse(html, {
    replace: (node) => {
      const rendered = renderNode(node, index++);
      if (rendered) result.push(rendered);
      return <></>;
    },
  });
  return result;
}

export default function MyPDFDocument({ content }: { content: string }) {
  const nodes = parseHTMLToNodes(content);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.redBar} fixed />
        <View style={styles.logo} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src="/logo.png" />
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => String(pageNumber)}
          fixed
        />
        {nodes}
      </Page>
    </Document>
  );
}
