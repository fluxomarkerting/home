// =====================================================
// MENU SANDUÍCHE (MOBILE)
// =====================================================
(function(){
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', function(){
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  // fecha o menu ao clicar em qualquer link
  menu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// =====================================================
// VSL — FACADE LAZY-LOAD
// Só carrega o player pesado do YouTube quando a visitante
// clica em play. Até lá, é só uma imagem leve (thumbnail).
// =====================================================
(function(){
  const wrap = document.getElementById('vslWrap');
  if(!wrap) return;
  const playBtn = wrap.querySelector('.vsl-play');
  function loadVideo(){
    const videoId = wrap.dataset.videoId;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
    iframe.title = 'Assista e conheça a MSA Turbo';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    wrap.innerHTML = '';
    wrap.appendChild(iframe);
  }
  wrap.addEventListener('click', loadVideo);
  playBtn && playBtn.addEventListener('keyup', function(e){
    if(e.key === 'Enter' || e.key === ' ') loadVideo();
  });
})();

// =====================================================
// CONTADOR REGRESSIVO DA OFERTA
// =====================================================
(function(){
  const minEl = document.getElementById('min');
  const secEl = document.getElementById('sec');
  if(!minEl || !secEl) return;
  const totalSeconds = 15 * 60;
  let remaining = totalSeconds;
  setInterval(function(){
    remaining = remaining > 0 ? remaining - 1 : totalSeconds;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    minEl.textContent = String(m).padStart(2,'0');
    secEl.textContent = String(s).padStart(2,'0');
  }, 1000);
})();

// =====================================================
// CARROSSEL DE MÓDULOS
// =====================================================
(function(){
  const track = document.querySelector('.carousel');
  if(!track) return;
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');
  const step = 220;
  prev && prev.addEventListener('click', () => track.scrollBy({left:-step, behavior:'smooth'}));
  next && next.addEventListener('click', () => track.scrollBy({left:step, behavior:'smooth'}));
})();

// =====================================================
// POP-UP DE ABANDONO DE PÁGINA (EXIT INTENT)
// Captura Nome, E-mail e WhatsApp antes da lead sair.
// =====================================================
(function(){
  const overlay = document.getElementById('exitOverlay');
  if(!overlay) return;
  const closeBtn = overlay.querySelector('.close');
  const form = document.getElementById('exitForm');
  const STORAGE_KEY = 'msa_exit_popup_shown';
  let alreadyShown = sessionStorage.getItem(STORAGE_KEY);

  // -----------------------------------------------------------
  // MÁSCARA DO CAMPO WHATSAPP — aceita só números, formata como
  // (11) 91234-5678 e ignora qualquer letra/símbolo digitado ou colado.
  // -----------------------------------------------------------
  const whatsInput = document.getElementById('exitWhats');
  const errWhats = document.getElementById('errWhats');
  function formatPhone(digits){
    digits = digits.slice(0, 11);
    if(digits.length > 10){
      return digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if(digits.length > 6){
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if(digits.length > 2){
      return digits.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if(digits.length > 0){
      return digits.replace(/^(\d*)/, '($1');
    }
    return '';
  }
  if(whatsInput){
    whatsInput.addEventListener('input', function(){
      const digitsOnly = whatsInput.value.replace(/\D/g, '');
      whatsInput.value = formatPhone(digitsOnly);
      const valid = digitsOnly.length >= 10 && digitsOnly.length <= 11;
      errWhats.classList.toggle('show', whatsInput.value.length > 0 && !valid);
    });
    // bloqueia teclas que não sejam números/navegação antes mesmo de digitar
    whatsInput.addEventListener('keypress', function(e){
      if(!/[0-9]/.test(e.key)) e.preventDefault();
    });
    whatsInput.addEventListener('paste', function(e){
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      if(/\D/.test(pasted.replace(/[()\-\s]/g, ''))){
        e.preventDefault();
        whatsInput.value = formatPhone(pasted.replace(/\D/g, ''));
      }
    });
  }

  // -----------------------------------------------------------
  // VALIDAÇÃO DO CAMPO E-MAIL — bloqueia caracteres que nunca
  // aparecem num e-mail (espaço, acentos, vírgula etc.) enquanto
  // a pessoa digita, e valida o formato completo em tempo real.
  // -----------------------------------------------------------
  const emailInput = document.getElementById('exitEmail');
  const errEmail = document.getElementById('errEmail');
  const EMAIL_ALLOWED = /[a-zA-Z0-9._%+\-@]/;
  const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if(emailInput){
    emailInput.addEventListener('keypress', function(e){
      if(!EMAIL_ALLOWED.test(e.key)) e.preventDefault();
    });
    emailInput.addEventListener('input', function(){
      emailInput.value = emailInput.value.replace(/[^a-zA-Z0-9._%+\-@]/g, '');
      const valid = EMAIL_PATTERN.test(emailInput.value);
      errEmail.classList.toggle('show', emailInput.value.length > 0 && !valid);
    });
  }

  function showPopup(){
    if(alreadyShown) return;
    overlay.classList.add('show');
    alreadyShown = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
  }
  function hidePopup(){
    overlay.classList.remove('show');
  }

  // Dispara quando o mouse sai pela parte de cima da tela (desktop)
  document.addEventListener('mouseout', function(e){
    if(!e.relatedTarget && e.clientY <= 0){
      showPopup();
    }
  });

  // Dispara em mobile após um tempo de leitura (sem "mouse leave" em touch)
  setTimeout(showPopup, 45000);

  closeBtn && closeBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) hidePopup();
  });

  form && form.addEventListener('submit', function(e){
    e.preventDefault();

    const digitsOnly = whatsInput ? whatsInput.value.replace(/\D/g, '') : '';
    const emailValid = emailInput ? EMAIL_PATTERN.test(emailInput.value) : true;
    const phoneValid = digitsOnly.length >= 10 && digitsOnly.length <= 11;

    if(!emailValid){ errEmail.classList.add('show'); emailInput.focus(); return; }
    if(!phoneValid){ errWhats.classList.add('show'); whatsInput.focus(); return; }

    // -----------------------------------------------------------
    // INTEGRAÇÃO: troque este bloco pelo envio para o seu CRM/e-mail
    // marketing (RD Station, ActiveCampaign, Mailchimp, planilha via
    // Zapier/Make, webhook próprio etc.). Exemplo com fetch:
    //
    // fetch('https://SEU-ENDPOINT-AQUI', {
    //   method: 'POST',
    //   headers: {'Content-Type':'application/json'},
    //   body: JSON.stringify({
    //     nome: form.nome.value,
    //     email: form.email.value,
    //     whatsapp: form.whatsapp.value
    //   })
    // });
    // -----------------------------------------------------------
    alert('Obrigado! Em breve você receberá a oferta no seu e-mail/WhatsApp.');
    hidePopup();
  });
})();
