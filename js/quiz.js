(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const area = document.querySelector('#quizArea');
    if (!area) return;
    const availability = document.querySelector('#quizDisponibilidade');
    const questions = window.ACADEMIA_ESTUDO?.quiz;
    if (!questions?.length) { availability.textContent = 'Não foi possível carregar o quiz. Atualize a página.'; return; }
    const user = await window.Auth.currentUser();
    if (!user) { availability.textContent = 'Entre na Academia para responder ao quiz.'; return; }
    const key = `academia.quiz.${window.ACADEMIA_ESTUDO.version}.${user.id}`;
    const storage = document.querySelector('#quizArmazenamento');
    let answers = questions.map(() => null), index = 0;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && Array.isArray(saved.answers) && saved.answers.length === questions.length &&
        saved.answers.every(a => a === null || Number.isInteger(a) && a >= 0 && a < 5) &&
        Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= questions.length) {
        answers = saved.answers; index = saved.index;
        const firstMissing = answers.indexOf(null);
        if (firstMissing !== -1 && index > firstMissing) index = firstMissing;
      }
    } catch (_) { /* O quiz continua funcionando sem armazenamento local. */ }
    const form = document.querySelector('#quizForm');
    const options = document.querySelector('#quizOpcoes');
    const legend = document.querySelector('#quizPergunta');
    const feedback = document.querySelector('#quizFeedback');
    const status = document.querySelector('#quizStatus');
    const check = document.querySelector('#quizConferir');
    const previous = document.querySelector('#quizAnterior');
    const next = document.querySelector('#quizProxima');
    const result = document.querySelector('#quizResultado');

    function save() {
      try { localStorage.setItem(key, JSON.stringify({answers, index})); storage.textContent = 'Seu andamento fica guardado neste navegador.'; }
      catch (_) { storage.textContent = 'Você pode continuar respondendo nesta página.'; }
    }
    const p = (container, text, className) => { const node = document.createElement('p'); node.textContent = text; if (className) node.className = className; container.append(node); return node; };
    function faqLink(container, question) {
      const link = document.createElement('a'); link.href = `ajuda.html#faq-${question.faqId}`;
      link.textContent = 'Consultar esta orientação no FAQ'; container.append(link);
    }
    function render(focus = false) {
      const completed = answers.filter(a => a !== null).length;
      document.querySelector('#quizRespondidas').textContent = `${completed} de ${questions.length} respondidas`;
      const progress = document.querySelector('#quizBarra');
      progress.style.width = `${completed / questions.length * 100}%`;
      document.querySelector('#quizProgresso').setAttribute('aria-valuenow', String(completed));
      if (index === questions.length) { renderResult(focus); return; }
      form.hidden = false; result.hidden = true;
      const question = questions[index], selected = answers[index], checked = selected !== null;
      document.querySelector('#quizPosicao').textContent = `Questão ${index + 1} de ${questions.length}`;
      legend.textContent = question.question;
      options.replaceChildren(); status.textContent = '';
      question.options.forEach((option, n) => {
        const label = document.createElement('label'); label.className = 'quiz-option';
        const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'quizAnswer'; radio.value = String(n);
        radio.checked = selected === n; radio.disabled = checked;
        const copy = document.createElement('span'); copy.className = 'quiz-option-copy'; copy.textContent = `${option.letter}) ${option.text}`;
        if (checked && (n === question.correct || n === selected)) {
          label.dataset.result = n === question.correct ? 'correct' : 'wrong';
          const tag = document.createElement('span'); tag.className = 'quiz-option-tag';
          tag.textContent = n === question.correct ? selected === n ? 'Sua resposta · correta' : 'Resposta correta' : 'Sua resposta · incorreta';
          copy.append(tag);
        }
        label.append(radio, copy); options.append(label);
      });
      feedback.replaceChildren(); feedback.hidden = !checked;
      if (checked) {
        feedback.dataset.state = selected === question.correct ? 'success' : 'error';
        p(feedback, selected === question.correct ? 'Resposta correta.' : `Resposta incorreta. A alternativa correta é ${question.options[question.correct].letter}.`);
        p(feedback, question.explanation); faqLink(feedback, question);
      }
      check.hidden = checked; previous.disabled = index === 0;
      next.disabled = !checked; next.textContent = index === questions.length - 1 ? 'Ver resultado' : 'Próxima questão';
      if (focus) legend.focus();
    }
    function renderResult(focus) {
      form.hidden = true; result.hidden = false;
      document.querySelector('#quizPosicao').textContent = 'Quiz concluído';
      const score = answers.filter((a, n) => a === questions[n].correct).length;
      document.querySelector('#quizPercentual').textContent = `${Math.round(score / questions.length * 100)}%`;
      document.querySelector('#quizResumo').textContent = `Você acertou ${score} de ${questions.length} questões. ${score === questions.length ? 'Consulte o FAQ sempre que precisar retomar as orientações.' : 'Revise a correção abaixo e consulte as orientações do FAQ para as questões que errou.'}`;
      const review = document.querySelector('#quizRevisao'); review.replaceChildren();
      questions.forEach((question, n) => {
        const article = document.createElement('article');
        const h = document.createElement('h3'); h.textContent = `${n + 1}. ${question.question}`; article.append(h);
        const correct = answers[n] === question.correct;
        const label = p(article, correct ? 'Correta' : 'Revisar', 'review-status'); label.dataset.correct = String(correct);
        const option = question.options[answers[n]];
        p(article, `Sua resposta: ${option.letter}) ${option.text}`);
        if (!correct) p(article, `Resposta correta: ${question.options[question.correct].letter}) ${question.options[question.correct].text}`);
        p(article, question.explanation); faqLink(article, question); review.append(article);
      });
      if (focus) document.querySelector('#quizResultadoTitulo').focus();
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (index >= questions.length || answers[index] !== null) return;
      const selected = form.querySelector('input[name="quizAnswer"]:checked');
      if (!selected) { status.textContent = 'Selecione uma alternativa antes de conferir.'; options.querySelector('input')?.focus(); return; }
      answers[index] = Number(selected.value); save(); render();
      feedback.focus();
    });
    previous.addEventListener('click', () => { if (index > 0) { --index; save(); render(true); } });
    next.addEventListener('click', () => { if (index < questions.length && answers[index] !== null) { ++index; save(); render(true); } });
    document.querySelector('#quizRefazer').addEventListener('click', () => { answers = questions.map(() => null); index = 0; save(); render(true); });
    availability.hidden = true; area.hidden = false; save(); render();
  });
})();
