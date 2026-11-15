// Le lezioni MDX iniziano con un proprio H1, ma il template della lezione stampa già il
// titolo come H1: il primo veniva solo nascosto via CSS, e i crawler vedevano due H1.
// Questo plugin lo toglie dall'HTML, solo per i file in src/content/corso/.
const COURSE_DIR = /[\\/]src[\\/]content[\\/]corso[\\/]/;

export default function rehypeStripCourseH1() {
  return (tree, file) => {
    const filePath = file?.path ?? file?.history?.[0] ?? '';
    if (!COURSE_DIR.test(filePath)) return;
    const index = tree.children.findIndex((node) => node.type === 'element' || (node.type === 'text' && node.value.trim() !== ''));
    if (index === -1) return;
    const first = tree.children[index];
    if (first.type === 'element' && first.tagName === 'h1') tree.children.splice(index, 1);
  };
}
