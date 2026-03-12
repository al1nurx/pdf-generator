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

export interface DocMeta {
  approvalLabel: string;
  approvalPosition: string;
  approvalOrg: string;
  approvalName: string;
  approvalDate: string;
  docTitle: string;
  docSubtitle1: string;
  docSubtitle2: string;
  cityText: string;
  infoDevLabel: string;
  infoDevValue: string;
  infoApproveLabel: string;
  infoApproveValue: string;
  infoDevelopersLabel: string;
  infoDevelopersValue: string;
  infoCheckLabel: string;
  infoCheckValue: string;
  footerCopy: string;
  footerLegal: string;
}

const RED_BAR_WIDTH = 20;
const PAGE_PADDING_H = 40;
const PAGE_PADDING_TOP = 30;
const PAGE_PADDING_BOTTOM = 60;
const LOGO_HEIGHT = 31;
const LOGO_MARGIN_BOTTOM = 20;
const CONTENT_TOP_OFFSET = PAGE_PADDING_TOP + LOGO_HEIGHT + LOGO_MARGIN_BOTTOM;

const TABLE_WIDTH = 495;
const TABLE_ROW_MIN_HEIGHT = 20;

const BASE_TEXT = {
  fontFamily: "Calibri" as const,
  fontWeight: "normal" as const,
  fontSize: 12,
  lineHeight: 1.4,
  color: "#111111",
};

const RedBar = () => <View style={styles.redBar} fixed />;
const Logo = () => (
  <View style={styles.logo} fixed>
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    <Image src="/logo.png" />
  </View>
);

const FooterPage1 = ({ meta }: { meta: DocMeta }) => (
  <Text style={styles.footerCopyOnly}>{meta.footerCopy}</Text>
);

const FooterPages = ({ meta }: { meta: DocMeta }) => (
  <>
    <Text style={styles.footerLegal} fixed>
      {meta.footerLegal}
    </Text>
    <Text style={styles.footerCopyBelow} fixed>
      {meta.footerCopy}
    </Text>
  </>
);

function getInlineStyles(node: Element): Style {
  const style: Record<string, unknown> = {};
  const attr = node.attribs?.style ?? "";
  attr.split(";").forEach((rule) => {
    const i = rule.indexOf(":");
    if (i === -1) return;
    const prop = rule.slice(0, i).trim();
    const val = rule.slice(i + 1).trim();
    if (!val) return;
    if (prop === "color") style.color = val;
    if (prop === "text-align") style.textAlign = val;
  });
  return style as Style;
}

