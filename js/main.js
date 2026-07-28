/* ==========================================================================
   JS — organizado por funcionalidade. JavaScript puro, sem bibliotecas.
   ========================================================================== */
(function(){
  'use strict';
  var dl = window.dataLayer = window.dataLayer || [];
  function enviarEvento(nome, dados){ dl.push(Object.assign({event:nome}, dados||{})); }

  /* ---------- 1. Menu mobile ---------- */
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav-principal');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var aberto = nav.classList.toggle('is-aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    });
    nav.addEventListener('click', function(e){
      if(e.target.closest('a')){ nav.classList.remove('is-aberto'); toggle.setAttribute('aria-expanded','false'); }
    });
  }

  /* ---------- 2. Header inteligente no scroll ---------- */
  var cabecalho = document.getElementById('cabecalho');
  var topoBtn = document.getElementById('topo-btn');
  var ticking = false;
  function aoRolar(){
    var y = window.scrollY;
    if(cabecalho) cabecalho.classList.toggle('is-scrolled', y > 8);
    if(topoBtn) topoBtn.classList.toggle('is-visivel', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ window.requestAnimationFrame(aoRolar); ticking = true; }
  }, {passive:true});

  /* ---------- 3. Voltar ao topo ---------- */
  if(topoBtn){
    topoBtn.addEventListener('click', function(){
      window.scrollTo({top:0, behavior:'smooth'});
      enviarEvento('clique_voltar_ao_topo');
    });
  }

  /* ---------- 4. FAQ expansível (acessível) ---------- */
  document.querySelectorAll('.faq__botao').forEach(function(botao){
    botao.addEventListener('click', function(){
      var aberto = botao.getAttribute('aria-expanded') === 'true';
      var resposta = document.getElementById(botao.getAttribute('aria-controls'));
      botao.setAttribute('aria-expanded', String(!aberto));
      if(resposta) resposta.setAttribute('data-aberto', String(!aberto));
      if(!aberto) enviarEvento('abrir_faq', {faq_pergunta: botao.textContent.trim()});
    });
  });

  /* ---------- 5. Animações de revelação + contadores ---------- */
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alvos = document.querySelectorAll('.revelar');
  if(reduzir || !('IntersectionObserver' in window)){
    alvos.forEach(function(el){ el.classList.add('is-visivel'); });
    document.querySelectorAll('[data-contador]').forEach(function(el){ el.textContent = el.dataset.contador; });
  } else {
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(entrada){
        if(!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visivel');
        entrada.target.querySelectorAll('[data-contador]').forEach(animarContador);
        obs.unobserve(entrada.target);
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    alvos.forEach(function(el){ obs.observe(el); });
  }
  function animarContador(el){
    var alvo = parseInt(el.dataset.contador, 10) || 0, atual = 0, passo = Math.max(1, Math.round(alvo/40));
    (function tick(){
      atual = Math.min(alvo, atual + passo);
      el.textContent = String(atual);
      if(atual < alvo) requestAnimationFrame(tick);
    })();
  }

  /* ---------- 6. Rastreamento de cliques (GTM / GA4 / Pixel) ---------- */
  document.addEventListener('click', function(e){
    var alvo = e.target.closest('[data-evento]');
    if(!alvo) return;
    enviarEvento(alvo.dataset.evento, {
      local: alvo.dataset.local || 'nao_informado',
      texto: (alvo.textContent || '').trim().slice(0,60),
      destino: alvo.getAttribute('href') || ''
    });
  });

  /* ---------- 7. Rastreamento de scroll (25/50/75/100%) ---------- */
  var marcos = [25,50,75,100], enviados = {};
  window.addEventListener('scroll', function(){
    var doc = document.documentElement;
    var pct = Math.round((window.scrollY + window.innerHeight) / doc.scrollHeight * 100);
    marcos.forEach(function(m){
      if(pct >= m && !enviados[m]){ enviados[m] = true; enviarEvento('scroll_profundidade', {percentual:m}); }
    });
  }, {passive:true});

  /* ---------- 8. Visualização de seções principais ---------- */
  if('IntersectionObserver' in window){
    var vistas = {};
    var obsSecoes = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){
        if(en.isIntersecting && !vistas[en.target.id]){
          vistas[en.target.id] = true;
          enviarEvento('visualizacao_secao', {secao: en.target.id});
        }
      });
    }, {threshold:0.35});
    ['servicos','portfolio','depoimentos','faq','contato'].forEach(function(id){
      var el = document.getElementById(id); if(el) obsSecoes.observe(el);
    });
  }

  /* ---------- 9. Validação do formulário ---------- */
  var form = document.getElementById('form-contato');
  if(form){
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var valido = true;
      function validar(id, teste){
        var campo = document.getElementById(id), wrapper = campo.closest('.campo');
        var ok = teste(campo.value.trim());
        if(wrapper) wrapper.classList.toggle('is-invalido', !ok);
        campo.setAttribute('aria-invalid', String(!ok));
        if(!ok && valido){ campo.focus(); }
        if(!ok) valido = false;
      }
      validar('nome', function(v){ return v.length >= 3; });
      validar('whatsapp', function(v){ return v.replace(/\D/g,'').length >= 10; });
      validar('email', function(v){ return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); });
      var consent = document.getElementById('consentimento');
      if(!consent.checked){ valido = false; consent.focus(); }

      if(!valido){ status.textContent = 'Verifique os campos destacados antes de enviar.'; status.style.color = '#C0261F'; return; }

      status.style.color = '';
      status.textContent = 'Mensagem enviada! Retornaremos em breve.';
      enviarEvento('envio_formulario_sucesso', {formulario:'contato'});
      form.reset();
      /* Integre aqui o endpoint do seu serviço de formulários (ex.: Formspree, Basin, API própria). */
    });
  }

  /* ---------- 10. Banner de cookies (LGPD) ---------- */
  var banner = document.getElementById('banner-cookies');
  var CHAVE = 'consentimento_cookies';
  try{
    if(banner && !localStorage.getItem(CHAVE)){ banner.classList.add('is-visivel'); }
    function responder(valor){
      try{ localStorage.setItem(CHAVE, valor); }catch(err){}
      banner.classList.remove('is-visivel');
      enviarEvento('consentimento_cookies', {escolha: valor});
    }
    var aceitar = document.getElementById('cookies-aceitar');
    var rejeitar = document.getElementById('cookies-rejeitar');
    if(aceitar) aceitar.addEventListener('click', function(){ responder('aceito'); });
    if(rejeitar) rejeitar.addEventListener('click', function(){ responder('rejeitado'); });
  }catch(err){}

  /* ---------- 11. Utilitários ---------- */
  var ano = document.getElementById('ano-atual');
  if(ano) ano.textContent = new Date().getFullYear();
})();
