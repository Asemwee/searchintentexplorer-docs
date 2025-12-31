import fs from "fs";
import path from "path";

const LANGS = ["fr", "en", "es", "de", "it"];

const readUtf8 = (p) => fs.readFileSync(p, "utf8");
const writeUtf8 = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
};

const splitByLang = (raw) => {
  const blocks = {};
  const re = /<!--\s*lang:(fr|en|es|de|it)\s*-->\s*([\s\S]*?)(?=(<!--\s*lang:(fr|en|es|de|it)\s*-->)|$)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const lang = m[1];
    const content = m[2].trim() + "\n";
    blocks[lang] = content;
  }
  return blocks;
};

const main = () => {
  const repoRoot = process.cwd();
  const masterPath = path.join(repoRoot, "content/introduction/overview.master.mdx");
  if (!fs.existsSync(masterPath)) {
    console.error(`Missing master file: ${masterPath}`);
    process.exit(1);
  }

  const raw = readUtf8(masterPath);
  const blocks = splitByLang(raw);

  // FR doit exister
  if (!blocks.fr) {
    console.error("Missing <!-- lang:fr --> block in master file");
    process.exit(1);
  }

  for (const lang of LANGS) {
    if (!blocks[lang]) {
      console.warn(`Warning: missing block for ${lang} (will skip generation)`);
      continue;
    }
    const out = path.join(repoRoot, `introduction/${lang}/overview.mdx`);
    writeUtf8(out, blocks[lang]);
    console.log(`Generated: ${out}`);
  }
};

main();
