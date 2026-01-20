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

    // Drag and drop state
    let draggedElement = null;
    let draggedDate = null;

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

        // Enable/disable drag and drop
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.draggable = editModeEnabled;
            el.classList.toggle('draggable', editModeEnabled);
        });
    }

    // Drag and drop handlers
    function handleDragStart(e) {
        if (!editModeEnabled) return;

        draggedElement = e.target.closest('.timeline-event');
        if (!draggedElement) return;

        draggedDate = draggedElement.dataset.date;
        draggedElement.classList.add('dragging');

        // Highlight valid drop zones (same date events)
        document.querySelectorAll('.timeline-event').forEach(el => {
            if (el !== draggedElement && el.dataset.date === draggedDate) {
                el.classList.add('drop-zone-valid');
            }
        });

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedElement.dataset.eventId);
    }

    function handleDragOver(e) {
        if (!editModeEnabled || !draggedElement) return;

        const targetEvent = e.target.closest('.timeline-event');
        if (!targetEvent || targetEvent === draggedElement) return;

        // Only allow drops on same-date events
        if (targetEvent.dataset.date !== draggedDate) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Visual feedback for drop position
        const rect = targetEvent.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        // Remove existing indicators
        document.querySelectorAll('.drop-indicator-above, .drop-indicator-below').forEach(el => {
            el.classList.remove('drop-indicator-above', 'drop-indicator-below');
        });

        if (e.clientY < midpoint) {
            targetEvent.classList.add('drop-indicator-above');
        } else {
            targetEvent.classList.add('drop-indicator-below');
        }
    }

    function handleDragLeave(e) {
        const targetEvent = e.target.closest('.timeline-event');
        if (targetEvent) {
            targetEvent.classList.remove('drop-indicator-above', 'drop-indicator-below');
        }
    }

    function handleDrop(e) {
        if (!editModeEnabled || !draggedElement) return;

        e.preventDefault();

        const targetEvent = e.target.closest('.timeline-event');
        if (!targetEvent || targetEvent === draggedElement) return;

        // Only allow drops on same-date events
        if (targetEvent.dataset.date !== draggedDate) return;

        const rect = targetEvent.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midpoint;

        // Move the element in the DOM
        const timeline = document.querySelector('.timeline');
        if (insertBefore) {
            timeline.insertBefore(draggedElement, targetEvent);
        } else {
            timeline.insertBefore(draggedElement, targetEvent.nextSibling);
        }

        // Calculate new sort orders for all events with the same date
        updateSortOrders(draggedDate);
    }

    function handleDragEnd(e) {
        if (!draggedElement) return;

        draggedElement.classList.remove('dragging');

        // Clean up all visual indicators
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.classList.remove('drop-zone-valid', 'drop-indicator-above', 'drop-indicator-below');
        });

        draggedElement = null;
        draggedDate = null;
    }

    async function updateSortOrders(date) {
        // Get all events with this date in their current DOM order
        const eventElements = document.querySelectorAll(`.timeline-event[data-date="${date}"]`);
        const updates = [];

        eventElements.forEach((el, index) => {
            updates.push({
                id: parseInt(el.dataset.eventId, 10),
                sort_order: index
            });
        });

        try {
            const response = await fetch('/api/events/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to reorder events');
            }
        } catch (error) {
            alert('Error reordering events: ' + error.message);
            // Reload to restore original order
            window.location.reload();
        }
    }

    // Set up drag and drop event listeners
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);

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
