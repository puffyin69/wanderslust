(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        
        // Additional validation for price
        const priceInput = form.querySelector('input[name="price"]')
        if (priceInput && priceInput.value < 0) {
          event.preventDefault()
          event.stopPropagation()
          priceInput.setCustomValidity('Price must be positive!')
        } else if (priceInput) {
          priceInput.setCustomValidity('')
        }
        
        form.classList.add('was-validated')
      }, false)
    })
  })()