function renderInlineChildren(nodes: DOMNode[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === "text")
      return <React.Fragment key={i}>{(node as TextNode).data}</React.Fragment>;
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

function parsePx(val?: string): number | undefined {
  if (!val) return undefined;
  const n = Number.parseFloat(val);
  return Number.isFinite(n) ? n : undefined;
}

function renderTable(tableNode: Element, index: number): React.ReactNode {
  const allRows: Element[] = [];
  function collectRows(n: Element) {
    for (const child of n.children as DOMNode[]) {
      if (!(child instanceof Element)) continue;
      if (child.name === "tr") allRows.push(child);
      else if (["tbody", "thead", "tfoot"].includes(child.name))
        collectRows(child);
    }
  }
  collectRows(tableNode);

  const rowsCells = allRows.map((row) =>
    (
      (row.children as DOMNode[]).filter(
        (c) =>
          c instanceof Element && ["td", "th"].includes((c as Element).name),
      ) as Element[]
    ).map((cell) => {
      const colspanRaw = cell.attribs?.colspan ?? "1";
      const rowspanRaw = cell.attribs?.rowspan ?? "1";
      const colspan = Math.max(1, Number.parseInt(colspanRaw, 10) || 1);
      const rowspan = Math.max(1, Number.parseInt(rowspanRaw, 10) || 1);
      const vertical =
        cell.attribs?.["data-vertical"] === "true" ||
        cell.attribs?.class?.includes("vertical");
      const colWidthHint = parsePx(cell.attribs?.["data-colwidth"]);
      return { cell, colspan, rowspan, vertical, colWidthHint };
    }),
  );

  const colCount = Math.max(
    1,
    ...rowsCells.map((cells) =>
      cells.reduce((sum, c) => sum + (c.colspan || 1), 0),
    ),
  );
  const defaultColWidth = TABLE_WIDTH / colCount;

  const columnWidths: Array<number | undefined> = new Array(colCount).fill(
    undefined,
  );
  const applyWidthHintsFromRow = (row: (typeof rowsCells)[number]) => {
    let cursor = 0;
    row.forEach((c) => {
      const span = Math.max(1, c.colspan);
      if (c.colWidthHint !== undefined && span === 1 && cursor < colCount) {
        columnWidths[cursor] = c.colWidthHint;
      }
      cursor += span;
    });
  };
  if (rowsCells[0]) applyWidthHintsFromRow(rowsCells[0]);
  if (rowsCells[1]) applyWidthHintsFromRow(rowsCells[1]);

  const specified = columnWidths.filter(
    (w) => typeof w === "number",
  ) as number[];
  const specifiedTotal = specified.reduce((a, b) => a + b, 0);
  const unspecifiedCount = columnWidths.filter((w) => w === undefined).length;
  const remaining = Math.max(0, TABLE_WIDTH - specifiedTotal);
  const fallback =
    unspecifiedCount > 0 ? remaining / unspecifiedCount : defaultColWidth;
  const colWidthAt = (i: number): number => columnWidths[i] ?? fallback;

  const rowSpanLeft = new Array<number>(colCount).fill(0);

  return (
    <View key={index} style={styles.table}>
      {rowsCells.map((cells, ri) => {
        for (let ci = 0; ci < rowSpanLeft.length; ci++) {
          rowSpanLeft[ci] = Math.max(0, rowSpanLeft[ci] - 1);
        }

        const rowItems: React.ReactNode[] = [];
        let colCursor = 0;

        const isHeaderRow = cells.some((c) => c.cell.name === "th");

        cells.forEach((item, cellIdx) => {
          while (colCursor < colCount && rowSpanLeft[colCursor] > 0)
            colCursor++;
          const startCol = colCursor;
          const spanCols = Math.min(item.colspan, colCount - startCol);
          const spanRows = item.rowspan;

          for (let c = startCol; c < startCol + spanCols; c++) {
            rowSpanLeft[c] = Math.max(rowSpanLeft[c], spanRows);
          }

          const boxStyle = isHeaderRow
            ? styles.tableCellBoxHeader
            : styles.tableCellBox;
          const textStyle = isHeaderRow
            ? styles.tableCellTextHeader
            : styles.tableCellText;

          const children = renderInlineChildren(
            item.cell.children as DOMNode[],
          );
          const hasContent = (item.cell.children as DOMNode[]).some(
            (c) =>
              (c.type === "text" && (c as TextNode).data.trim()) ||
              c instanceof Element,
          );

          let cellWidth = 0;
          for (let k = 0; k < spanCols; k++)
            cellWidth += colWidthAt(startCol + k);
          const cellMinHeight = TABLE_ROW_MIN_HEIGHT * spanRows;
          const effectiveHeight = item.vertical
            ? Math.max(cellMinHeight, 110)
            : cellMinHeight;

          if (item.vertical) {
            rowItems.push(
              <View
                key={`${ri}-${cellIdx}`}
                style={[
                  boxStyle,
                  {
                    width: cellWidth,
                    minHeight: effectiveHeight,
                    overflow: "hidden",
                  },
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      transform: "rotate(-90deg)",
                      width: effectiveHeight - 10,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        textStyle,
                        { textAlign: "center", flexWrap: "wrap" },
                      ]}
                    >
                      {hasContent ? children : " "}
                    </Text>
                  </View>
                </View>
              </View>,
            );
          } else {
            rowItems.push(
              <View
                key={`${ri}-${cellIdx}`}
                style={[
                  boxStyle,
                  { width: cellWidth, minHeight: cellMinHeight },
                ]}
              >
                <Text style={textStyle}>{hasContent ? children : " "}</Text>
              </View>,
            );
          }

          colCursor = startCol + spanCols;
        });

        while (colCursor < colCount) {
          if (rowSpanLeft[colCursor] > 0) {
            colCursor++;
            continue;
          }
          rowItems.push(
            <View
              key={`${ri}-empty-${colCursor}`}
              style={[
                isHeaderRow ? styles.tableCellBoxHeader : styles.tableCellBox,
                {
                  width: colWidthAt(colCursor),
                  minHeight: TABLE_ROW_MIN_HEIGHT,
                },
              ]}
            >
              <Text
                style={
                  isHeaderRow
                    ? styles.tableCellTextHeader
                    : styles.tableCellText
                }
              >
                {" "}
              </Text>
            </View>,
          );
          colCursor++;
        }

        return (
          <View key={ri} style={styles.tableRow}>
            {rowItems}
          </View>
        );
      })}
    </View>
  );
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

  if (
    node instanceof Element &&
    node.name === "div" &&
    node.attribs?.class?.includes("page-break")
  ) {
    return <PageBreakMarker key={index} />;
  }

  const s = getInlineStyles(node);
  const ch = renderInlineChildren(node.children as DOMNode[]);
  const isIndented = node.attribs?.["data-indent"] === "true";
  const indentStyle = isIndented ? styles.indentedParagraph : {};

  if (node.name === "p")
    return (
      <Text key={index} style={[styles.paragraph, s, indentStyle]}>
        {ch}
      </Text>
    );
  if (node.name === "h1")
    return (
      <Text key={index} style={[styles.h1, s, indentStyle]}>
        {ch}
      </Text>
    );
  if (node.name === "h2")
    return (
      <Text key={index} style={[styles.h2, s, indentStyle]}>
        {ch}
      </Text>
    );

  if (node.name === "ul" && node.attribs?.["data-type"] !== "dash-list") {
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

  if (node.name === "ul" && node.attribs?.["data-type"] === "dash-list") {
    return (
      <View key={index}>
        {(node.children as DOMNode[])
          .filter(
            (c) =>
              c instanceof Element &&
              (c as Element).name === "li" &&
              (c as Element).attribs?.["data-type"] === "dash",
          )
          .map((li, liIdx) => (
            <View key={liIdx} style={styles.dashItem}>
              <Text style={styles.dashBullet}>{"— "}</Text>
              <Text style={styles.dashItemText}>
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

  if (node.name === "table") return renderTable(node, index);
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

function TitlePage({ meta }: { meta: DocMeta }) {
  return (
    <Page size="A4" style={styles.titlePage}>
      <RedBar />
      <Logo />
      <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
        <Text style={styles.approvalBold}>{meta.approvalLabel}</Text>
        <Text style={styles.approvalNormal}>{meta.approvalPosition}</Text>
        <Text style={styles.approvalNormal}>{meta.approvalOrg}</Text>
        <View
          style={{
            width: 160,
            borderBottomWidth: 1,
            borderBottomColor: "#111",
            marginVertical: 6,
          }}
        />
        <Text style={styles.approvalBold}>{meta.approvalName}</Text>
        <Text style={styles.approvalNormal}>{meta.approvalDate}</Text>
      </View>
      <Text style={styles.docTitle}>{meta.docTitle}</Text>
      <Text style={styles.docSubtitle}>{meta.docSubtitle1}</Text>
      {meta.docSubtitle2 ? (
        <Text style={styles.docSubtitle}>{meta.docSubtitle2}</Text>
      ) : null}
      <View style={{ marginTop: 80, alignItems: "flex-end" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Calibri",
              fontSize: 12,
              fontWeight: "bold",
              color: "#111",
            }}
          >
            Экз. №
          </Text>
          <View
            style={{
              width: 100,
              borderBottomWidth: 1,
              borderBottomColor: "#111",
              marginLeft: 4,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Calibri",
              fontSize: 12,
              fontWeight: "bold",
              color: "#111",
            }}
          >
            Копия №
          </Text>
          <View
            style={{
              width: 80,
              borderBottomWidth: 1,
              borderBottomColor: "#111",
              marginLeft: 4,
            }}
          />
        </View>
      </View>
      <Text style={styles.cityText}>{meta.cityText}</Text>
      <FooterPage1 meta={meta} />
    </Page>
  );
}

function InfoPage({ meta }: { meta: DocMeta }) {
  const rows = [
    { label: meta.infoDevLabel, value: meta.infoDevValue },
    { label: meta.infoApproveLabel, value: meta.infoApproveValue },
    { label: meta.infoDevelopersLabel, value: meta.infoDevelopersValue },
    { label: meta.infoCheckLabel, value: meta.infoCheckValue },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <RedBar />
      <Logo />
      {rows.map((row, i) => (
        <Text key={i} style={styles.paragraph}>
          <Text style={styles.bold}>{row.label}</Text>
          {row.value ? `  ${row.value}` : ""}
        </Text>
      ))}
      <FooterPages meta={meta} />
    </Page>
  );
}

const PageBreakMarker = () => <View break />;

export default function MyPDFDocument({
  content,
  meta,
}: {
  content: string;
  meta: DocMeta;
}) {
  const nodes = parseHTMLToNodes(content);

  const pages: React.ReactNode[][] = [[]];
  nodes.forEach((node) => {
    if (React.isValidElement(node) && node.type === PageBreakMarker) {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(node);
    }
  });

  return (
    <Document>
      <TitlePage meta={meta} />
      <InfoPage meta={meta} />
      {pages.map((pageNodes, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          <RedBar />
          <Logo />
          {pageNodes}
          <FooterPages meta={meta} />
        </Page>
      ))}
    </Document>
  );
}

const styles = StyleSheet.create({
  titlePage: {
    backgroundColor: "#ffffff",
    paddingLeft: RED_BAR_WIDTH + PAGE_PADDING_H,
    paddingRight: PAGE_PADDING_H,
    paddingTop: CONTENT_TOP_OFFSET,
    paddingBottom: PAGE_PADDING_BOTTOM,
  },
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
  footerCopyOnly: {
    position: "absolute",
    bottom: 16,
    left: RED_BAR_WIDTH + PAGE_PADDING_H,
    right: PAGE_PADDING_H,
    textAlign: "right",
    fontFamily: "Calibri",
    fontSize: 9,
    color: "#888888",
  },
  footerLegal: {
    position: "absolute",
    bottom: 30,
    left: RED_BAR_WIDTH + PAGE_PADDING_H,
    right: PAGE_PADDING_H,
    fontFamily: "Calibri",
    fontSize: 9,
    color: "#888888",
    lineHeight: 1.4,
  },
  footerCopyBelow: {
    position: "absolute",
    bottom: 14,
    left: RED_BAR_WIDTH + PAGE_PADDING_H,
    right: PAGE_PADDING_H,
    textAlign: "right",
    fontFamily: "Calibri",
    fontSize: 9,
    color: "#888888",
  },
  approvalBold: {
    ...BASE_TEXT,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 2,
  },
  approvalNormal: { ...BASE_TEXT, textAlign: "right", marginBottom: 2 },
  docTitle: {
    ...BASE_TEXT,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingBottom: 4,
  },
  docSubtitle: {
    ...BASE_TEXT,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  cityText: {
    ...BASE_TEXT,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    bottom: PAGE_PADDING_BOTTOM,
    left: RED_BAR_WIDTH + PAGE_PADDING_H,
    right: PAGE_PADDING_H,
  },
  paragraph: { ...BASE_TEXT, marginBottom: 2, textAlign: "justify" },
  indentedParagraph: { textIndent: 20 },
  h1: {
    ...BASE_TEXT,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 6,
    textAlign: "center",
  },
  h2: {
    ...BASE_TEXT,
    marginBottom: 2,
    marginTop: 6,
    textAlign: "left",
  },
  bold: { fontFamily: "Calibri", fontWeight: "bold" },
  italic: { fontFamily: "Calibri", fontStyle: "italic" },
  underline: { textDecoration: "underline" },
  strike: { textDecoration: "line-through" },
  listItem: { ...BASE_TEXT, marginBottom: 2, flexDirection: "row" },
  listBullet: { width: 12, ...BASE_TEXT },
  listItemText: { flex: 1, ...BASE_TEXT, textAlign: "justify" },
  dashItem: { ...BASE_TEXT, marginBottom: 2, flexDirection: "row" },
  dashBullet: { width: 16, ...BASE_TEXT },
  dashItemText: { flex: 1, ...BASE_TEXT, textAlign: "justify" },
  table: {
    width: TABLE_WIDTH,
    marginBottom: 8,
    marginTop: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#111111",
  },
  tableRow: { flexDirection: "row", minHeight: TABLE_ROW_MIN_HEIGHT },
  tableCellBox: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
  },
  tableCellBoxHeader: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
  },
  tableCellText: { ...BASE_TEXT, fontSize: 11, textAlign: "left" },
  tableCellTextHeader: {
    ...BASE_TEXT,
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 1.15,
  },
  tableCellVerticalWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCellVerticalText: { ...BASE_TEXT, fontSize: 10, textAlign: "center" },
});
