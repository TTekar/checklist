
var data
var currentTemplate
var sectionNow

const TASK_TEMPLATE = {
    "checked": false,
    "name": "New task",
    "type": "task"
}

const GROUP_TEMPLATE = {
    "name": "New group",
    "tasks": [
        {
            "checked": false,
            "name": "New task",
            "type": "task"
        }
    ],
    "type": "group"
}

const VALUE_TEMPLATE = {
    "name": "New value",
    "type": "value",
    "unit": "unit",
    "value": ""
}

async function loadData() {
    const response = await fetch('/api/data');
    data = await response.json();

    currentTemplate =  data.templates.find(template => template.id === id)

    setSidebar()
    showSection(currentTemplate.sections[0].sectionId)
}

function setSidebar() {
    
    document.title = currentTemplate.name
    
    // set title
    const title = document.querySelector("#sidebar > .title")
    title.textContent = currentTemplate.name
    title.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault()
    })

    title.addEventListener("focus", () => {
        if (currentTemplate.name === "New template") {
            var range = document.createRange();
            range.selectNodeContents(title);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    })

    title.addEventListener("input", () => {
        //! new template title to save after editing
        currentTemplate.name = title.textContent
        saveData(data)
    })

    // create sections
    const ul = document.querySelector("#sidebar > ul.sections")

    ul.innerHTML = ""

    for (let i = 0; i < currentTemplate.sections.length; i++) {
        
        const currentSection = currentTemplate.sections[i]

        const li = document.createElement("li")
        li.classList.add("template-section")
        li.textContent = currentSection.name
        li.addEventListener("click", () => showSection(currentSection.sectionId))
        
        ul.appendChild(li)

    }

}

function showSection(sectionId) {

    sectionNow = sectionId
    const currentSection = currentTemplate.sections.find(section => section.sectionId === sectionId)

    const inset = document.querySelector("#content > .inset")

    inset.innerHTML = ""

    const title = document.createElement("h1")
    title.classList.add("title")
    title.textContent = currentSection.name
    title.setAttribute("contenteditable", "true")

    title.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault()
    })

    title.addEventListener("focus", () => {
        if (currentSection.name === "New section") {
            var range = document.createRange();
            range.selectNodeContents(title);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    })

    title.addEventListener("input", () => {
        //! new section title to save after editing
        currentSection.name = title.textContent
        saveData(data)
    })

    inset.appendChild(title)
    inset.appendChild(document.createElement("hr"))

    if (currentSection.content.length === 0) {
        currentSection.lastItemId++
        const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
        currentSection.content = [ newTemplate ]
        saveData(data, true)
    }

    currentSection.content.forEach((item, index) => {
        if (item.type === "task") {
            createTask(item, currentSection, inset, index, false, item)
        }else if (item.type === "group") {
            const groupTitle = document.createElement("h2")
            const groupTitleSpan = document.createElement("span")
            groupTitleSpan.textContent = item.name
            groupTitleSpan.setAttribute("contenteditable", "true")

            groupTitleSpan.addEventListener("keydown", (event) => {
                if (event.key === "Enter") event.preventDefault()
            })

            groupTitleSpan.addEventListener("focus", () => {
                if (item.name === "New group") {
                    var range = document.createRange();
                    range.selectNodeContents(groupTitleSpan);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            })

            groupTitleSpan.addEventListener("input", () => {
                //! new group title to save after editing
                item.name = groupTitleSpan.textContent
                saveData(data)
            })

            
            const tasksDiv = document.createElement("div")
            tasksDiv.setAttribute("data-for-group", item.name)
            
            //~ Checklists feature
            // groupTitle.addEventListener("click", () => {
            //     if (tasksDiv.style.display === "none") {
            //         tasksDiv.style.display = "block"
            //     }else {
            //         tasksDiv.style.display = "none"
            //     }
            // })

            const groupDelete = document.createElement("a")
            groupDelete.textContent = "-"

            groupDelete.addEventListener("click", () => {
                currentSection.content = currentSection.content.filter(type => type !== item)
                saveData(data, true)
            })

            groupDelete.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })
            

            // create task btn
            const taskCreate = document.createElement("a")
            taskCreate.textContent = "+T"
            
            taskCreate.addEventListener("click", () => {
                currentSection.lastItemId++
                const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
                currentSection.content.splice(index + 1, 0, newTemplate)
                saveData(data, true)
            })
        
            taskCreate.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })
        
            // create group btn
            const groupCreate = document.createElement("a")
        
            groupCreate.textContent = "+G"
        
            groupCreate.addEventListener("click", () => {
                currentSection.lastItemId++
                const newTemplate = { ...GROUP_TEMPLATE , id: currentSection.lastItemId }
                currentSection.lastItemId++
                newTemplate.tasks = newTemplate.tasks.map(task => {
                    return {
                        ...task,
                        id: currentSection.lastItemId
                    };
                });
                currentSection.content.splice(index + 1, 0, newTemplate)
                saveData(data, true)
            })
        
            groupCreate.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })
            
        
            // create value btn
            const valueCreate = document.createElement("a")
            valueCreate.textContent = "+V"
        
            valueCreate.addEventListener("click", () => {
                currentSection.lastItemId++
                const newTemplate = { ...VALUE_TEMPLATE , id: currentSection.lastItemId }
                currentSection.content.splice(index + 1, 0, newTemplate)
                saveData(data, true)
            })
           
            valueCreate.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })

            inset.appendChild(groupTitle)
            groupTitle.appendChild(groupTitleSpan)
            groupTitle.appendChild(groupCreate)
            groupTitle.appendChild(valueCreate)
            groupTitle.appendChild(taskCreate)
            groupTitle.appendChild(groupDelete)
            inset.appendChild(tasksDiv)
            
            item.tasks.forEach((task, indexG) => {
                if (task.type === "task") createTask(task, currentSection, tasksDiv, indexG, true, item)
                else if (task.type === "value") createValue(task, currentSection, tasksDiv, indexG, true, item)
            })

        }else if (item.type === "value") {
            createValue(item, currentSection, inset, index, false, item)
        }
    })
}

