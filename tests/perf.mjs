// Measures how much work Pocket Tavern adds on a slow phone. Runs each scenario
// with Pocket Tavern on and off (plain SillyTavern) and prints the difference.
// Needs a running SillyTavern with Pocket Tavern and the Seraphina demo chat.
// Nothing is saved: the long chat it builds lives only in the page.
//   ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node perf.mjs
// CPU_SLOWDOWN (default 4) slows the CPU down like a mid-range phone.
import { chromium, devices } from 'playwright';

const ST_URL = process.env.ST_URL ?? 'http://127.0.0.1:8000';
const SLOWDOWN = Number(process.env.CPU_SLOWDOWN ?? 4);
const ROUNDS = Number(process.env.ROUNDS ?? 2);

const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');

const until = (fn, arg, timeout = 30000) => page.waitForFunction(fn, arg, { timeout });
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));

/** Runs `run` and returns the main-thread time spent, in ms, plus frame stats. */
async function measure(run) {
    await page.waitForTimeout(400);
    await page.evaluate(() => {
        window.__frames = [];
        window.__long = 0;
        window.__longObserver?.disconnect();
        window.__longObserver = new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__long += entry.duration - 50; });
        window.__longObserver.observe({ type: 'longtask' });
        const tick = time => { window.__frames.push(time); if (window.__frames.length < 100000) window.__rafId = requestAnimationFrame(tick); };
        window.__rafId = requestAnimationFrame(tick);
    });
    const before = await metrics();
    const start = Date.now();
    await run();
    await page.waitForTimeout(300);
    const after = await metrics();
    const frames = await page.evaluate(() => {
        cancelAnimationFrame(window.__rafId);
        const gaps = window.__frames.slice(1).map((time, index) => time - window.__frames[index]);
        gaps.sort((a, b) => a - b);
        return { slow: gaps.filter(gap => gap > 34).length, worst: gaps.at(-1) ?? 0, long: window.__long };
    });
    const ms = name => (after[name] - before[name]) * 1000;
    return {
        task: ms('TaskDuration'),
        script: ms('ScriptDuration'),
        style: ms('RecalcStyleDuration'),
        layout: ms('LayoutDuration'),
        blocked: frames.long,
        slowFrames: frames.slow,
        worstFrame: frames.worst,
        wall: Date.now() - start,
    };
}

