//public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('detailsModal');
  const closeBtn = document.querySelector('.close-button');
  const modalBody = document.getElementById('modalBody');

  // Listen on all "View" buttons
  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const appId = button.getAttribute('data-id');

      try {
        // fetch application details
        const res = await fetch(`/college/application/${appId}`);
        const app = await res.json();

        if (app.error) {
          modalBody.innerHTML = `<p style="color:red;">${app.error}</p>`;
        } else {
          modalBody.innerHTML = `
              <h2>Application Details</h2>
              <p><strong>Course Title:</strong> ${app.courseTitle}</p>
              <p><strong>Duration:</strong> ${app.courseDuration}</p>
              <p><strong>Intake Capacity:</strong> ${app.intakeCapacity}</p>
              <p><strong>No. of Faculty:</strong> ${app.facultyCount}</p> <!-- ✅ updated -->
              <p><strong>Infrastructure:</strong> ${app.infrastructureDetails}</p>
              <p><strong>Course Fee:</strong> ₹${app.courseFee}</p>
              <p><strong>Affiliation Type:</strong> ${app.affiliationType}</p>
              <p><strong>Status:</strong> ${app.status}</p>
              <p><strong>Appraisal Status:</strong> ${app.appraisalStatus}</p>
              <p><strong>Documents:</strong><br>
             ${app.supportingDocuments.map(doc =>
             `<a href="${doc.replace('public', '')}" target="_blank">View File</a>`
             ).join('<br>')}
            </p>
          `;
        }

        modal.style.display = 'block';
      } catch (err) {
        modalBody.innerHTML = `<p style="color:red;">Error loading application details.</p>`;
        modal.style.display = 'block';
      }
    });
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
});
