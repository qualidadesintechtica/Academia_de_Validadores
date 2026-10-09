(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('#faqLista');
    if (!list) return;
    const content = window.ACADEMIA_ESTUDO?.faq;
    const count = document.querySelector('#faqContagem');
    if (!content) { count.textContent = 'Não foi possível carregar o FAQ. Atualize a página.'; return; }
    const search = document.querySelector('#faqBusca');
    const category = document.querySelector('#faqCategoria');
    const expand = document.querySelector('#faqExpandir');
    const empty = document.querySelector('#faqVazio');
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const entries = [];
    function addText(container, text) {
      const linkPattern = /https:\/\/[^\s]+/g;
      let match, start = 0;
      while ((match = linkPattern.exec(text))) {
        container.append(document.createTextNode(text.slice(start, match.index)));
        const link = document.createElement('a'); link.href = match[0]; link.textContent = match[0];
        link.target = '_blank'; link.rel = 'noopener noreferrer'; container.append(link);
        start = match.index + match[0].length;
      }
      container.append(document.createTextNode(text.slice(start)));
    }
    for (const item of content) {
      const details = document.createElement('details'); details.className = 'faq-item'; details.id = `faq-${item.id}`;
      const summary = document.createElement('summary');
      const number = document.createElement('span'); number.className = 'faq-number'; number.textContent = `${item.id}.`;
      summary.append(number, document.createTextNode(item.question));
      const answer = document.createElement('div'); answer.className = 'faq-answer';
      const tag = document.createElement('span'); tag.className = 'faq-category'; tag.textContent = item.category; answer.append(tag);
      for (const block of item.blocks) {
        if (block.type === 'list') {
          const ordered = document.createElement('ol');
          for (const text of block.items) { const li = document.createElement('li'); addText(li, text); ordered.append(li); }
          answer.append(ordered);
        } else { const p = document.createElement('p'); addText(p, block.text); answer.append(p); }
      }
      details.append(summary, answer); list.append(details);
      entries.push({details, item, text: normalize(`${item.question} ${item.blocks.map(b => b.text || b.items.join(' ')).join(' ')}`)});
      details.addEventListener('toggle', refreshExpand);
    }
    function refreshExpand() {
      const visible = entries.filter(e => !e.details.hidden);
      expand.disabled = !visible.length;
      expand.textContent = visible.length && visible.every(e => e.details.open) ? 'Recolher respostas' : 'Expandir respostas';
    }
    function filter() {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let found = 0;
      for (const e of entries) {
        e.details.hidden = (category.value && e.item.category !== category.value) || !terms.every(t => e.text.includes(t));
        if (!e.details.hidden) ++found;
      }
      empty.hidden = found > 0;
      count.textContent = `${found} de ${content.length} perguntas encontradas`;
      refreshExpand();
    }
    search.addEventListener('input', filter); category.addEventListener('change', filter);
    document.querySelector('#faqLimpar').addEventListener('click', () => { search.value = ''; category.value = ''; filter(); search.focus(); });
    expand.addEventListener('click', () => {
      const visible = entries.filter(e => !e.details.hidden);
      const open = !visible.every(e => e.details.open);
      visible.forEach(e => { e.details.open = open; }); refreshExpand();
    });
    function openReference() {
      const reference = entries.find(e => `#faq-${e.item.id}` === location.hash);
      if (!reference) return;
      search.value = ''; category.value = ''; filter(); reference.details.open = true;
      requestAnimationFrame(() => reference.details.scrollIntoView({block: 'start'}));
    }
    window.addEventListener('hashchange', openReference);
    filter(); openReference();
  });
})();
