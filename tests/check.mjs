// Quick checks that need no browser: every file loads as a module, the
// manifests are valid, versions agree, and each translation row is complete.
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
let failed = 0;
const ok = message => console.log(`  ✓ ${message}`);
const fail = (message, error) => {
    failed++;
    console.log(`  ✗ ${message}${error ? `\n      ${error}` : ''}`);
};

for (const file of ['icons.js', 'themes.js', 'i18n.js', 'locales.js', 'changelog.js', 'index.js']) {
    try {
        await import(new URL(file, root));
        ok(`${file} loads`);
    } catch (error) {
        fail(`${file} loads`, error);
    }
}

const json = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
try {
    const manifest = await json('manifest.json');
    const { VERSION } = await import(new URL('changelog.js', root));
    if (manifest.version === VERSION) ok(`version ${VERSION} matches the changelog`);
    else fail(`manifest.json version ${manifest.version} differs from changelog ${VERSION}`);
    const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');
    if (changelog.includes(`## ${VERSION}`)) ok('CHANGELOG.md lists this version');
    else fail(`CHANGELOG.md has no "## ${VERSION}" section`);
} catch (error) {
    fail('manifest.json is valid', error);
}

try {
    const app = await json('app.webmanifest');
    for (const icon of app.icons) {
        if (icon.src.startsWith('/')) continue;
        await readFile(new URL(icon.src, root));
    }
    ok('app.webmanifest is valid and its icons exist');
} catch (error) {
    fail('app.webmanifest is valid', error);
}

try {
    const source = await readFile(new URL('locales.js', root), 'utf8');
    const langs = JSON.parse(source.match(/const LANGS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
    const rows = [...source.matchAll(/^\s+(['"])(.+?)\1: \[(.*)\],$/gm)];
    const short = rows.filter(row => row[3].split(/',\s*'|",\s*"|',\s*"|",\s*'/).length !== langs.length);
    if (short.length) fail(`translation rows with the wrong number of languages: ${short.map(row => row[2]).join(', ')}`);
    else ok(`${rows.length} translations in ${langs.length} languages`);
} catch (error) {
    fail('locales.js rows are complete', error);
}

if (failed) {
    console.log(`\n${failed} check(s) failed.`);
    process.exit(1);
}
console.log('\nAll checks passed.');
