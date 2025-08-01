document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const forms = {
        info: document.getElementById('inscriptionForm'),
        payment: document.querySelector('.payment-step'),
        confirmation: document.querySelector('.confirmation-step')
    };
    
    // Initialisation
    initDate();
    setupFiliereAutre();
    setupEventListeners();

    function initDate() {
        const today = new Date();
        const dateStr = `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
        document.getElementById('current-date').textContent = dateStr;
        document.getElementById('date_hidden').value = today.toISOString();
        document.getElementById('confirm-date').textContent = dateStr;
    }

    function setupFiliereAutre() {
        document.querySelectorAll('input[name="filiere"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const autreInput = document.getElementById('autre_filiere');
                autreInput.disabled = this.value !== 'Autre';
                if(autreInput.disabled) autreInput.value = '';
                updateDureeFormation();
            });
        });
    }

    function updateDureeFormation() {
        const filiere = document.querySelector('input[name="filiere"]:checked');
        if(!filiere) return;
        
        const durees = {
            'Informatique': '6 mois',
            'Décoration': '3 mois',
            'Cuisine & Pâtisserie': '4 mois',
            'Maquillage': '2 mois',
            'Crochet': '1 mois',
            'Autre': 'À déterminer'
        };
        
        const duree = durees[filiere.value] || 'À déterminer';
        document.getElementById('duree').value = duree;
    }

    function setupEventListeners() {
        // Bouton Paiement
        document.getElementById('btnPaiement').addEventListener('click', validateStep1);
        
        // Bouton Retour
        document.querySelector('.prev-step').addEventListener('click', goBackToInfo);
        
        // Soumission Formspree
        forms.info.addEventListener('submit', handleFormSubmission);
        
        // Initialiser la durée
        document.querySelector('input[name="filiere"]').dispatchEvent(new Event('change'));
    }

    function validateStep1() {
        let isValid = true;
        
        // Valider champs requis
        document.querySelectorAll('#inscriptionForm [required]').forEach(field => {
            if(!validateField(field)) isValid = false;
        });

        if(isValid) {
            showPaymentStep();
            updateProgressBar(2);
        } else {
            alert('Veuillez remplir tous les champs obligatoires correctement.');
        }
    }

    function validateField(field) {
        let isValid = true;
        
        if(field.type === 'checkbox' && !field.checked) {
            isValid = false;
        } 
        else if(field.type === 'radio' && !document.querySelector(`input[name="${field.name}"]:checked`)) {
            isValid = false;
        } 
        else if(!field.value) {
            isValid = false;
        }
        
        field.style.borderColor = isValid ? '' : 'red';
        return isValid;
    }

    function showPaymentStep() {
        forms.info.classList.remove('active');
        forms.payment.classList.add('active');
        
        // Pré-remplir le nom dans la confirmation
        document.getElementById('confirm-name').textContent = 
            document.getElementById('nom').value.split(' ')[0];
    }

    function goBackToInfo() {
        forms.payment.classList.remove('active');
        forms.info.classList.add('active');
        updateProgressBar(1);
    }

    function handleFormSubmission(e) {
        e.preventDefault();
        
        const transactionId = document.getElementById('transaction_id').value;
        if(!/^\d{14}$/.test(transactionId)) {
            alert('Veuillez entrer un numéro de transaction valide (14 chiffres exactement).');
            return;
        }

        submitFormToFormspree();
    }

    function submitFormToFormspree() {
        const btn = document.getElementById('btnSubmit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        // Ajouter la transaction ID au formData
        const transactionInput = document.createElement('input');
        transactionInput.type = 'hidden';
        transactionInput.name = 'numero_transaction';
        transactionInput.value = document.getElementById('transaction_id').value;
        forms.info.appendChild(transactionInput);
        
        // Envoi via Formspree
        fetch(forms.info.action, {
            method: 'POST',
            body: new FormData(forms.info),
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if(response.ok) {
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