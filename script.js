document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const clearAllButton = document.getElementById('clearAllButton');

    addTaskButton.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskAction);
    clearAllButton.addEventListener('click', clearAllTasks);
    taskList.addEventListener('dragstart', dragStart);
    taskList.addEventListener('dragover', dragOver);
    taskList.addEventListener('drop', drop);
    taskList.addEventListener('dragend', dragEnd);

    loadTasksFromLocalStorage();

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const taskItem = createTaskElement(taskText);
            taskList.appendChild(taskItem);
            saveTaskToLocalStorage(taskText);
            taskInput.value = '';
        }
    }

    function createTaskElement(taskText) {
        const li = document.createElement('li');
        li.className = 'task draggable';
        li.draggable = true;

        const span = document.createElement('span');
        span.textContent = taskText;
        span.addEventListener('dblclick', () => editTask(span));
        li.appendChild(span);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fas fa-check"></i> Complete';
        completeButton.className = 'complete-btn';
        actions.appendChild(completeButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        actions.appendChild(deleteButton);

        li.appendChild(actions);

        return li;
    }

    function handleTaskAction(e) {
        if (e.target.closest('.complete-btn')) {
            toggleCompleteTask(e.target.closest('li'));
        } else if (e.target.closest('.delete-btn')) {
            deleteTask(e.target.closest('li'));
        }
    }

    function toggleCompleteTask(taskElement) {
        taskElement.classList.toggle('completed');
        updateTaskInLocalStorage(taskElement);
    }

    function deleteTask(taskElement) {
        taskList.removeChild(taskElement);
        removeTaskFromLocalStorage(taskElement);
    }

    function clearAllTasks() {
        taskList.innerHTML = '';
        localStorage.removeItem('tasks');
    }

    function saveTaskToLocalStorage(taskText) {
        const tasks = getTasksFromLocalStorage();
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTaskInLocalStorage(taskElement) {
        const tasks = getTasksFromLocalStorage();
        const taskText = taskElement.querySelector('span').textContent;
        const task = tasks.find(t => t.text === taskText);
        if (task) {
            task.completed = taskElement.classList.contains('completed');
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function removeTaskFromLocalStorage(taskElement) {
        const tasks = getTasksFromLocalStorage();
        const taskText = taskElement.querySelector('span').textContent;
        const updatedTasks = tasks.filter(t => t.text !== taskText);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }

    function getTasksFromLocalStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    function loadTasksFromLocalStorage() {
        const tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            const taskItem = createTaskElement(task.text);
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskList.appendChild(taskItem);
        });
    }

    // Drag and drop functionality
    let draggedItem = null;

    function dragStart(e) {
        draggedItem = e.target;
        e.target.classList.add('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(draggable);
        } else {
            taskList.insertBefore(draggable, afterElement);
        }
    }

    function drop() {
        draggedItem.classList.remove('dragging');
        updateLocalStorageOrder();
    }

    function dragEnd() {
        draggedItem = null;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateLocalStorageOrder() {
        const tasks = [];
        taskList.querySelectorAll('.task').forEach(taskElement => {
            const taskText = taskElement.querySelector('span').textContent;
            const completed = taskElement.classList.contains('completed');
            tasks.push({ text: taskText, completed: completed });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

        // Edit task functionality
        function editTask(taskElement) {
            const taskText = taskElement.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskText;
            input.className = 'edit-input';
            taskElement.parentElement.replaceChild(input, taskElement);
    
            input.addEventListener('blur', () => {
                taskElement.textContent = input.value;
                input.parentElement.replaceChild(taskElement, input);
                updateTaskInLocalStorage(taskElement.parentElement);
            });
    
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
    
            input.focus();
        }
    });
    
