document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('detailsModal');
    const closeButton = document.querySelector('.modal .close-button');
    const viewButtons = document.querySelectorAll('.view-details-btn');
    const modalBody = document.getElementById('modalBody');

    viewButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const appId = this.getAttribute('data-id');
            try {
                const res = await fetch(`/admin/application/${appId}`);
                const app = await res.json();

                modalBody.innerHTML = `
                    <p><strong>College:</strong> ${app.collegeId?.name || "N/A"}</p>
                    <p><strong>Course:</strong> ${app.courseTitle}</p>
                    <p><strong>Type:</strong> ${app.affiliationType}</p>
                    <p><strong>Status:</strong> ${app.status}</p>
                    <p><strong>Description:</strong> ${app.description || "No description"}</p>
                    <p><strong>Visit Date:</strong> ${app.visitDate ? new Date(app.visitDate).toLocaleDateString() : "Not scheduled"}</p>
                    <p><strong>Recommendation:</strong> ${app.recommendation || "-"}</p>
                    <p><strong>Verification Notes:</strong> ${app.notes || "-"}</p>
                    <p><strong>Supporting Documents:</strong> 
                        ${app.documents && app.documents.length > 0 
                            ? app.documents.map(d => `<a href="/uploads/${d}" target="_blank">${d}</a>`).join(", ")
                            : "None"}
                    </p>`;
                modal.style.display = 'block';
            } catch (err) {
                modalBody.innerHTML = `<p style="color:red;">Error loading details.</p>`;
                modal.style.display = 'block';
            }
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