const scenarios = {
    async 'stream a reply (200 updates)'() {
        await page.evaluate(async () => {
            const context = SillyTavern.getContext();
            const { eventSource, event_types } = context;
            const words = 'She smiles and pours another cup of tea, the steam curling up into the cool evening air while the fire crackles softly. '.repeat(12).split(' ');
            context.chat.push({ name: context.name2, is_user: false, is_system: false, send_date: Date.now(), mes: '', extra: {} });
            const id = context.chat.length - 1;
            context.addOneMessage(context.chat[id]);
            await eventSource.emit(event_types.GENERATION_STARTED, 'normal', {}, false);
            const text = document.querySelector(`#chat .mes[mesid="${id}"] .mes_text`);
            let shown = '';
            for (let i = 0; i < 200; i++) {
                shown += ` ${words[i % words.length]}`;
                if (i % 40 === 39) shown += '\n\n*She looks up.* "Are you comfortable?"';
                context.chat[id].mes = shown;
                text.innerHTML = context.messageFormatting(shown, context.name2, false, false, id);
                await eventSource.emit(event_types.STREAM_TOKEN_RECEIVED, shown);
                await new Promise(resolve => setTimeout(resolve, 25));
            }
            await eventSource.emit(event_types.MESSAGE_RECEIVED, id);
            await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, id);
            await eventSource.emit(event_types.GENERATION_ENDED, id);
        });
    },
    async 'scroll the long chat'() {
        await page.evaluate(async () => {
            const chat = document.getElementById('chat');
            chat.scrollTop = chat.scrollHeight;
            for (let i = 0; i < 150; i++) {
                chat.scrollTop -= 60;
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            for (let i = 0; i < 150; i++) {
                chat.scrollTop += 60;
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
        });
    },
    async 'type a message (80 keys)'() {
        await page.locator('#send_textarea').click();
        await page.keyboard.type('I lean back against the old oak and listen to the rain on the leaves above us.', { delay: 15 });
        await page.evaluate(() => {
            const box = document.getElementById('send_textarea');
            box.value = '';
            box.dispatchEvent(new Event('input', { bubbles: true }));
            box.blur();
        });
    },
    async 'open pages (Characters, Lorebooks, Presets, back)'() {
        for (const id of ['#rightNavHolder', '#WI-SP-button', '#ai-config-button']) {
            await page.evaluate(selector => document.querySelector(`${selector} > .drawer-toggle`)?.click(), id);
            await page.waitForTimeout(700);
            await page.evaluate(selector => document.querySelector(`${selector} > .drawer-toggle`)?.click(), id);
            await page.waitForTimeout(500);
        }
    },
    async 'sit idle in the chat (10 s)'() {
        await page.waitForTimeout(10000);
    },
    async 'open and close More and Themes'() {
        for (let i = 0; i < 2; i++) {
            await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]')?.click());
            await page.waitForTimeout(700);
            await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-menu-row-theme')?.click());
            await page.waitForTimeout(700);
            await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
            await page.waitForTimeout(600);
        }
    },
    async 'swipe through characters list'() {
        await page.evaluate(() => document.querySelector('#rightNavHolder > .drawer-toggle')?.click());
        await page.waitForTimeout(800);
        await page.evaluate(() => document.getElementById('rm_button_characters')?.click());
        await page.waitForTimeout(600);
        await page.evaluate(async () => {
            const list = document.getElementById('rm_print_characters_block');
            const scroller = [list, list?.parentElement, document.getElementById('right-nav-panel')].find(el => el && el.scrollHeight > el.clientHeight + 10) ?? list;
            for (let i = 0; i < 80; i++) {
                scroller.scrollTop += 30;
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            scroller.scrollTop = 0;
        });
        await page.evaluate(() => document.querySelector('#rightNavHolder > .drawer-toggle')?.click());
        await page.waitForTimeout(500);
    },
};

async function setup() {
    await page.goto(ST_URL, { waitUntil: 'domcontentloaded' });
    await until(() => document.documentElement.classList.contains('stmui-on'), null, 90000);
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
        document.querySelectorAll('dialog.popup[open] .popup-button-cancel').forEach(button => button.click());
        document.querySelector('#stmui-sheet .stmui-done')?.click();
    });
    // Open the demo chat and make it long: 150 messages, only in this page.
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        const index = context.characters.findIndex(character => character.name === 'Seraphina');
        await context.selectCharacterById(String(index));
    });
    await until(() => document.querySelectorAll('#chat .mes').length > 1);
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        // Keep the test chat on disk exactly as it is.
        context.saveChat = async () => {};
        context.saveChatDebounced = () => {};
        const sample = context.chat.filter(message => !message.is_system).slice(0, 4);
        while (context.chat.length < 150) for (const message of sample) context.chat.push(structuredClone(message));
        await context.clearChat();
        await context.printMessages();
    });
    await until(() => document.querySelectorAll('#chat .mes').length >= 50);
    await page.waitForTimeout(1500);
}

const setPocketTavern = async on => {
    await page.evaluate(want => {
        const box = document.getElementById('stmui_enabled');
        if (box.checked !== want) box.click();
    }, on);
    await until(want => document.documentElement.classList.contains('stmui-on') === want, on);
    await page.waitForTimeout(1500);
};

const fmt = n => n.toFixed(0).padStart(6);
await setup();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: SLOWDOWN });

