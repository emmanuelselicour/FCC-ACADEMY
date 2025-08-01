document.addEventListener('DOMContentLoaded', function() {
  const forms = {
    info: document.getElementById('inscriptionForm'),
    payment: document.querySelector('.payment-step'),
    confirmation: document.querySelector('.confirmation-step')
  };

  initDate();
  setupFiliereAutre();
  setupEventListeners();

  function initDate() {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const el1 = document.getElementById('current-date');
    const el2 = document.getElementById('confirm-date');
    if (el1) el1.textContent = dateStr;
    if (el2) el2.textContent = dateStr;
    document.getElementById('date_hidden').value = today.toISOString();
  }

  function setupFiliereAutre() {
    document.querySelectorAll('input[name="filiere"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const autreInput = document.getElementById('autre_filiere');
        autreInput.disabled = this.value !== 'Autre';
        if (autreInput.disabled) autreInput.value = '';
        updateDureeFormation();
      });
    });
  }

  function updateDureeFormation() {
    const filiere = document.querySelector('input[name="filiere"]:checked');
    if (!filiere) return;
    const durees = {
      'Informatique': '6 mois',
      'Décoration': '3 mois',
      'Cuisine & Pâtisserie': '4 mois',
      'Maquillage': '2 mois',
      'Crochet': '1 mois',
      'Autre': 'À déterminer'
    };
    document.getElementById('duree').value = durees[filiere.value] || 'À déterminer';
  }

  function setupEventListeners() {
    document.getElementById('btnPaiement').addEventListener('click', validateStep1);
    document.querySelector('.prev-step').addEventListener('click', goBackToInfo);
    forms.info.addEventListener('submit', handleFormSubmission);
    const firstFiliere = document.querySelector('input[name="filiere"]');
    if (firstFiliere) firstFiliere.dispatchEvent(new Event('change'));
  }

  function validateStep1() {
    let isValid = true;
    document.querySelectorAll('#inscriptionForm [required]').forEach(field => {
      if (!validateField(field)) isValid = false;
    });
    if (isValid) {
      showPaymentStep();
      updateProgressBar(2);
    } else {
      alert('Veuillez remplir tous les champs obligatoires correctement.');
    }
  }

  function validateField(field) {
    if (field.type === 'checkbox' && !field.checked) return false;
    if (field.type === 'radio') {
      return !!document.querySelector(`input[name="${field.name}"]:checked`);
    }
    return field.value.trim() !== '';
  }

  function showPaymentStep() {
    forms.info.classList.remove('active');
    forms.payment.classList.add('active');
    const nom = document.getElementById('nom');
    if (nom) document.getElementById('confirm-name').textContent = nom.value.split(' ')[0];
  }

  function goBackToInfo() {
    forms.payment.classList.remove('active');
    forms.info.classList.add('active');
    updateProgressBar(1);
  }

  function handleFormSubmission(e) {
    e.preventDefault();
    const transactionId = document.getElementById('transaction_id').value;
    if (!/^\d{14}$/.test(transactionId)) {
      alert('Veuillez entrer un numéro de transaction valide (14 chiffres exactement).');
      return;
    }
    submitFormToFormspree();
  }

  function submitFormToFormspree() {
    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    const transactionInput = document.createElement('input');
    transactionInput.type = 'hidden';
    transactionInput.name = 'numero_transaction';
    transactionInput.value = document.getElementById('transaction_id').value;
    forms.info.appendChild(transactionInput);

    fetch(forms.info.action, {
      method: 'POST',
      body: new FormData(forms.info),
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          showConfirmationStep();
        } else {
          throw new Error('Erreur lors de la soumission');
        }
      })
      .catch(error => {
        alert("Erreur: " + error.message);
        console.error("Erreur Formspree:", error);
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer ma candidature';
        forms.info.removeChild(transactionInput);
      });
  }

  function showConfirmationStep() {
    forms.payment.classList.remove('active');
    forms.confirmation.classList.add('active');
    updateProgressBar(3);
  }

  function updateProgressBar(step) {
    document.querySelectorAll('.progress-step').forEach((el, index) => {
      el.classList.toggle('active', index < step);
    });
  }
});
