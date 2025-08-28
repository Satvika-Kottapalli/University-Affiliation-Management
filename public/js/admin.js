document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('detailsModal');
    const closeButton = document.querySelector('.modal .close-button');
    const viewButtons = document.querySelectorAll('.view-details-btn');
    const modalBody = document.getElementById('modalBody');

    let currentAppId = null; // store selected appId

    viewButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const appId = this.getAttribute('data-id');
            currentAppId = appId;
            try {
                const res = await fetch(`/admin/application/${appId}`);
                const app = await res.json();

                modalBody.innerHTML = `
                    <p><strong>College:</strong> ${app.collegeId?.name || "N/A"}</p>
                    <p><strong>Course:</strong> ${app.courseTitle}</p>
                    <p><strong>Type:</strong> ${app.affiliationType}</p>
                    <p><strong>Status:</strong> ${app.status}</p>
                    <p><strong>Description:</strong> ${app.description || "No description"}</p>
                    <p><strong>Visit Date:</strong> ${app.verification?.siteVisitDate ? new Date(app.verification.siteVisitDate).toLocaleDateString() : "Not scheduled"}</p>
                    <p><strong>Recommendation:</strong> ${app.verification?.recommendation || "-"}</p>
                    <p><strong>Verification Notes:</strong> ${app.verification?.notes || "-"}</p>
                    <p><strong>Supporting Documents:</strong> 
                        ${app.verification?.supportingDocuments && app.verification.supportingDocuments.length > 0
                        ? app.verification.supportingDocuments.map(d => `<a href="${d}" target="_blank">${d.split('/').pop().split('-').slice(1).join('-')}</a>`).join("<br>")
                        : "None"}
                    </p>`;

                modal.style.display = 'block';
            } catch (err) {
                modalBody.innerHTML = `<p style="color:red;">Error loading details.</p>`;
                modal.style.display = 'block';
            }
        });
    });

    document.getElementById('approveBtn').addEventListener('click', () => updateStatus('Approved'));
    document.getElementById('rejectBtn').addEventListener('click', () => updateStatus('Rejected'));
    document.getElementById('resubmitBtn').addEventListener('click', () => updateStatus('Resubmission'));

    async function updateStatus(status) {
        if (!currentAppId) return;
        try {
            const res = await fetch(`/admin/application/${currentAppId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Application marked as ${status}`);
                modal.style.display = 'none';
                window.location.reload(); // refresh dashboard
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            alert("Error updating status");
        }
    }

    // Close modal
    closeButton.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == modal) modal.style.display = 'none'; });
});
