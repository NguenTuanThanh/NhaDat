document.addEventListener('DOMContentLoaded', () => {
    const addPropertyForm = document.getElementById('add-property-form');
    
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            fetch('https://nguentuanthanh.github.io/api/properties/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Bất động sản đã được thêm thành công!');
                    window.location.href = 'dashboard.html';  // Chuyển hướng về trang dashboard
                } else {
                    alert('Đã xảy ra lỗi khi thêm bất động sản.');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
});
