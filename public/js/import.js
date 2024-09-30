document.addEventListener("DOMContentLoaded", function() {
    const importButton = document.getElementById("importButton");
    const importFileInput = document.getElementById("importFile");

    importButton.addEventListener("click", function() {
        importFileInput.click();
    });

    importFileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            const formData = new FormData();
            formData.append("file", file);

            fetch("http://localhost:3000/api/import-excel", {
                method: "POST",
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Import thành công!");
                    // Tải lại bảng dữ liệu sau khi import
                    fetchData(currentPage);
                } else {
                    alert("Có lỗi xảy ra khi import.");
                }
            })
            .catch(error => console.error("Lỗi:", error));
        } else {
            alert("Vui lòng chọn tệp Excel.");
        }
    });
});
