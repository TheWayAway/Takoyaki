// Super Admin Edit Mode functionality
(function() {
    'use strict';

    // DOM Elements
    const editModeBtn = document.getElementById('edit-mode-btn');
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const editForm = document.getElementById('edit-form');

    // Edit mode state
    let editModeEnabled = false;

    // Toggle edit mode
    function toggleEditMode() {
        editModeEnabled = !editModeEnabled;
        document.body.classList.toggle('edit-mode', editModeEnabled);
        editModeBtn.textContent = editModeEnabled ? 'Disable Edit Mode' : 'Enable Edit Mode';
        editModeBtn.classList.toggle('active', editModeEnabled);

        // Show/hide event IDs and action buttons
        document.querySelectorAll('.event-id, .event-actions').forEach(el => {
            el.classList.toggle('hidden', !editModeEnabled);
        });
    }

    // Open edit modal
    async function openEditModal(eventId) {
        try {
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch event');

            const event = await response.json();

            document.getElementById('edit-id').value = event.id;
            document.getElementById('edit-date').value = event.event_date;
            document.getElementById('edit-title').value = event.title;
            document.getElementById('edit-description').value = event.description || '';

            editModal.classList.remove('hidden');
        } catch (error) {
            alert('Error loading event: ' + error.message);
        }
    }

    // Close edit modal
    function closeEditModal() {
        editModal.classList.add('hidden');
        editForm.reset();
    }

    // Open delete modal
    function openDeleteModal(eventId, eventTitle) {
        document.getElementById('delete-id').value = eventId;
        document.querySelector('.delete-event-title').textContent = `"${eventTitle}"`;
        deleteModal.classList.remove('hidden');
    }

    // Close delete modal
    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
    }

    // Save event changes
    async function saveEvent(e) {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const data = {
            eventDate: document.getElementById('edit-date').value,
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value
        };

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update event');
            }

            window.location.reload();
        } catch (error) {
            alert('Error saving event: ' + error.message);
        }
    }

    // Delete event
    async function deleteEvent() {
        const id = document.getElementById('delete-id').value;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to delete event');
            }

            window.location.reload();
        } catch (error) {
            alert('Error deleting event: ' + error.message);
        }
    }

    // Event listeners
    if (editModeBtn) {
        editModeBtn.addEventListener('click', toggleEditMode);
    }

    // Edit button clicks (event delegation)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            const eventId = e.target.dataset.id;
            openEditModal(eventId);
        }

        if (e.target.classList.contains('btn-delete')) {
            const eventId = e.target.dataset.id;
            const eventCard = e.target.closest('.timeline-event');
            const eventTitle = eventCard.querySelector('.event-title').textContent;
            openDeleteModal(eventId, eventTitle);
        }
    });

    // Edit modal events
    if (editForm) {
        editForm.addEventListener('submit', saveEvent);
    }

    document.getElementById('edit-cancel')?.addEventListener('click', closeEditModal);
    editModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeEditModal);

    // Delete modal events
    document.getElementById('delete-confirm')?.addEventListener('click', deleteEvent);
    document.getElementById('delete-cancel')?.addEventListener('click', closeDeleteModal);
    deleteModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeDeleteModal);

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
    });
})();
