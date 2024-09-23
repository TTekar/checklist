
var data
var currentTemplate
var sectionNow

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

    title.addEventListener("input", () => {
        //! new section title to save after editing
        currentSection.name = title.textContent
        saveData(data)
    })

    inset.appendChild(title)
    inset.appendChild(document.createElement("hr"))


    currentSection.content.forEach(item => {
        if (item.type === "task") {
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

            taskSpan.addEventListener("input", () => {
                //! new text to save after editing
                item.name = taskSpan.textContent
                saveData(data)
            })

            const taksInput = document.createElement("input")
            taksInput.type = "checkbox"
            taksInput.checked = item.checked
            taksInput.addEventListener("click", (event) => {
                event.preventDefault()
            })

            const taskDelete = document.createElement("a")
            taskDelete.textContent = "delete"

            taskDelete.addEventListener("click", () => {
                currentSection.content = currentSection.content.filter(type => type !== item)
                saveData(data, true)
            })

            taskDelete.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })

            
            inset.appendChild(taskLabel)
            taskLabel.appendChild(taskSpan)
            taskLabel.appendChild(taksInput)
            taskLabel.appendChild(taskDelete)

        }else if (item.type === "group") {
            const groupTitle = document.createElement("h2")
            const groupTitleSpan = document.createElement("span")
            groupTitleSpan.textContent = item.name
            groupTitleSpan.setAttribute("contenteditable", "true")

            groupTitleSpan.addEventListener("keydown", (event) => {
                if (event.key === "Enter") event.preventDefault()
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
            groupDelete.textContent = "delete"

            groupDelete.addEventListener("click", () => {
                currentSection.content = currentSection.content.filter(type => type !== item)
                saveData(data, true)
            })

            groupDelete.addEventListener("mousedown", (event) => {
                event.preventDefault()
            })
            
            inset.appendChild(groupTitle)
            groupTitle.appendChild(groupTitleSpan)
            groupTitle.appendChild(groupDelete)
            inset.appendChild(tasksDiv)
            
            item.tasks.forEach(task => {
                const taskLabel = document.createElement("label")
                const taskSpan = document.createElement("span")
                taskSpan.textContent = task.name
                taskSpan.setAttribute("contenteditable", "true")

                taskLabel.addEventListener("click", (event) => { event.preventDefault() })

                taskSpan.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") event.preventDefault()
                })

                taskSpan.addEventListener("input", () => {
                    //! new text to save after editing
                    task.name = taskSpan.textContent
                    saveData(data)
                })

                const taksInput = document.createElement("input")
                taksInput.type = "checkbox"
                
                //~ Checklists feature
                // taksInput.addEventListener("change", () => {
                //     const allCheked = Array.from(tasksDiv.querySelectorAll("input[type='checkbox']")).every(input => input.checked)

                //     if (allCheked) {
                //         groupTitle.classList.add("all-checked")
                //     }else {
                //         groupTitle.classList.remove("all-checked")
                //     }
                // })

                taksInput.checked = task.checked
                taksInput.addEventListener("click", (event) => {
                    event.preventDefault()
                })

                const taskDelete = document.createElement("a")
                taskDelete.textContent = "delete"

                taskDelete.addEventListener("click", () => {
                    item.tasks = item.tasks.filter(t => t !== task)
                    saveData(data, true)
                })

                taskDelete.addEventListener("mousedown", (event) => {
                    event.preventDefault()
                })

                tasksDiv.appendChild(taskLabel)
                taskLabel.appendChild(taskSpan)
                taskLabel.appendChild(taksInput)
                taskLabel.appendChild(taskDelete)
            })
        }
    })

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