function createTask(item, currentSection, inset, index, inGroup, groupItem) {
    const taskLabel = document.createElement("label")
    const taskSpan = document.createElement("span")
    taskSpan.textContent = item.name
    taskSpan.setAttribute("contenteditable", "true")

    taskLabel.addEventListener("click", (event) => {
        event.preventDefault()
    })

    taskSpan.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault()
    })

    taskSpan.addEventListener("focus", () => {
        if (item.name === "New task") {
            var range = document.createRange();
            range.selectNodeContents(taskSpan);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    })

    taskSpan.addEventListener("input", () => {
        //! new text to save after editing
        item.name = taskSpan.textContent
        saveData(data)
    })

    const taskInput = document.createElement("input")
    taskInput.type = "checkbox"
    taskInput.tabIndex = "-1"
    taskInput.checked = item.checked
    taskInput.addEventListener("click", (event) => {
        event.preventDefault()
    })

    // delete btn
    const taskDelete = document.createElement("a")
    taskDelete.textContent = "-"

    if (!inGroup) {
        taskDelete.addEventListener("click", () => {
            currentSection.content = currentSection.content.filter(type => type !== item)
            saveData(data, true)
        })
    }else {
        // add logic for adding things in group
        taskDelete.addEventListener("click", () => {
            groupItem.tasks = groupItem.tasks.filter(t => t !== item)
            saveData(data, true)
        })
    }
    
    taskDelete.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })

    // create task btn
    const taskCreate = document.createElement("a")
    taskCreate.textContent = "+T"

    if (!inGroup) {
        taskCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }else {
        taskCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
            groupItem.tasks.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }

    taskCreate.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })

    // create group btn
    const groupCreate = document.createElement("a")
    if (!inGroup) {
        groupCreate.textContent = "+G"

        groupCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...GROUP_TEMPLATE , id: currentSection.lastItemId }
            currentSection.lastItemId++
            newTemplate.tasks = newTemplate.tasks.map(task => {
                return {
                    ...task,
                    id: currentSection.lastItemId
                };
            });
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })

        groupCreate.addEventListener("mousedown", (event) => {
            event.preventDefault()
        })
    }

    // create value btn
    const valueCreate = document.createElement("a")
    valueCreate.textContent = "+V"

    if (!inGroup) {
        valueCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...VALUE_TEMPLATE , id: currentSection.lastItemId }
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }else {
        valueCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...VALUE_TEMPLATE , id: currentSection.lastItemId }
            groupItem.tasks.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }

    valueCreate.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })
    
    inset.appendChild(taskLabel)
    taskLabel.appendChild(taskSpan)
    taskLabel.appendChild(taskInput)
    if (!inGroup) taskLabel.appendChild(groupCreate)
    taskLabel.appendChild(valueCreate)
    taskLabel.appendChild(taskCreate)
    taskLabel.appendChild(taskDelete)
}

