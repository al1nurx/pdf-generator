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
    { src: "/fonts/calibri.ttf", fontWeight: "normal", fontStyle: "normal" },
    { src: "/fonts/calibri_bold.ttf", fontWeight: "bold", fontStyle: "normal" },
    {
      src: "/fonts/calibri_italic.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
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
const CELL_PADDING = 8;
const FONT_SIZE = 12;
const LINE_HEIGHT_PX = FONT_SIZE * 1.4;

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

function renderInlineNodes(nodes: DOMNode[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      const data = (node as TextNode).data;
      if (data) return <React.Fragment key={i}>{data}</React.Fragment>;
      return null;
    }
    if (node instanceof Element) {
      const s = getInlineStyles(node);
      const ch = renderInlineNodes(node.children as DOMNode[]);
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

function extractText(nodes: DOMNode[]): string {
  let text = "";
  for (const n of nodes) {
    if (n.type === "text") {
      text += (n as TextNode).data ?? "";
    } else if (n instanceof Element) {
      text += extractText(n.children as DOMNode[]);
    }
  }
  return text;
}

function estimateTextHeight(
  text: string,
  availableWidth: number,
  isVertical: boolean,
): number {
  if (!text.trim()) return TABLE_ROW_MIN_HEIGHT;
  if (isVertical) return 110;
  const charsPerLine = Math.max(
    1,
    Math.floor(availableWidth / (FONT_SIZE * 0.55)),
  );
  const words = text.trim().split(/\s+/);
  let lines = 1;
  let lineLen = 0;
  for (const word of words) {
    if (lineLen > 0 && lineLen + word.length > charsPerLine) {
      lines++;
      lineLen = word.length;
    } else {
      lineLen += (lineLen > 0 ? 1 : 0) + word.length;
    }
  }
  return Math.max(TABLE_ROW_MIN_HEIGHT, lines * LINE_HEIGHT_PX + CELL_PADDING);
}

function renderCellContent(
  cell: Element,
  baseTextStyle: Style,
  availWidth: number,
  isHeader: boolean,
): React.ReactNode {
  const children = cell.children as DOMNode[];
  if (!children || children.length === 0) return <Text> </Text>;

  return children.map((child, idx) => {
    if (child.type === "text") {
      return (
        <Text key={idx} style={[baseTextStyle, { width: availWidth }]}>
          {(child as TextNode).data}
        </Text>
      );
    }

    if (child instanceof Element) {
      const inlineContent = renderInlineNodes(child.children as DOMNode[]);
      const s = getInlineStyles(child);

      const cellParagraphStyle: Style =
        child.name === "p" ? { marginBottom: 0 } : {};

      return (
        <Text
          key={idx}
          style={[baseTextStyle, s, cellParagraphStyle, { width: availWidth }]}
        >
          {inlineContent}
        </Text>
      );
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

  const numRows = allRows.length;
  if (numRows === 0) return null;

  const rowsCells = allRows.map((row) =>
    (
      (row.children as DOMNode[]).filter(
        (c) =>
          c instanceof Element && ["td", "th"].includes((c as Element).name),
      ) as Element[]
    ).map((cell) => ({
      cell,
      colspan: Math.max(
        1,
        Number.parseInt(cell.attribs?.colspan ?? "1", 10) || 1,
      ),
      rowspan: Math.max(
        1,
        Number.parseInt(cell.attribs?.rowspan ?? "1", 10) || 1,
      ),
      vertical: cell.attribs?.["data-vertical"] === "true",
      colWidthHint: parsePx(cell.attribs?.["data-colwidth"]),
      isHeader: cell.name === "th",
    })),
  );

  type GridSlot = { ri: number; ci: number } | "spanned";
  const grid: (GridSlot | undefined)[][] = Array.from(
    { length: numRows },
    () => [],
  );

  for (let ri = 0; ri < numRows; ri++) {
    let gc = 0;
    for (let ci = 0; ci < rowsCells[ri].length; ci++) {
      while (grid[ri][gc] !== undefined) gc++;
      const item = rowsCells[ri][ci];
      for (let dr = 0; dr < item.rowspan; dr++) {
        for (let dc = 0; dc < item.colspan; dc++) {
          const tr = ri + dr;
          const tc = gc + dc;
          if (tr < numRows) {
            while (grid[tr].length <= tc) grid[tr].push(undefined);
            grid[tr][tc] = dr === 0 && dc === 0 ? { ri, ci } : "spanned";
          }
        }
      }
      gc += item.colspan;
    }
  }

  const colCount = Math.max(1, ...grid.map((r) => r.length));

  const columnWidths: (number | undefined)[] = new Array(colCount).fill(
    undefined,
  );
  for (let ri = 0; ri <= 1 && ri < numRows; ri++) {
    let gc = 0;
    for (const c of rowsCells[ri]) {
      while (gc < colCount && grid[ri][gc] === "spanned") gc++;
      if (c.colWidthHint !== undefined && c.colspan === 1)
        columnWidths[gc] = c.colWidthHint;
      gc += c.colspan;
    }
  }
  const specTotal = (
    columnWidths.filter((w) => w !== undefined) as number[]
  ).reduce((a, b) => a + b, 0);
  const unspecCount = columnWidths.filter((w) => w === undefined).length;
  const fallback =
    unspecCount > 0
      ? Math.max(0, TABLE_WIDTH - specTotal) / unspecCount
      : TABLE_WIDTH / colCount;
  const colW = (i: number) => columnWidths[i] ?? fallback;
  const colLeft = (i: number) => {
    let x = 0;
    for (let k = 0; k < i; k++) x += colW(k);
    return x;
  };

  const rowHeights: number[] = new Array(numRows).fill(TABLE_ROW_MIN_HEIGHT);

  for (let ri = 0; ri < numRows; ri++) {
    let gc = 0;
    for (let ci = 0; ci < rowsCells[ri].length; ci++) {
      while (gc < colCount && grid[ri][gc] === "spanned") gc++;
      const item = rowsCells[ri][ci];
      if (item.rowspan === 1) {
        let cellWidth = 0;
        for (let k = 0; k < item.colspan; k++) cellWidth += colW(gc + k);
        const text = extractText(item.cell.children as DOMNode[]);
        const needed = estimateTextHeight(
          text,
          cellWidth - CELL_PADDING,
          item.vertical,
        );
        rowHeights[ri] = Math.max(rowHeights[ri], needed);
      }
      gc += item.colspan;
    }
  }

  for (let ri = 0; ri < numRows; ri++) {
    let gc = 0;
    for (let ci = 0; ci < rowsCells[ri].length; ci++) {
      while (gc < colCount && grid[ri][gc] === "spanned") gc++;
      const item = rowsCells[ri][ci];
      if (item.rowspan > 1) {
        let cellWidth = 0;
        for (let k = 0; k < item.colspan; k++) cellWidth += colW(gc + k);
        const text = extractText(item.cell.children as DOMNode[]);
        const needed = estimateTextHeight(
          text,
          cellWidth - CELL_PADDING,
          item.vertical,
        );
        let current = 0;
        for (let dr = 0; dr < item.rowspan && ri + dr < numRows; dr++)
          current += rowHeights[ri + dr];
        if (current < needed) {
          const extra = (needed - current) / item.rowspan;
          for (let dr = 0; dr < item.rowspan && ri + dr < numRows; dr++)
            rowHeights[ri + dr] += extra;
        }
      }
      gc += item.colspan;
    }
  }

  const rowTop = (ri: number) => {
    let y = 0;
    for (let k = 0; k < ri; k++) y += rowHeights[k];
    return y;
  };
  const totalHeight = rowHeights.reduce((a, b) => a + b, 0);

  const cellViews: React.ReactNode[] = [];

  for (let ri = 0; ri < numRows; ri++) {
    for (let gc = 0; gc < colCount; gc++) {
      const slot = grid[ri][gc];
      if (!slot || slot === "spanned") continue;

      const item = rowsCells[slot.ri][slot.ci];
      const x = colLeft(gc);
      const y = rowTop(ri);

      let w = 0;
      for (let k = 0; k < item.colspan; k++) w += colW(gc + k);
      let h = 0;
      for (let dr = 0; dr < item.rowspan && ri + dr < numRows; dr++)
        h += rowHeights[ri + dr];

      const isHeader = item.isHeader;
      const baseTextStyle: Style = isHeader
        ? styles.tableCellTextHeader
        : styles.tableCellText;

      const availWidth = w - CELL_PADDING;

      const baseCell: Style = {
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRightWidth: 1,
        borderRightColor: "#111111",
        borderBottomWidth: 1,
        borderBottomColor: "#111111",
        padding: 4,
        overflow: "hidden",
      };

      if (item.vertical) {
        const textWidth = h - CELL_PADDING;
        cellViews.push(
          <View
            key={`${ri}-${gc}`}
            style={[
              baseCell,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <View
              style={{
                transform: "rotate(-90deg)",
                width: textWidth,
                alignItems: "center",
              }}
            >
              {renderCellContent(item.cell, baseTextStyle, textWidth, isHeader)}
            </View>
          </View>,
        );
      } else {
        cellViews.push(
          <View
            key={`${ri}-${gc}`}
            style={[
              baseCell,
              {
                justifyContent: isHeader ? "center" : "flex-start",
                alignItems: isHeader ? "center" : "flex-start",
              },
            ]}
          >
            {renderCellContent(item.cell, baseTextStyle, availWidth, isHeader)}
          </View>,
        );
      }
    }
  }

  return (
    <View
      key={index}
      style={{
        width: TABLE_WIDTH,
        height: totalHeight,
        marginBottom: 8,
        marginTop: 4,
        position: "relative",
        borderLeftWidth: 1,
        borderLeftColor: "#111111",
        borderTopWidth: 1,
        borderTopColor: "#111111",
      }}
    >
      {cellViews}
    </View>
  );
}

function renderInlineChildren(nodes: DOMNode[]): React.ReactNode[] {
  return renderInlineNodes(nodes);
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

  if (node.name === "div" && node.attribs?.class?.includes("page-break")) {
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
    lineHeight: 1.2,
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
    marginTop: 120,
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
    marginBottom: 2,
    marginTop: 2,
    textAlign: "center",
  },
  h2: {
    ...BASE_TEXT,
    marginBottom: 2,
    marginTop: 2,
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
  tableCellText: { ...BASE_TEXT, fontSize: 10, textAlign: "left" },
  tableCellTextHeader: {
    ...BASE_TEXT,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 1.15,
  },
});