// PROFILE="part of a scenario name": profile that one scenario with Pocket Tavern on.
// Prints the busiest functions and what made the browser recalculate styles.
if (process.env.PROFILE) {
    const [name, run] = Object.entries(scenarios).find(([key]) => key.includes(process.env.PROFILE));
    await page.waitForTimeout(500);
    const events = [];
    cdp.on('Tracing.dataCollected', data => events.push(...data.value));
    const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
    await cdp.send('Profiler.start');
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking,disabled-by-default-devtools.timeline.stack', transferMode: 'ReportEvents' });
    await run();
    await cdp.send('Tracing.end');
    await done;
    const { profile } = await cdp.send('Profiler.stop');
    // Self time per function.
    const byId = new Map(profile.nodes.map(node => [node.id, node]));
    const self = new Map();
    const gap = profile.timeDeltas;
    profile.samples.forEach((id, index) => {
        const node = byId.get(id);
        const frame = node.callFrame;
        const file = frame.url.split('/').pop() || frame.url || '(native)';
        const key = `${frame.functionName || '(anonymous)'}  ${file}:${frame.lineNumber + 1}`;
        self.set(key, (self.get(key) ?? 0) + (gap[index] ?? 0) / 1000);
    });
    console.log(`Profile of "${name}" (ms of self time, CPU ${SLOWDOWN}× slower)
`);
    for (const [key, ms] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`${ms.toFixed(0).padStart(7)}  ${key}`);
    // Style recalcs: what invalidated them, and from where.
    const why = new Map();
    for (const event of events) {
        const data = event.args?.data;
        if (!data) continue;
        if (event.name === 'StyleInvalidatorInvalidationTracking' || event.name === 'StyleRecalcInvalidationTracking') {
            const what = data.changedClass ? `class .${data.changedClass}` : data.changedAttribute ? `attr [${data.changedAttribute}]` : data.changedPseudo ? `pseudo :${data.changedPseudo}` : data.reason ?? '?';
            const frame = data.stackTrace?.[0];
            const where = frame ? `${frame.functionName || '(anon)'} ${String(frame.url).split('/').pop()}:${frame.lineNumber}` : '';
            const key = `${what} on ${data.nodeName ?? '?'}  ← ${where}`;
            why.set(key, (why.get(key) ?? 0) + 1);
        }
    }
    // Where the browser's own time went (painting, compositing, decoding...).
    const byName = new Map();
    for (const event of events) if (event.dur && event.ph === 'X') {
        const entry = byName.get(event.name) ?? { ms: 0, count: 0 };
        entry.ms += event.dur / 1000;
        entry.count++;
        byName.set(event.name, entry);
    }
    console.log('\nBrowser work by kind:');
    for (const [key, entry] of [...byName].sort((a, b) => b[1].ms - a[1].ms).slice(0, 14)) console.log(`${entry.ms.toFixed(0).padStart(7)} ms ${String(entry.count).padStart(6)}×  ${key}`);
    let recalc = 0;
    let recalcCount = 0;
    for (const event of events) if (event.name === 'UpdateLayoutTree' && event.dur) { recalc += event.dur / 1000; recalcCount++; }
    console.log(`
Style recalcs: ${recalcCount}, ${recalc.toFixed(0)} ms. Top causes:`);
    for (const [key, count] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`${String(count).padStart(6)}  ${key}`);
    await browser.close();
    process.exit(0);
}

console.log(`CPU slowed down ${SLOWDOWN}×, ${ROUNDS} rounds, median shown. Times in ms of main-thread work.\n`);
console.log(`${'scenario'.padEnd(50)} ${'mode'.padEnd(5)}   total  script   style  layout blocked slowfr  worst`);
const results = {};
for (const [name, run] of Object.entries(scenarios)) {
    for (const on of [true, false]) {
        await setPocketTavern(on);
        const runs = [];
        for (let round = 0; round < ROUNDS; round++) runs.push(await measure(run));
        const median = key => runs.map(r => r[key]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
        const row = Object.fromEntries(Object.keys(runs[0]).map(key => [key, median(key)]));
        results[`${name}|${on}`] = row;
        console.log(`${name.padEnd(50)} ${(on ? 'on' : 'off').padEnd(5)} ${fmt(row.task)} ${fmt(row.script)} ${fmt(row.style)} ${fmt(row.layout)} ${fmt(row.blocked)} ${fmt(row.slowFrames)} ${fmt(row.worstFrame)}`);
    }
}
await setPocketTavern(true);
await browser.close();
