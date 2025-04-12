export const FormHandler = {
    setupForm(formId, submitHandler) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            await submitHandler(Object.fromEntries(formData));
        });
    },
    
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            form.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
        }
    }
};