function createValue(item, currentSection, inset, index, inGroup, groupItem) {
    const textLabel = document.createElement("label")
    const textSpan = document.createElement("span")
    textSpan.textContent = item.name
    textSpan.setAttribute("contenteditable", "true")

    textLabel.addEventListener("click", (event) => {
        event.preventDefault()
    })

    textSpan.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault()
    })

    textSpan.addEventListener("focus", () => {
        if (item.name === "New value") {
            var range = document.createRange();
            range.selectNodeContents(textSpan);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    })

    textSpan.addEventListener("input", () => {
        //! new text to save after editing
        item.name = textSpan.textContent
        saveData(data)
    })


    // text input
    const textInput = document.createElement("input")
    textInput.type = "text"
    textInput.tabIndex = "-1"
    textInput.placeholder = "value"
    textInput.addEventListener("click", (event) => {
        event.preventDefault()
    })

    // unit
    const unitSpan = document.createElement("span")
    unitSpan.textContent = item.unit
    unitSpan.classList.add("unit")
    unitSpan.setAttribute("contenteditable", "true")

    unitSpan.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault()
    })

    unitSpan.addEventListener("focus", () => {
        if (item.unit === "unit") {
            var range = document.createRange();
            range.selectNodeContents(unitSpan);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    })

    unitSpan.addEventListener("input", () => {
        //! new text to save after editing
        item.unit = unitSpan.textContent
        saveData(data)
    })


    // delete btn
    const valueDelete = document.createElement("a")
    valueDelete.textContent = "-"
    
    if (!inGroup) {
        valueDelete.addEventListener("click", () => {
            currentSection.content = currentSection.content.filter(type => type !== item)
            saveData(data, true)
        })
    }else {
        valueDelete.addEventListener("click", () => {
            groupItem.tasks = groupItem.tasks.filter(t => t !== item)
            saveData(data, true)
        })
    }

    valueDelete.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })
    
    // create task btn
    const taskCreate = document.createElement("a")
    taskCreate.textContent = "+T"

    if (!inGroup) {
        taskCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }else {
        taskCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...TASK_TEMPLATE , id: currentSection.lastItemId }
            groupItem.tasks.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }

    taskCreate.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })

    // create group btn
    const groupCreate = document.createElement("a")
    if (!inGroup) {
        groupCreate.textContent = "+G"

        groupCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...GROUP_TEMPLATE , id: currentSection.lastItemId }
            currentSection.lastItemId++
            newTemplate.tasks = newTemplate.tasks.map(task => {
                return {
                    ...task,
                    id: currentSection.lastItemId
                };
            });
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })

        groupCreate.addEventListener("mousedown", (event) => {
            event.preventDefault()
        })
    }

    // create value btn
    const valueCreate = document.createElement("a")
    valueCreate.textContent = "+V"

    if (!inGroup) {
        valueCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...VALUE_TEMPLATE , id: currentSection.lastItemId }
            currentSection.content.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }else {
        valueCreate.addEventListener("click", () => {
            currentSection.lastItemId++
            const newTemplate = { ...VALUE_TEMPLATE , id: currentSection.lastItemId }
            groupItem.tasks.splice(index + 1, 0, newTemplate)
            saveData(data, true)
        })
    }

    valueCreate.addEventListener("mousedown", (event) => {
        event.preventDefault()
    })

    
    inset.appendChild(textLabel)
    textLabel.appendChild(textSpan)
    if (!inGroup) textLabel.appendChild(groupCreate)
    textLabel.appendChild(valueCreate)
    textLabel.appendChild(taskCreate)
    textLabel.appendChild(valueDelete)
    textLabel.appendChild(unitSpan)
    textLabel.appendChild(textInput)
}

async function saveData(data, del = false) {
    await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    setSidebar()

    if (del) showSection(sectionNow)
}


loadData()