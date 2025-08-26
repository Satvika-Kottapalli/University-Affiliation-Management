document.addEventListener('DOMContentLoaded', function () {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dashboard-section');

    // Function to show the target section and hide others
    function showSection(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    // Initially show the 'My Profile' section
    showSection('my-profile');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            // Don't prevent default for the logout link
            if (this.getAttribute('href') === '/logout') {
                return;
            }
            event.preventDefault();

            // Handle active class
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Show the corresponding section
            const targetId = this.getAttribute('href').substring(1); // remove the '#'
            showSection(targetId);
        });
    });
});
